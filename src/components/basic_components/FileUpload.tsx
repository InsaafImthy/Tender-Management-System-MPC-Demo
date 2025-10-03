import { useState } from 'react';

interface FileUploadProps {
    id: string;
    label: string;
    onFilesChange: (files: FileList | null) => void; // Callback when files are selected
    acceptedFileTypes?: string; // Optional: Specify accepted file types
    multiple?: boolean; // Optional: Allow multiple files
    style?: string; // Optional custom styles
    docType?: string; // Add docType to the props
}

const FileUpload = ({
    id,
    label,
    onFilesChange,
    acceptedFileTypes = '*',
    multiple = false,
    style = '',
}: FileUploadProps) => {
    const [fileNames, setFileNames] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileNamesArray = Array.from(files).map(file => file.name);
            setFileNames(fileNamesArray);
            onFilesChange(files); // Pass selected files to parent component
        }
    };

    return (
        <div className={`flex flex-col ${style}`}>

            {/* File Input */}
            <div className="flex items-center justify-center">
                <label
                    htmlFor={id}
                    className="w-full flex items-center justify-between border border-gray-300 bg-white text-gray-500 py-3 px-4 rounded-sm cursor-pointer space-x-3"
                >

                    <span className="flex items-center space-x-2">

                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h5a1 1 0 011 1v1H3V4zM3 10a1 1 0 011-1h5a1 1 0 011 1v1H3v-1zm0 6a1 1 0 011-1h5a1 1 0 011 1v1H3v-1zM14 4a1 1 0 011-1h5a1 1 0 011 1v1h-6V4zm0 6a1 1 0 011-1h5a1 1 0 011 1v1h-6v-1zm0 6a1 1 0 011-1h5a1 1 0 011 1v1h-6v-1z" />
                        </svg>
                        <span className='text-black text-sm'>{label}</span>
                    </span>

                    <input
                        id={id}
                        type="file"
                        onChange={handleFileChange}
                        accept={acceptedFileTypes}
                        multiple={multiple}
                        className="hidden"
                    />
                </label>
            </div>


            {/* Selected File Names */}
            {fileNames.length > 0 && (
                <div className="mt-2">
                    <p className="text-sm text-gray-700">Selected files:</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                        {fileNames.map((fileName, index) => (
                            <li key={index}>{fileName}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
