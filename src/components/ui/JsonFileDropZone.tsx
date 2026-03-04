"use client";

import { useRef, useState } from "react";

interface JsonFileDropZoneProps {
  file: File | null;
  error: string | null;
  onChange: (file: File, previewJson: string) => void;
  onError: (message: string) => void;
}

export default function JsonFileDropZone({ file, error, onChange, onError }: JsonFileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".json")) {
      onError("Only .json files are allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        onChange(f, JSON.stringify(parsed, null, 2));
      } catch {
        onError("Invalid JSON file.");
      }
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-gray-900 bg-gray-50"
            : file
            ? "border-emerald-400 bg-emerald-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
        {file ? (
          <div>
            <p className="text-2xl mb-1">✅</p>
            <p className="text-sm font-medium text-emerald-700">{file.name}</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {(file.size / 1024).toFixed(1)} KB — click to replace
            </p>
          </div>
        ) : (
          <div>
            <p className="text-2xl mb-1">📂</p>
            <p className="text-sm text-gray-600">
              Drag & drop a <span className="font-medium">.json</span> file, or{" "}
              <span className="text-gray-900 font-medium underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Only .json files are accepted</p>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
