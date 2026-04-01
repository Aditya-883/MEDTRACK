'use client';

import { useState } from 'react';

export default function FileViewer({ url, fileType }) {
  const [open, setOpen] = useState(false);

  // ✅ FIXED DOWNLOAD (FORCE DOWNLOAD)
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'medical_record';
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  // 🖼️ IMAGE VIEW
  if (fileType.startsWith("image")) {
    return (
      <div className="mt-3">
        <img
          src={url}
          className="w-64 rounded cursor-pointer hover:scale-105 transition shadow"
          alt="preview"
          onClick={() => setOpen(true)}
        />

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            View
          </button>

          <button
            onClick={handleDownload}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
          >
            Download
          </button>
        </div>

        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setOpen(false)}
          >
            <img
              src={url}
              className="max-h-[90%] max-w-[90%] rounded shadow-lg"
              alt="full"
            />
          </div>
        )}
      </div>
    );
  }

  // 📄 PDF VIEW
  if (fileType === "application/pdf") {
    return (
      <div className="mt-3">
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
          >
            {open ? "Hide PDF" : "View PDF"}
          </button>

          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Download
          </button>
        </div>

        {open && (
          <iframe
            src={url}
            className="w-full h-[500px] mt-3 border rounded shadow"
          />
        )}
      </div>
    );
  }

  // 📁 DEFAULT
  return (
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => window.open(url, '_blank')}
        className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
      >
        Open File
      </button>

      <button
        onClick={handleDownload}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        Download
      </button>
    </div>
  );
}