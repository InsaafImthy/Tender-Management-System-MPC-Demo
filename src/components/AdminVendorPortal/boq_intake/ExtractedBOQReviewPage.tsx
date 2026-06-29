import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FileSearch2, Landmark, ListChecks, Sparkles } from "lucide-react";
import DraftRFPGenerationSummary from "./DraftRFPGenerationSummary";
import ExtractedLineItemsTable from "./ExtractedLineItemsTable";
import { createDraftGroups, getSession, saveSession } from "./BOQToRFPService";
import { BOQIntakeSession, ExtractedBOQLine } from "./types";
import "./boqIntake.css";

const ExtractedBOQReviewPage = () => {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<BOQIntakeSession | null>(null);

  useEffect(() => setSession(getSession(sessionId) ?? null), [sessionId]);

  if (!session) return <div className="boq-empty-page"><FileSearch2 size={32} /><h2>BOQ review not found</h2><button onClick={() => navigate("/vendor-portal/boq-upload")}>Return to BOQ Import</button></div>;

  const updateLine = (updatedLine: ExtractedBOQLine) => {
    const extraction = { ...session.extraction, lines: session.extraction.lines.map((line) => line.id === updatedLine.id ? updatedLine : line) };
    const drafts = createDraftGroups(extraction, session.upload.fileName, session.drafts);
    const groupByLine = new Map(drafts.flatMap((draft) => draft.lines.map((line) => [line.id, draft.draftNumber] as const)));
    const nextExtraction = { ...extraction, lines: extraction.lines.map((line) => ({ ...line, rfpGroup: groupByLine.get(line.id) })) };
    const next = saveSession({ ...session, extraction: nextExtraction, drafts });
    setSession(next);
  };

  const openDraft = (draftId: string) => {
    saveSession({ ...session, upload: { ...session.upload, status: "Draft RFP Created" }, extraction: { ...session.extraction, documentStatus: "Draft RFP Created" } });
    navigate(`/vendor-portal/boq-upload/drafts/${draftId}`);
  };

  const metrics = [
    { label: "BOQ Reference No", value: session.extraction.boqReferenceNo, icon: FileSearch2 },
    { label: "Demand No", value: session.extraction.demandNo, icon: ListChecks },
    { label: "Issuing Department", value: session.extraction.issuingDepartment, icon: Landmark },
    { label: "Source Agency", value: session.extraction.sourceAgency, icon: Landmark },
    { label: "Closing Date", value: new Date(`${session.extraction.closingDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), icon: CalendarDays },
    { label: "Total Extracted Lines", value: String(session.extraction.lines.length), icon: ListChecks },
  ];

  return (
    <div className="boq-page">
      <div className="boq-page-inner review-page-inner">
        <button className="boq-back-button" type="button" onClick={() => navigate("/vendor-portal/boq-upload")}><ArrowLeft size={16} /> BOQ Import</button>
        <header className="boq-review-hero">
          <div><span className="boq-kicker">AI Extracted · Review Required</span><h1>Extracted BOQ Review</h1><p>{session.upload.fileName}</p></div>
          <div className="boq-confidence-score"><span><Sparkles size={17} /> Extraction confidence</span><strong>{session.extraction.confidence}%</strong><em>{session.extraction.confidence >= 85 ? "High confidence" : "Medium confidence"}</em></div>
          <span className="boq-document-status">{session.extraction.documentStatus}</span>
        </header>
        <section className="boq-metadata-grid">
          {metrics.map(({ label, value, icon: Icon }) => <div key={label}><span><Icon size={15} /> {label}</span><strong>{value}</strong></div>)}
        </section>
        <ExtractedLineItemsTable lines={session.extraction.lines} onChange={updateLine} />
        <DraftRFPGenerationSummary drafts={session.drafts} onReview={(draft) => openDraft(draft.id)} />
      </div>
    </div>
  );
};

export default ExtractedBOQReviewPage;
