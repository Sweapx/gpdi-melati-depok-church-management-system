import React, { useCallback, useState } from 'react';
import { UploadCloud, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (fileBase64: string, fileType: string) => void;
  accept?: string;
  label?: string;
  previewUrl?: string;
}

export default function FileUpload({ onFileSelect, accept = "*", label = "Upload File", previewUrl }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string | null>(previewUrl || null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCurrentPreview(base64);
      onFileSelect(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setCurrentPreview(null);
    onFileSelect('', '');
  };

  return (
    <div className="w-full">
      <p className="text-xs font-bold text-navy mb-1">{label}</p>
      
      {currentPreview ? (
        <div className="relative rounded-xl border border-border-subtle p-2 bg-sand-dark flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex items-center justify-center flex-shrink-0 border border-border-subtle">
             {currentPreview.startsWith('data:image') || currentPreview.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
               <img src={currentPreview} alt="Preview" className="w-full h-full object-cover" />
             ) : (
               <FileIcon className="text-navy opacity-50" size={24} />
             )}
          </div>
          <div className="flex-grow overflow-hidden">
             <p className="text-sm font-bold text-navy truncate">File terlampir</p>
             <p className="text-xs text-text-muted truncate">Format dikenali</p>
          </div>
          <button 
            type="button" 
            onClick={handleClear}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mr-2 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
            dragActive ? 'border-navy bg-navy/5' : 'border-border-subtle bg-sand-dark/50 hover:bg-sand-dark'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
        >
          <input 
            id={`file-upload-${label}`}
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={handleChange}
          />
          <UploadCloud className={`mb-3 ${dragActive ? 'text-navy' : 'text-text-muted'}`} size={32} />
          <p className="text-sm font-bold text-navy mb-1">
            Drag & drop file di sini
          </p>
          <p className="text-xs text-text-muted">
            atau klik untuk mencari file di perangkat Anda
          </p>
        </div>
      )}
    </div>
  );
}
