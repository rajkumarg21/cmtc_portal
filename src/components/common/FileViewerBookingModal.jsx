import React from "react";
import { FaFilePdf, FaExternalLinkAlt, FaDownload } from "react-icons/fa";

/**
 * Reusable FileViewer component
 *
 * Props:
 * - fileUrl: string (required) => the relative or absolute URL of the file
 * - label: string (required) => display label for the file
 * - downloadFileName: string (optional) => filename for download
 * - icon: React component (optional) => icon to show
 */
const FileViewer = ({
  fileUrl,
  label,
  downloadFileName = "file",
  icon = <FaFilePdf className="text-red-600" size={20} />,
}) => {
  // Construct full URL
  const fullUrl = `${import.meta.env.VITE_APP_BACKEND_URL}${fileUrl}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2 mb-1">
       <div>
          <p className="text-sm text-gray-600 p-2">{label}</p>
        </div>
      <div className="flex items-center justify-between">
        {/* File Info */}
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-lg">{icon}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            <FaExternalLinkAlt />
            View
          </a>

          <a
            href={fullUrl}
            download={downloadFileName}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          >
            <FaDownload />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;