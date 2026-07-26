"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface AvatarUploaderProps {
  currentUrl?: string;
  onUploaded?: (url: string) => void;
}

export function AvatarUploader({ currentUrl, onUploaded }: AvatarUploaderProps) {
  const { user } = useAuthStore();
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setUploading(true);
      try {
        // Upload to backend
        const res = await (api as any).uploadAvatar(base64, file.type);
        onUploaded?.(res.avatar_url);
        toast.success("Foto de perfil actualizada");
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Error al subir la imagen");
        setPreview(currentUrl || null);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDelete = async () => {
    try {
      await (api as any).deleteAvatar();
      setPreview(null);
      onUploaded?.("");
      toast.success("Foto eliminada");
    } catch {
      toast.error("Error al eliminar la foto");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview circle */}
      <div className="relative group">
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer transition-all"
          style={{
            borderColor: dragging ? "#6c63ff" : "hsl(var(--border))",
            background: preview ? "transparent" : "hsl(var(--secondary))",
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-primary" />
          ) : preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Camera size={22} />
              <span className="text-[10px] font-medium">Foto</span>
            </div>
          )}
        </div>

        {/* Upload overlay */}
        {!uploading && (
          <div
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={18} className="text-white" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <Upload size={13} />
          {preview ? "Cambiar foto" : "Subir foto"}
        </button>

        {preview && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={11} /> Eliminar
          </button>
        )}

        <p className="text-[10px] text-muted-foreground text-center max-w-[160px]">
          JPG, PNG o WebP · Máx. 2MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
