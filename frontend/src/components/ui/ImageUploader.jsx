import { useRef, useState } from 'react';
import { uploadService } from '../../services/uploadService';
import { resolveImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

export default function ImageUploader({ value, onChange, label = 'Imagen' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(resolveImageUrl(value) || '');

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecciona una imagen válida'); return; }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const data = await uploadService.uploadImage(fd);
      const url = data.url || data.imageUrl || data.path || data.filename || data;
      const safeUrl = typeof url === 'string' ? url : '';
      onChange?.(safeUrl);
      setPreview(resolveImageUrl(safeUrl) || '');
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); };
  const handleDrag = (e) => { e.preventDefault(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };

  return (
    <div>
      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragActive ? 'border-accent-500 bg-accent-500/10' : 'border-black/10 bg-white/60 hover:border-accent-500/60'}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        {preview ? (
          <img src={preview} alt={label} className="mx-auto h-40 max-w-full rounded-xl object-contain shadow-sm" />
        ) : (
          <div className="py-8 text-ink-secondary">
            <p className="font-semibold text-ink">Arrastra una imagen aquí</p>
            <p className="text-sm">o haz clic para seleccionar</p>
          </div>
        )}
        {uploading && <div className="absolute inset-0 grid place-items-center rounded-lg bg-white/80 text-sm font-semibold text-ink backdrop-blur">Subiendo...</div>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}
