import React, { useEffect } from "react";
import { HiOutlineUpload } from "react-icons/hi";

type AttachmentItem = {
  document?: File;
  documentName: string;
  documentUrl?: string;
};

interface AddAttachmentProps {
  type: "technical" | "general";
  id?: string;
  label?: string;
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentItem[]>>;
  attachments: AttachmentItem[];
  requestData: any;
}

const AddAttachment: React.FC<AddAttachmentProps> = ({
  id = "file-upload",
  label = "Attachments",
  setAttachments,
  attachments,
  requestData,
  type,
}) => {
  // Populate existing attachments when editing
  useEffect(() => {
    if (requestData) {
      const documents =
        type === "technical"
          ? requestData.rfpTechnicalDocuments
          : requestData.rfpGeneralDocuments;

      if (documents?.length > 0) {
        const mapped = documents.map((doc: any) => ({
          documentName: doc.fileTitle,
          documentUrl: doc.filePath,
        }));

        setAttachments((prev) => {
          const existingNames = new Set(prev.map((a) => a.documentName));
          const uniqueMapped = mapped.filter(
            (item: any) => !existingNames.has(item.documentName)
          );
          return [...prev, ...uniqueMapped];
        });
      }
    }
  }, [requestData, setAttachments, type]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setAttachments((prev) => [
        ...prev,
        {
          document: selectedFile,
          documentName: selectedFile.name,
        },
      ]);
    }
  };

  const removeFile = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
  };

  return (
    <div className="p-6">
      <div className="flex items-start gap-4">
        {/* Left Section */}
        <div className="w-[280px]">
          <h2 className="text-lg font-semibold">{label}</h2>
        </div>

        {/* Right Section */}
        <div className="flex-1">
          {/* File List */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2 shadow-sm text-sm text-gray-800"
                >
                  {file.documentUrl ? (
                    <a
                      href={file.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {file.documentName}
                    </a>
                  ) : (
                    <span>{file.documentName}</span>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Box */}
          <label
            htmlFor={id}
            className="block w-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer text-center py-8 px-4 transition"
          >
            <div className="flex flex-col items-center justify-center">
              <HiOutlineUpload className="text-gray-500 text-2xl mb-2" />
              <p className="text-sm mt-1">
                <span className="text-blue-600 font-semibold underline">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </p>
              <span className="text-xs text-gray-400 mt-1">
                PDF, DOC or XLS (max. 2MB)
              </span>
            </div>
            <input
              id={id}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default AddAttachment;
