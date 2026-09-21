import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { FinalProposalDocument } from "./finalProposalTypes";

const PAGE_MARGIN = 14;
const CONTENT_TOP = 31;
const CONTENT_BOTTOM = 278;
const NAVY: [number, number, number] = [11, 31, 73];
const BLUE: [number, number, number] = [19, 101, 170];
const LIGHT_BLUE: [number, number, number] = [237, 244, 253];
const SLATE: [number, number, number] = [71, 85, 105];
const LIGHT_SLATE: [number, number, number] = [226, 232, 240];
const TOTAL_PAGES_TOKEN = "{total_pages_count_string}";

type JsPdfWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } };

const safeDate = (value?: string, includeTime = false): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : {}),
  }).format(date);
};

export const formatProposalCurrency = (value: number, currency: string): string => {
  const currencyCode = /^[A-Z]{3}$/.test(currency) ? currency : "OMR";
  const decimals = currencyCode === "OMR" ? 3 : 2;
  const formattedValue = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${currencyCode} ${formattedValue}`;
};

export const getFinalProposalFileName = (tenderNumber: string): string => {
  const safeTenderNumber = tenderNumber
    .trim()
    .replace(/[<>:"/\\|?*]/g, "_")
    .split("")
    .map((character) => (character.charCodeAt(0) < 32 ? "_" : character))
    .join("")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_") || "Tender";
  return `MPC_${safeTenderNumber}_Final_Proposal.pdf`;
};

const drawPageHeader = (pdf: jsPDF, tenderNumber: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, pageWidth, 19, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("MUSCAT PHARMACY AND STORES LLC", pageWidth - PAGE_MARGIN, 8, {
    align: "right",
  });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("FINAL TENDER PROPOSAL / QUOTATION", pageWidth - PAGE_MARGIN, 13, {
    align: "right",
  });
  pdf.text(tenderNumber, PAGE_MARGIN, 11);
};

const drawPageFooter = (
  pdf: jsPDF,
  tenderNumber: string,
  pageNumber: number,
  pageCount: number | string,
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(...LIGHT_SLATE);
  pdf.line(PAGE_MARGIN, pageHeight - 13, pageWidth - PAGE_MARGIN, pageHeight - 13);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...SLATE);
  pdf.text(`Tender Reference: ${tenderNumber}`, PAGE_MARGIN, pageHeight - 8);
  pdf.text(
    `Page ${pageNumber} of ${pageCount}`,
    pageWidth - PAGE_MARGIN,
    pageHeight - 8,
    { align: "right" },
  );
};

const sectionHeading = (pdf: jsPDF, title: string, y: number): number => {
  pdf.setTextColor(...NAVY);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(title, PAGE_MARGIN, y);
  pdf.setDrawColor(...BLUE);
  pdf.setLineWidth(0.7);
  pdf.line(PAGE_MARGIN, y + 2.5, PAGE_MARGIN + 27, y + 2.5);
  return y + 7;
};

const decorateCurrentPage = (pdf: jsPDF, tenderNumber: string) => {
  const pageNumber = pdf.getNumberOfPages();
  drawPageHeader(pdf, tenderNumber);
  drawPageFooter(pdf, tenderNumber, pageNumber, TOTAL_PAGES_TOKEN);
};

const ensureSpace = (
  pdf: jsPDF,
  y: number,
  requiredHeight: number,
  tenderNumber: string,
): number => {
  if (y + requiredHeight <= CONTENT_BOTTOM) return y;
  pdf.addPage();
  decorateCurrentPage(pdf, tenderNumber);
  return CONTENT_TOP;
};

const tableFinalY = (pdf: jsPDF): number =>
  (pdf as JsPdfWithAutoTable).lastAutoTable.finalY;

export const generateFinalProposalPdf = (document: FinalProposalDocument): Blob => {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = CONTENT_TOP;
  decorateCurrentPage(pdf, document.tenderNumber);

  pdf.setTextColor(...NAVY);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.text("FINAL TENDER PROPOSAL / QUOTATION", PAGE_MARGIN, y);
  y += 8;
  pdf.setFontSize(11);
  const titleLines = pdf.splitTextToSize(document.tenderTitle, pageWidth - PAGE_MARGIN * 2 - 35);
  pdf.text(titleLines, PAGE_MARGIN, y);
  const titleHeight = titleLines.length * 5;
  pdf.setFillColor(220, 252, 231);
  pdf.setDrawColor(134, 239, 172);
  pdf.roundedRect(pageWidth - PAGE_MARGIN - 29, y - 4.5, 29, 8, 2, 2, "FD");
  pdf.setTextColor(21, 128, 61);
  pdf.setFontSize(8);
  pdf.text("APPROVED", pageWidth - PAGE_MARGIN - 14.5, y + 0.5, { align: "center" });
  y += Math.max(titleHeight, 7) + 3;

  y = sectionHeading(pdf, "TENDER INFORMATION", y);
  const tenderDetails: Array<[string, string, string, string]> = [
    [
      "Tender Reference",
      document.tenderNumber,
      "Purchase Requisition ID",
      document.purchaseRequisitionId ?? "-",
    ],
    [
      "Buyer / Customer",
      document.buyerName ?? "-",
      "Department",
      document.department ?? "-",
    ],
    [
      "Organisation",
      document.buyerOrganization ?? "-",
      "Closing Date",
      safeDate(document.closingDate) ?? "-",
    ],
    ["Currency", document.currency, "Status", "APPROVED"],
  ];
  autoTable(pdf, {
    startY: y,
    body: tenderDetails,
    theme: "grid",
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: { font: "helvetica", fontSize: 8.2, cellPadding: 2.4, lineColor: LIGHT_SLATE },
    columnStyles: {
      0: { fontStyle: "bold", textColor: SLATE, fillColor: [248, 250, 252], cellWidth: 36 },
      1: { textColor: NAVY, cellWidth: 55 },
      2: { fontStyle: "bold", textColor: SLATE, fillColor: [248, 250, 252], cellWidth: 36 },
      3: { textColor: NAVY },
    },
    willDrawPage: () => decorateCurrentPage(pdf, document.tenderNumber),
  });
  y = tableFinalY(pdf) + 8;

  if (document.description) {
    y = ensureSpace(pdf, y, 28, document.tenderNumber);
    y = sectionHeading(pdf, "SCOPE / DESCRIPTION", y);
    autoTable(pdf, {
      startY: y,
      body: [[document.description]],
      theme: "plain",
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        textColor: SLATE,
        cellPadding: { top: 1, right: 0, bottom: 2, left: 0 },
        overflow: "linebreak",
      },
      willDrawPage: () => decorateCurrentPage(pdf, document.tenderNumber),
    });
    y = tableFinalY(pdf) + 8;
  }

  y = ensureSpace(pdf, y, 28, document.tenderNumber);
  y = sectionHeading(pdf, "PROPOSAL / BOQ ITEMS", y);
  autoTable(pdf, {
    startY: y,
    head: [["#", "Product Code", "Medicine / Supply Name", "Quantity", "Approved Final Value"]],
    body: document.items.map((item, index) => [
      index + 1,
      item.productCode,
      item.name,
      new Intl.NumberFormat("en-GB", { maximumFractionDigits: 3 }).format(item.quantity),
      formatProposalCurrency(item.finalValue, document.currency),
    ]),
    theme: "grid",
    showHead: "everyPage",
    rowPageBreak: "avoid",
    margin: { top: CONTENT_TOP, bottom: 20, left: PAGE_MARGIN, right: PAGE_MARGIN },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 2.5,
    },
    bodyStyles: {
      font: "helvetica",
      fontSize: 8,
      textColor: NAVY,
      lineColor: LIGHT_SLATE,
      cellPadding: 2.3,
      overflow: "linebreak",
      valign: "middle",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" },
      1: { cellWidth: 31 },
      2: { cellWidth: 72 },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 48, halign: "right" },
    },
    willDrawPage: () => decorateCurrentPage(pdf, document.tenderNumber),
  });
  y = tableFinalY(pdf) + 9;

  y = ensureSpace(pdf, y, 35, document.tenderNumber);
  y = sectionHeading(pdf, "COMMERCIAL SUMMARY", y);
  const commercialRows: Array<[string, string]> = [];
  if (typeof document.estimatedContractValue === "number") {
    commercialRows.push([
      "Estimated Contract Value",
      formatProposalCurrency(document.estimatedContractValue, document.currency),
    ]);
  }
  commercialRows.push([
    "Final Bid Value",
    formatProposalCurrency(document.finalBidValue, document.currency),
  ]);
  autoTable(pdf, {
    startY: y,
    body: commercialRows,
    theme: "grid",
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 3, lineColor: LIGHT_SLATE },
    columnStyles: {
      0: { fontStyle: "bold", textColor: SLATE, fillColor: [248, 250, 252] },
      1: { fontStyle: "bold", textColor: NAVY, halign: "right" },
    },
    willDrawPage: () => decorateCurrentPage(pdf, document.tenderNumber),
  });
  y = tableFinalY(pdf) + 9;

  y = ensureSpace(pdf, y, 36, document.tenderNumber);
  y = sectionHeading(pdf, "APPROVAL / SUBMISSION READINESS", y);
  const approvalRows: Array<[string, string]> = [["Status", "APPROVED"]];
  if (document.approval?.approvedBy) {
    approvalRows.push(["Approved By", document.approval.approvedBy]);
  }
  if (document.approval?.approvalRole) {
    approvalRows.push(["Approval Role", document.approval.approvalRole]);
  }
  const approvalDate = safeDate(document.approval?.approvalDate);
  if (approvalDate) approvalRows.push(["Approval Date", approvalDate]);
  autoTable(pdf, {
    startY: y,
    body: approvalRows,
    theme: "plain",
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 1.4, textColor: NAVY },
    columnStyles: { 0: { fontStyle: "bold", textColor: SLATE, cellWidth: 38 } },
    willDrawPage: () => decorateCurrentPage(pdf, document.tenderNumber),
  });
  y = tableFinalY(pdf) + 8;

  y = ensureSpace(pdf, y, 58, document.tenderNumber);
  y = sectionHeading(pdf, "E-SIGNATURE", y);
  const signatureHeight = 43;
  const signatureTop = y;
  autoTable(pdf, {
    startY: signatureTop,
    body: [[""]],
    theme: "grid",
    pageBreak: "avoid",
    rowPageBreak: "avoid",
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: {
      fillColor: LIGHT_BLUE,
      lineColor: [147, 197, 253],
      lineWidth: 0.6,
      minCellHeight: signatureHeight,
      cellPadding: 0,
    },
    willDrawPage: () => decorateCurrentPage(pdf, document.tenderNumber),
  });
  pdf.setTextColor(...BLUE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("ELECTRONICALLY SIGNED", PAGE_MARGIN + 6, signatureTop + 8);
  pdf.setDrawColor(...BLUE);
  pdf.circle(PAGE_MARGIN + 8, signatureTop + 15, 2.4, "S");
  pdf.line(PAGE_MARGIN + 6.8, signatureTop + 15, PAGE_MARGIN + 7.7, signatureTop + 16.1);
  pdf.line(PAGE_MARGIN + 7.7, signatureTop + 16.1, PAGE_MARGIN + 9.4, signatureTop + 13.8);
  pdf.setFontSize(9.5);
  pdf.text("DEMO E-SIGNATURE", PAGE_MARGIN + 14, signatureTop + 16.5);
  pdf.setTextColor(...NAVY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.2);
  pdf.text(document.signature.signedBy, PAGE_MARGIN + 6, signatureTop + 24);
  pdf.text(document.signature.designation, PAGE_MARGIN + 6, signatureTop + 29);
  pdf.text("Digitally approved through Tender Management System", PAGE_MARGIN + 6, signatureTop + 34);
  pdf.text(`Date: ${safeDate(document.signature.signedAt) ?? "-"}`, PAGE_MARGIN + 6, signatureTop + 39);
  pdf.setTextColor(185, 28, 28);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.2);
  pdf.text(document.signature.verificationText, pageWidth - PAGE_MARGIN - 6, signatureTop + 39, {
    align: "right",
  });
  y = tableFinalY(pdf) + 8;

  y = ensureSpace(pdf, y, 20, document.tenderNumber);
  pdf.setTextColor(...SLATE);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.8);
  pdf.text("Generated by: Muscat Pharmacy Tender Management System", PAGE_MARGIN, y);
  pdf.text(`Generated: ${safeDate(document.generatedAt, true) ?? "-"}`, PAGE_MARGIN, y + 5);

  pdf.putTotalPages(TOTAL_PAGES_TOKEN);

  return pdf.output("blob");
};

export const downloadFinalProposalPdf = (
  document: FinalProposalDocument,
  blob = generateFinalProposalPdf(document),
) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = getFinalProposalFileName(document.tenderNumber);
  anchor.style.display = "none";
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
};
