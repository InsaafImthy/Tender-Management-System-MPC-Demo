import { useEffect, useState } from "react";
import { notification } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ClipboardCheck, FileText, Send, ShieldCheck, Trash2 } from "lucide-react";
import { getDraft, prepareDraftForRfpCreation, saveDraft } from "./BOQToRFPService";
import { DraftRFP } from "./types";
import "./boqIntake.css";

const DraftRFPReviewPage = () => {
  const { draftId = "" } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<DraftRFP | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => setDraft(getDraft(draftId) ?? null), [draftId]);

  if (!draft) return <div className="boq-empty-page"><FileText size={32} /><h2>Draft RFP not found</h2><button onClick={() => navigate("/vendor-portal/boq-upload")}>Return to BOQ Import</button></div>;

  const update = (change: Partial<DraftRFP>) => setDraft((current) => current ? { ...current, ...change } : current);
  const persist = () => {
    saveDraft(draft);
    notification.success({ message: "Draft RFP saved", description: `${draft.draftNumber} is ready for continued review.` });
  };

  const continueToCreateRfp = async () => {
    if (!draft.title.trim() || !draft.submissionDeadline || draft.lines.length === 0) {
      notification.warning({ message: "Complete the draft", description: "RFP title, submission deadline and at least one line item are required." });
      return;
    }
    setSending(true);
    try {
      const handoff = await prepareDraftForRfpCreation(draft);
      notification.success({
        message: "Products synchronized",
        description: `${handoff.productsReused} existing and ${handoff.productsCreated} newly created products are ready in the RFP form.`,
      });
      navigate("/rfps/create-rfp", { state: { boqHandoff: handoff } });
    } catch (error) {
      notification.error({
        message: "Unable to prepare the RFP",
        description: error instanceof Error ? error.message : "The product synchronization API failed.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="boq-page">
      <div className="boq-page-inner draft-review-page">
        <button className="boq-back-button" type="button" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Extracted BOQ Review</button>
        <header className="boq-review-hero draft-hero">
          <div><span className="boq-kicker">Draft Created · Final Review</span><h1>Draft RFP Review</h1><p>{draft.draftNumber} · {draft.providerName}</p></div>
          <div className="draft-ready-badge"><ShieldCheck size={18} /><div><span>Workflow status</span><strong>{draft.status}</strong></div></div>
        </header>

        <div className="draft-review-layout">
          <main className="draft-main-column">
            <section className="boq-card draft-form-card">
              <div className="boq-section-heading compact"><div><span className="boq-kicker">RFP information</span><h2>Commercial & timeline details</h2></div></div>
              <div className="draft-form-grid">
                <label className="wide"><span>RFP Title</span><input value={draft.title} onChange={(event) => update({ title: event.target.value })} /></label>
                <label><span>BOQ Reference No</span><input value={draft.boqReferenceNo} readOnly /></label>
                <label><span>Demand No</span><input value={draft.demandNo} readOnly /></label>
                <label><span>Principal Provider</span><input value={draft.providerName} readOnly /></label>
                <label><span>Category</span><input value={draft.category} readOnly /></label>
                <label><span>Closing Date</span><input type="date" value={draft.closingDate} onChange={(event) => update({ closingDate: event.target.value })} /></label>
                <label><span>Submission Deadline</span><input type="date" value={draft.submissionDeadline} onChange={(event) => update({ submissionDeadline: event.target.value })} /></label>
                <label className="wide"><span>Delivery Terms</span><textarea rows={2} value={draft.deliveryTerms} onChange={(event) => update({ deliveryTerms: event.target.value })} /></label>
                <label className="wide"><span>Warranty / Guarantee Period</span><textarea rows={2} value={draft.warrantyPeriod} onChange={(event) => update({ warrantyPeriod: event.target.value })} /></label>
              </div>
            </section>

            <section className="boq-card draft-lines-card">
              <div className="boq-section-heading compact"><div><span className="boq-kicker">Procurement schedule</span><h2>RFP line items</h2><p>Remove any line that should not be included in this provider request.</p></div><span className="boq-count-pill">{draft.lines.length} items</span></div>
              <div className="boq-table-scroll"><table className="draft-lines-table"><thead><tr><th>Sr No</th><th>Item Code</th><th>Item Description</th><th>Unit</th><th>Quantity</th><th>Remarks</th><th>Required Compliance</th><th>Catalogue Ref.</th><th /></tr></thead>
                <tbody>{draft.lines.map((line, index) => <tr key={line.id}><td>{index + 1}</td><td><span className="boq-code">{line.itemCode}</span></td><td><strong>{line.itemName}</strong></td><td>{line.unit}</td><td>{line.quantity}</td><td>{line.remarks}</td><td><span className="compliance-label"><Check size={13} /> Full technical compliance</span></td><td>Required</td><td><button type="button" className="remove-line-button" onClick={() => update({ lines: draft.lines.filter((item) => item.id !== line.id) })} aria-label={`Remove ${line.itemName}`}><Trash2 size={16} /></button></td></tr>)}</tbody>
              </table></div>
            </section>

            <section className="boq-card internal-notes-card"><label><span>Internal notes</span><textarea rows={4} placeholder="Add review notes for the approval team..." value={draft.internalNotes} onChange={(event) => update({ internalNotes: event.target.value })} /></label></section>
          </main>

          <aside className="draft-side-column">
            <section className="boq-card requirement-card"><span className="boq-kicker">Submission requirements</span><h3>Required with proposal</h3>
              {["Catalogue Required", "Manufacturer / Country Required", "Commercial Terms Required"].map((requirement) => <div key={requirement}><Check size={15} /><span>{requirement}</span><strong>Yes</strong></div>)}
            </section>
            <section className="boq-card source-card"><FileText size={21} /><div><span>Source document</span><strong>{draft.sourceDocumentName}</strong><small>Attached to the approval payload</small></div></section>
            <div className="draft-actions">
              <button type="button" className="boq-secondary-button" onClick={persist}><ClipboardCheck size={17} /> Save as Draft</button>
              <button type="button" className="boq-primary-button" disabled={sending} onClick={() => void continueToCreateRfp()}>{sending ? "Checking product master..." : "Continue to Create RFP"}<Send size={17} /></button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DraftRFPReviewPage;
