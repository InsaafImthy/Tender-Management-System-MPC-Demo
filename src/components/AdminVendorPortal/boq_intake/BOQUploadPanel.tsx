import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

interface BOQUploadPanelProps {
  disabled?: boolean;
  onStart: (files: File[]) => void;
}

const BOQUploadPanel = ({ disabled, onStart }: BOQUploadPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (incoming: File[]) => {
    const pdfFiles = incoming.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (pdfFiles.length !== incoming.length) setError("Only PDF BOQ documents can be processed.");
    else setError("");
    setFiles((current) => {
      const known = new Set(current.map((file) => `${file.name}-${file.size}`));
      return [...current, ...pdfFiles.filter((file) => !known.has(`${file.name}-${file.size}`))];
    });
  };

  return (
    <section className="boq-card boq-upload-card">
      <div className="boq-section-heading">
        <div>
          <span className="boq-kicker">Document intake</span>
          <h2>Upload BOQ documents</h2>
          <p>Add one or more Ministry BOQ files. Each document is processed and prepared for review independently.</p>
        </div>
        <span className="boq-secure-label">PDF · Secure workspace</span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
        className={`boq-dropzone ${isDragging ? "is-dragging" : ""}`}
      >
        <span className="boq-dropzone-icon"><UploadCloud size={28} /></span>
        <strong>Drop BOQ PDFs here or browse files</strong>
        <span>Multiple documents supported · Maximum 25 MB per file</span>
      </button>
      <input ref={inputRef} hidden multiple type="file" accept="application/pdf,.pdf" onChange={(event) => addFiles(Array.from(event.target.files ?? []))} />

      {error && <p className="boq-inline-error">{error}</p>}

      {files.length > 0 && (
        <div className="boq-file-queue">
          {files.map((file) => (
            <div className="boq-file-row" key={`${file.name}-${file.size}`}>
              <span className="boq-file-icon"><FileText size={20} /></span>
              <div>
                <strong>{file.name}</strong>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB · Ready for extraction</span>
              </div>
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item !== file))}>
                <X size={17} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="boq-primary-button"
            disabled={disabled || files.length === 0}
            onClick={() => onStart(files)}
          >
            Start AI extraction <span>{files.length}</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default BOQUploadPanel;
