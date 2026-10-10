"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  fetchPropertyDocuments,
  uploadPropertyDocument,
  type PropertyDocument,
  API_ORIGIN,
} from "@/lib/api/client";

interface PropertyDocumentsPanelProps {
  propertyId: string;
  onClose: () => void;
}

const DOCUMENT_TYPES = ["KHATAUNI", "KHASRA", "REGISTRY", "OTHER"] as const;
type DocumentType = (typeof DOCUMENT_TYPES)[number];

const TYPE_LABELS: Record<DocumentType, string> = {
  KHATAUNI: "Khatauni",
  KHASRA: "Khasra",
  REGISTRY: "Registry",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function PropertyDocumentsPanel({
  propertyId,
  onClose,
}: PropertyDocumentsPanelProps) {
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("KHATAUNI");
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const docs = await fetchPropertyDocuments(propertyId);
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadPropertyDocument(propertyId, file, selectedType);
      // Re-fetch documents list after upload
      setLoading(true);
      await loadDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload document");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mt-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Legal Documents</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close documents panel"
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

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-agri-green" />
          Loading documents…
        </div>
      ) : documents.length === 0 ? (
        <p className="mb-3 text-xs text-slate-400">No documents uploaded yet.</p>
      ) : (
        <ul className="mb-3 divide-y divide-slate-100">
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center gap-3 py-2.5">
              <span className="text-xl" aria-hidden>📄</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{doc.filename}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    {doc.type}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[doc.status] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {doc.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${doc.filename}`}
                className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:border-agri-green/40 hover:text-agri-green transition-colors"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Upload section */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`doc-type-select-${propertyId}`}>
          Document type
        </label>
        <select
          id={`doc-type-select-${propertyId}`}
          value={selectedType}
          onChange={e => setSelectedType(e.target.value as DocumentType)}
          disabled={uploading}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-agri-green disabled:opacity-60"
        >
          {DOCUMENT_TYPES.map(type => (
            <option key={type} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-agri-green/30 bg-agri-green-50 px-3 py-2 text-xs font-bold text-agri-green hover:bg-agri-green-100 transition-colors">
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading…
            </>
          ) : (
            "Upload Document"
          )}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            disabled={uploading || loading}
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}
