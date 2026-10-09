import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-agri-green-50 text-agri-green">
          <Leaf className="h-7 w-7" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">404</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This listing or page is no longer available. Browse live properties around Palia Kalan instead.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-agri-green px-4 py-2.5 text-sm font-bold text-white">
            Go home
          </Link>
          <Link href="/listings" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">
            Browse listings
          </Link>
        </div>
      </div>
    </main>
  );
}
