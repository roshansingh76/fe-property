"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { uploadPropertyImages, deletePropertyImage } from "@/lib/api/client";

interface PropertyImagesPanelProps {
  propertyId: string;
  initialImages: string[];
  onClose: () => void;
  onImagesUpdated: (images: string[]) => void;
}

export function PropertyImagesPanel({
  propertyId,
  initialImages,
  onClose,
  onImagesUpdated,
}: PropertyImagesPanelProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (imageUrl: string) => {
    setError(null);
    try {
      const updated = await deletePropertyImage(propertyId, imageUrl);
      setImages(updated);
      onImagesUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete image");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const newUrls = await uploadPropertyImages(propertyId, files);
      const updated = [...images, ...newUrls];
      setImages(updated);
      onImagesUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload images");
    } finally {
      setUploading(false);
      // Reset file input so the same files can be re-selected if needed
      event.target.value = "";
    }
  };

  return (
    <div className="mt-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Property Images</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close images panel"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Property image ${index + 1}`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => void handleDelete(url)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-xs text-slate-400">No images uploaded yet.</p>
      )}

      {/* Upload input */}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-agri-green/30 bg-agri-green-50 px-3 py-2 text-xs font-bold text-agri-green hover:bg-agri-green-100 transition-colors">
        {uploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading…
          </>
        ) : (
          "Upload Photos"
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          onChange={handleUpload}
          className="sr-only"
        />
      </label>

      {/* Spinner overlay */}
      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-agri-green" />
          Uploading photos, please wait…
        </div>
      )}
    </div>
  );
}
