import { Check, FileSearch, ScanText, Sparkles } from "lucide-react";

export interface ExtractionProgressState {
  fileName: string;
  progress: number;
  stage: number;
  pages: number;
  uploadedBy: string;
  startedAt: string;
}

const stages = [
  { title: "Document validated", detail: "Page structure and document quality checked", icon: FileSearch },
  { title: "Content extraction", detail: "Reading tabular items, quantities and references", icon: ScanText },
  { title: "Category intelligence", detail: "Applying category and principal-provider matching", icon: Sparkles },
  { title: "Review workspace ready", detail: "Structured BOQ prepared for procurement review", icon: Check },
];

const ExtractionProgressTracker = ({ state }: { state: ExtractionProgressState }) => (
  <section className="boq-card boq-progress-card" aria-live="polite">
    <div className="boq-progress-topline">
      <div>
        <span className="boq-kicker">AI extraction in progress</span>
        <h2>{state.fileName}</h2>
      </div>
      <strong>{state.progress}%</strong>
    </div>
    <div className="boq-progress-bar"><span style={{ width: `${state.progress}%` }} /></div>
    <div className="boq-processing-metadata">
      <div><span>File type</span><strong>PDF document</strong></div>
      <div><span>Pages detected</span><strong>{state.pages}</strong></div>
      <div><span>Uploaded by</span><strong>{state.uploadedBy}</strong></div>
      <div><span>Uploaded</span><strong>{new Date(state.startedAt).toLocaleString()}</strong></div>
      <div><span>Status</span><strong className="is-extracting">Extracting</strong></div>
    </div>
    <div className="boq-progress-stages">
      {stages.map((item, index) => {
        const Icon = item.icon;
        const isComplete = index < state.stage;
        const isActive = index === state.stage;
        return (
          <div key={item.title} className={`boq-progress-step ${isComplete ? "is-complete" : ""} ${isActive ? "is-active" : ""}`}>
            <span><Icon size={18} /></span>
            <div><strong>{item.title}</strong><small>{item.detail}</small></div>
          </div>
        );
      })}
    </div>
  </section>
);

export default ExtractionProgressTracker;
