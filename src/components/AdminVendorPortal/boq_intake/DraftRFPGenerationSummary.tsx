import { ArrowRight, Boxes, FileCheck2 } from "lucide-react";
import { DraftRFP } from "./types";

interface Props {
  drafts: DraftRFP[];
  onReview: (draft: DraftRFP) => void;
}

const DraftRFPGenerationSummary = ({ drafts, onReview }: Props) => (
  <section className="boq-card draft-summary-card">
    <div className="boq-section-heading compact">
      <div><span className="boq-kicker">Draft created</span><h2>Generated Draft RFPs</h2><p>Lines are grouped by principal provider and ready for final commercial review.</p></div>
      <span className="boq-count-pill"><FileCheck2 size={16} /> {drafts.length} drafts</span>
    </div>
    <div className="draft-summary-list">
      {drafts.map((draft) => (
        <article key={draft.id} className="draft-summary-row">
          <span className="draft-summary-icon"><Boxes size={21} /></span>
          <div className="draft-summary-number"><span>Draft RFP No</span><strong>{draft.draftNumber}</strong></div>
          <div><span>Principal Provider</span><strong>{draft.providerName}</strong></div>
          <div><span>Category</span><strong>{draft.category}</strong></div>
          <div><span>Items / Total Quantity</span><strong>{draft.lines.length} items · {draft.lines.reduce((sum, line) => sum + line.quantity, 0).toLocaleString()}</strong></div>
          <span className="draft-status">{draft.status}</span>
          <button type="button" onClick={() => onReview(draft)}>Review <ArrowRight size={15} /></button>
        </article>
      ))}
    </div>
  </section>
);

export default DraftRFPGenerationSummary;
