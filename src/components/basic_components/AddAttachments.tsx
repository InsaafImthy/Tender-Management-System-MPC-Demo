import React from "react";

interface AddAttachmentProps {
  setAttachments: (file: any) => void;
  attachments: any[];
  required?: boolean;
  id?: string
  viewOnly?: boolean
}

const AddAttachment: React.FC<AddAttachmentProps> = ({
  setAttachments,
  attachments,
  required = false,
  id = "file-upload",
  viewOnly = false
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files ? event.target.files[0] : null;
    if (selectedFiles) {
      setAttachments({ document: selectedFiles, documentName: selectedFiles.name, documentUrl: URL.createObjectURL(selectedFiles) }); // Add new files to the current list
    }
  };


  return (
    <div className="w-full rounded-md ">
      {/* Display uploaded files */}
      <div className="flex flex-wrap gap-2 mb-4 max-h-[5.5rem] overflow-y-auto relative">
        {attachments.map((file, index) => (
          <div
            key={index}
            className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm truncate block max-w-[200px]">
                <a href={file.documentUrl ? file.documentUrl : file.document} target="blank" download={file.documentName} >{file.documentName}</a>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* File input section */}
      {!viewOnly && <div
        className="flex flex-col items-center justify-center border"
        style={{ borderWidth: "1px", borderStyle: "dashed", borderColor: "#D1D5DB", height: "100px" }}
      >
        <label htmlFor={id}>
          <span className="text-gray-500 hover:underline cursor-pointer text-sm font-regular mb-1">
            Drag and drop your files here or
          </span>{" "}
          <span className="text-blue-600 hover:underline cursor-pointer text-sm font-medium mb-1">
            browse
          </span>
        </label>
        <input
          required={required}
          type="file"
          id={id}
          accept=".pdf,.docx,.jpg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="text-xs text-gray-500">Max. file size : 20MB</span>
      </div>}
    </div>
  );
};

export default AddAttachment;
