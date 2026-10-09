"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page could not be loaded. You can try again, or go back to listings.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-xl bg-agri-green px-4 py-2.5 text-sm font-bold text-white"
          >
            Try again
          </button>
          <Link href="/listings" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">
            View listings
          </Link>
        </div>
      </div>
    </main>
  );
}
