import React, { useState } from 'react';
import { UploadCloud, X, File as FileIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (fileUrl: string, fileType: string) => void;
  accept?: string;
  label?: string;
  previewUrl?: string;
}

export default function FileUpload({ onFileSelect, accept = "*", label = "Upload File", previewUrl }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string | null>(previewUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        const fileUrl = data.data.url;
        setCurrentPreview(fileUrl);
        onFileSelect(fileUrl, file.type);
      } else {
        throw new Error(data.message || 'Gagal mengunggah file');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      if (file.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setCurrentPreview(base64);
          onFileSelect(base64, file.type);
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMsg('Gagal mengunggah file. Silakan coba lagi.');
      }
    } finally {
      setIsUploading(false);
    }
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
    setErrorMsg(null);
    onFileSelect('', '');
  };

  return (
    <div className="w-full">
      <p className="text-xs font-bold text-navy mb-1">{label}</p>
      
      {isUploading ? (
        <div className="rounded-xl border border-border-subtle p-6 bg-sand-dark flex flex-col items-center justify-center gap-2 text-navy">
          <Loader2 className="animate-spin text-gold" size={28} />
          <p className="text-sm font-bold">Mengunggah file ke server...</p>
          <p className="text-xs text-text-muted">Mohon tunggu sebentar</p>
        </div>
      ) : currentPreview ? (
        <div className="relative rounded-xl border border-border-subtle p-2 bg-sand-dark flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex items-center justify-center flex-shrink-0 border border-border-subtle">
             {currentPreview.startsWith('data:image') || currentPreview.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ? (
               <img src={currentPreview} alt="Preview" className="w-full h-full object-cover" />
             ) : (
               <FileIcon className="text-navy opacity-50" size={24} />
             )}
          </div>
          <div className="flex-grow overflow-hidden">
             <p className="text-sm font-bold text-navy truncate">File terlampir</p>
             <p className="text-xs text-emerald-600 font-bold truncate">Berhasil terunggah</p>
          </div>
          <button 
            type="button" 
            onClick={handleClear}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mr-2 flex-shrink-0"
            title="Hapus / Ganti File"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div>
          <div 
            className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
              dragActive ? 'border-navy bg-navy/5' : 'border-border-subtle bg-sand-dark/50 hover:bg-sand-dark'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById(`file-upload-${label.replace(/[^a-zA-Z0-9]/g, '-')}`)?.click()}
          >
            <input 
              id={`file-upload-${label.replace(/[^a-zA-Z0-9]/g, '-')}`}
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
          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 mt-1.5">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
