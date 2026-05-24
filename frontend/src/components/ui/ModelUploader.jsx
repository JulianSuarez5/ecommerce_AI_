import { useState, useRef } from 'react';
import { Upload, X, Box, ExternalLink } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import toast from 'react-hot-toast';

export default function ModelUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name?.toLowerCase();
    if (!ext.endsWith('.glb') && !ext.endsWith('.gltf')) {
      toast.error('Solo se permiten archivos .glb o .gltf');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const data = await uploadService.uploadModel(fd);
      const url = data.url || data.filename || data;
      onChange?.(typeof url === 'string' ? url : '');
      toast.success('Modelo 3D subido');
    } catch (err) {
      toast.error(err.message || 'Error al subir modelo 3D');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); };
  const handleDrag = (e) => { e.preventDefault(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };

  return (
    <div>
      <div
        className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${dragActive ? 'border-accent-500 bg-accent-500/5' : 'border-border hover:border-accent-500/50'}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
      >
        <input ref={inputRef} type="file" accept=".glb,.gltf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center">
                <Box size={20} className="text-accent-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-ink">Modelo 3D cargado</p>
                <p className="text-[10px] text-ink-tertiary break-all max-w-[300px]">{value?.split('/').pop()?.split('?')[0] || value}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a href={value} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="px-2 py-1.5 text-xs font-medium text-accent-500 hover:text-accent-400 transition-colors flex items-center gap-1"><ExternalLink size={12} /> Ver modelo 3D</a>
              <button onClick={(e) => { e.stopPropagation(); onChange?.(''); }} className="p-2 text-ink-tertiary hover:text-[var(--error)] transition-colors"><X size={14} /></button>
            </div>
          </div>
        ) : (
          <div className="py-3">
            <Upload size={28} className="mx-auto text-ink-tertiary mb-2" />
            <p className="text-sm text-ink-secondary">Click o arrastra un modelo 3D</p>
            <p className="text-xs text-ink-tertiary mt-1">.GLB o .GLTF hasta 50MB</p>
          </div>
        )}
        {uploading && <div className="absolute inset-0 bg-ink/70 flex items-center justify-center rounded-lg"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>}
      </div>
    </div>
  );
}
