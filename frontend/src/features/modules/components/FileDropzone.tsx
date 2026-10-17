'use client';

import React, { useRef, useState } from 'react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  acceptedFormats?: string;
  title?: string;
  subtitle?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  isLoading,
  acceptedFormats = '.xlsx, .xls',
  title = 'Subir nómina de estudiantes',
  subtitle = 'Arrastre su archivo Excel (.xlsx) o haga clic para examinar',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      alert('Solo se admiten archivos de formato Excel (.xlsx, .xls)');
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="p-3 bg-white rounded-full shadow-sm mb-3 text-slate-600">
          {selectedFile ? (
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          )}
        </div>

        <p className="text-base font-semibold text-slate-800 text-center">
          {selectedFile ? selectedFile.name : title}
        </p>

        <p className="text-xs text-slate-500 mt-1 text-center">
          {selectedFile
            ? `${(selectedFile.size / 1024).toFixed(1)} KB — Haga clic o arrastre para cambiar`
            : subtitle}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block px-2 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">
            .XLSX
          </span>
          <span className="inline-block px-2 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">
            .XLS
          </span>
        </div>
      </div>
    </div>
  );
};
