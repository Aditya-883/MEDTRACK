'use client';

import { useState } from 'react';

export default function FileViewer({ url, fileType }) {
  const [open, setOpen] = useState(false);

  // IMAGE VIEW
  if (fileType.startsWith("image")) {
    return (
      <div>
        <img
          src={url}
          className="mt-2 w-64 rounded cursor-pointer hover:scale-105 transition"
          alt="preview"
          onClick={() => setOpen(true)}
        />

        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setOpen(false)}
          >
            <img
              src={url}
              className="max-h-[90%] max-w-[90%] rounded"
              alt="full"
            />
          </div>
        )}
      </div>
    );
  }

  // PDF VIEW
  if (fileType === "application/pdf") {
    return (
      <div className="mt-3">
        <button
          onClick={() => setOpen(!open)}
          className="bg-gray-800 text-white px-3 py-1 rounded"
        >
          {open ? "Hide PDF" : "View PDF"}
        </button>

        {open && (
          <iframe
            src={url}
            className="w-full h-[500px] mt-3 border rounded"
          />
        )}
      </div>
    );
  }

  // DEFAULT FILE
  return (
    <a
      href={url}
      target="_blank"
      className="text-blue-500 underline mt-2 inline-block"
    >
      Open File
    </a>
  );
}