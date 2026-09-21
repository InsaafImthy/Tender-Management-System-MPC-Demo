import { useCallback, useEffect, useRef, useState } from "react";
import { Button, notification } from "antd";
import {
  AlertTriangle,
  BadgeCheck,
  Download,
  FileCheck2,
  Loader2,
  PencilLine,
} from "lucide-react";
import { getRpfApprovalFlowsByIdAsync } from "../../services/flowService";
import {
  getAllSelectedProposalsByRfpIdAsync,
  getRfpDecisionPaperByRfpIdAsync,
} from "../../services/rfpService";
import { buildFinalProposalDocument } from "./finalProposalMapper";
import DemoFinalProposalForm from "./DemoFinalProposalForm";
import { getDemoRfpById } from "../../data/finalProposalDemoData";
import type {
  ApprovalStepSource,
  DecisionPaperSource,
  FinalProposalReadiness,
  FinalProposalRfpSource,
  SelectedProposalSource,
} from "./finalProposalTypes";

interface FinalProposalActionProps {
  rfp: FinalProposalRfpSource;
}

const unavailableReadiness: FinalProposalReadiness = {
  ready: false,
  reason: "Checking approved pricing and proposal data...",
};

const FinalProposalAction = ({ rfp }: FinalProposalActionProps) => {
  const [readiness, setReadiness] = useState<FinalProposalReadiness>(unavailableReadiness);
  const [isChecking, setIsChecking] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const generationLock = useRef(false);

  const loadProposalDocument = useCallback(async (): Promise<FinalProposalReadiness> => {
    if (!rfp.id) {
      return { ready: false, reason: "RFP details are unavailable." };
    }

    const [selectedProposalsResponse, decisionPaperResponse, approvalStepsResponse] =
      await Promise.all([
        getAllSelectedProposalsByRfpIdAsync(rfp.id),
        getRfpDecisionPaperByRfpIdAsync(rfp.id),
        getRpfApprovalFlowsByIdAsync(String(rfp.id), "rfpaward").catch(() => []),
      ]);

    if (!Array.isArray(selectedProposalsResponse)) {
      return {
        ready: false,
        reason: "Unable to load approved proposal pricing. Please try again.",
      };
    }

    const latestRfp = rfp.isDemoRecord ? getDemoRfpById(rfp.id) ?? rfp : rfp;
    return buildFinalProposalDocument({
      rfp: latestRfp,
      selectedProposals: selectedProposalsResponse as SelectedProposalSource[],
      decisionPaper: decisionPaperResponse as DecisionPaperSource | undefined,
      approvalSteps: Array.isArray(approvalStepsResponse)
        ? (approvalStepsResponse as ApprovalStepSource[])
        : [],
    });
  }, [rfp]);

  useEffect(() => {
    let active = true;
    setIsChecking(true);
    void loadProposalDocument()
      .then((result) => {
        if (active) setReadiness(result);
      })
      .catch(() => {
        if (active) {
          setReadiness({
            ready: false,
            reason: "Unable to load approved proposal data. Please try again.",
          });
        }
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });

    return () => {
      active = false;
    };
  }, [loadProposalDocument]);

  const handleDownload = async () => {
    if (generationLock.current) return;
    generationLock.current = true;
    setIsGenerating(true);

    try {
      const latestReadiness = await loadProposalDocument();
      setReadiness(latestReadiness);

      if (!latestReadiness.ready || !latestReadiness.document) {
        notification.warning({
          message: "Final proposal unavailable",
          description: latestReadiness.reason,
        });
        return;
      }

      const { downloadFinalProposalPdf, generateFinalProposalPdf } = await import(
        "./generateFinalProposalPdf"
      );
      const pdfBlob = generateFinalProposalPdf(latestReadiness.document);
      downloadFinalProposalPdf(latestReadiness.document, pdfBlob);
      notification.success({ message: "Final proposal generated successfully." });
    } catch {
      notification.error({
        message: "PDF generation failed",
        description: "Unable to generate the final proposal. Please try again.",
      });
    } finally {
      generationLock.current = false;
      setIsGenerating(false);
    }
  };

  const handleDemoDetailsSaved = async () => {
    setIsChecking(true);
    try {
      setReadiness(await loadProposalDocument());
    } finally {
      setIsChecking(false);
    }
  };

  const canGenerateFinalProposal = readiness.ready && Boolean(readiness.document);

  return (
    <section className="mb-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1365AA] text-white">
          <FileCheck2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              {canGenerateFinalProposal
                ? "Approved for External Submission"
                : rfp.demoFinalProposalEditable
                  ? "Approved - Enter Final Proposal Details"
                  : "Approved - Final Proposal Pending"}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Approved
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {canGenerateFinalProposal
              ? "The final quotation package is ready for manual upload to the external tender portal."
              : readiness.reason}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">PDF</span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
              E-Signed (Demo)
            </span>
          </div>

          {!isChecking && !canGenerateFinalProposal && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>A PDF will not be generated until complete approved pricing is available.</span>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {rfp.isDemoRecord && rfp.demoFinalProposalEditable && (
              <Button
                htmlType="button"
                onClick={() => setIsEditorOpen(true)}
                className="mr-2 h-10 px-4 text-sm font-semibold"
                icon={<PencilLine className="h-4 w-4" aria-hidden="true" />}
              >
                {canGenerateFinalProposal ? "Edit Final Details" : "Enter Final Details"}
              </Button>
            )}
            <Button
              type="primary"
              htmlType="button"
              disabled={isChecking || isGenerating || !canGenerateFinalProposal}
              onClick={() => void handleDownload()}
              className="h-10 px-4 text-sm font-semibold"
              icon={
                isChecking || isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )
              }
            >
              {isChecking
                ? "Checking proposal..."
                : isGenerating
                  ? "Generating PDF..."
                  : "Download Final Proposal"}
            </Button>
          </div>
        </div>
      </div>
      {rfp.isDemoRecord && rfp.demoFinalProposalEditable && isEditorOpen && (
        <DemoFinalProposalForm
          open={isEditorOpen}
          rfp={rfp}
          onClose={() => setIsEditorOpen(false)}
          onSaved={() => void handleDemoDetailsSaved()}
        />
      )}
    </section>
  );
};

export default FinalProposalAction;
