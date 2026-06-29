import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Clock3, FileCheck2, FileStack, ShieldCheck } from "lucide-react";
import BOQUploadPanel from "./BOQUploadPanel";
import ExtractionProgressTracker, { ExtractionProgressState } from "./ExtractionProgressTracker";
import { createIntakeSession, getSessions, saveSession } from "./BOQToRFPService";
import { getPageCount } from "./boqExtractionSeedData";
import { getUserCredentials } from "../../../utils/common";
import { BOQIntakeSession } from "./types";
import "./boqIntake.css";

const delay = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

const BOQIntakePage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<BOQIntakeSession[]>([]);
  const [progress, setProgress] = useState<ExtractionProgressState | null>(null);

  useEffect(() => setSessions(getSessions()), []);

  const processFiles = async (files: File[]) => {
    let firstSessionId = "";
    for (const file of files) {
      const processingMetadata = {
        fileName: file.name,
        pages: getPageCount(file.name),
        uploadedBy: getUserCredentials().name || "Procurement Team",
        startedAt: new Date().toISOString(),
      };
      const checkpoints = [
        { progress: 14, stage: 0, wait: 520 },
        { progress: 38, stage: 1, wait: 900 },
        { progress: 69, stage: 1, wait: 780 },
        { progress: 88, stage: 2, wait: 720 },
        { progress: 100, stage: 3, wait: 450 },
      ];
      for (const checkpoint of checkpoints) {
        setProgress({ ...processingMetadata, progress: checkpoint.progress, stage: checkpoint.stage });
        await delay(checkpoint.wait);
      }
      const session = saveSession(createIntakeSession(file));
      if (!firstSessionId) firstSessionId = session.upload.id;
      setSessions(getSessions());
    }
    setProgress(null);
    navigate(`/vendor-portal/boq-upload/review/${firstSessionId}`);
  };

  return (
    <div className="boq-page">
      <div className="boq-page-inner">
        <header className="boq-hero">
          <div className="boq-hero-copy">
            <span className="boq-hero-icon"><BrainCircuit size={27} /></span>
            <div><span className="boq-kicker">Tender Portal · Intelligent Intake</span><h1>BOQ Intake</h1><p>Turn Ministry BOQ documents into categorized, provider-matched draft RFPs with a controlled procurement review.</p></div>
          </div>
          <div className="boq-hero-metrics">
            <div><FileStack size={18} /><span>Documents</span><strong>{sessions.length}</strong></div>
            <div><FileCheck2 size={18} /><span>Draft RFPs</span><strong>{sessions.reduce((total, session) => total + session.drafts.length, 0)}</strong></div>
            <div><ShieldCheck size={18} /><span>Review control</span><strong>Enabled</strong></div>
          </div>
        </header>

        {progress ? <ExtractionProgressTracker state={progress} /> : <BOQUploadPanel onStart={(files) => void processFiles(files)} />}

        {sessions.length > 0 && (
          <section className="boq-card recent-boq-card">
            <div className="boq-section-heading compact"><div><span className="boq-kicker">Intake register</span><h2>Recent BOQ documents</h2><p>Continue review or inspect previously generated drafts.</p></div></div>
            <div className="recent-boq-list">
              {sessions.map((session) => (
                <button key={session.upload.id} type="button" onClick={() => navigate(`/vendor-portal/boq-upload/review/${session.upload.id}`)}>
                  <span className="recent-file-icon"><FileStack size={19} /></span>
                  <div className="recent-file-name"><strong>{session.upload.fileName}</strong><span>{session.extraction.boqReferenceNo}</span></div>
                  <div><span>File type</span><strong>{session.upload.fileType}</strong></div>
                  <div><span>Pages</span><strong>{session.upload.pages}</strong></div>
                  <div><span>Uploaded by</span><strong>{session.upload.uploadedBy}</strong></div>
                  <div><span>Uploaded</span><strong><Clock3 size={13} /> {new Date(session.upload.uploadedAt).toLocaleString()}</strong></div>
                  <em>{session.upload.status}</em>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BOQIntakePage;
