"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  FileCheck2,
  FileText,
  LogOut,
  MapPin,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProfileUpdate, updateProfile, uploadIdentityDocument, uploadProfileAvatar, useAuth, type CurrentUser } from "@/lib/auth";

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  brokerage: string;
  registration: string;
  experience: string;
  address1: string;
  address2: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
};

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10";

function Field({ label, value, onChange, type = "text", placeholder, required = false, inputMode }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: "numeric" | "text" | "tel";
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}{required && <span className="ml-1 text-rose-600" aria-hidden="true">*</span>}
      <input type={type} inputMode={inputMode} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} required={required} className={inputClass} />
    </label>
  );
}

export default function ProfilePage() {
  const { user, loading, logout, refetch } = useAuth();

  if (loading) return <main className="min-h-screen bg-slate-50" />;
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Link href="/login" className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">Sign in</Link></main>;
  return <ProfileEditor user={user} logout={logout} refetch={refetch} />;
}

function profileForm(user: CurrentUser): FormState {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    whatsapp: user.whatsapp_number ?? user.phone,
    brokerage: user.brokerage_name ?? "",
    registration: user.broker_registration_number ?? "",
    experience: user.years_experience == null ? "" : String(user.years_experience),
    address1: user.address_line1 ?? "",
    address2: user.address_line2 ?? "",
    city: user.city ?? "",
    district: user.district ?? "",
    state: user.state ?? "Uttar Pradesh",
    postalCode: user.postal_code ?? "",
  };
}

function ProfileEditor({ user, logout, refetch }: {
  user: CurrentUser;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => profileForm(user));
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);

  const profileChecks = useMemo(() => {
    const checks = [
      Boolean(form.name.trim()),
      Boolean(form.email.trim()),
      Boolean(form.whatsapp.trim()),
      Boolean(form.address1.trim()),
      Boolean(form.city.trim()),
      Boolean(form.district.trim()),
      Boolean(form.state.trim() && form.postalCode.trim()),
      Boolean(user.avatar_url),
    ];
    if (user.role === "BROKER") {
      checks.push(Boolean(form.brokerage.trim()), user.identity_verification_status !== "NOT_SUBMITTED");
    }
    return checks;
  }, [form, user]);

  const isBroker = user.role === "BROKER";
  const completion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100);
  const statusText = user.identity_verification_status === "VERIFIED"
    ? "Verified"
    : user.identity_verification_status === "PENDING"
      ? "In review"
      : user.identity_verification_status === "REJECTED"
        ? "Action required"
        : "Not submitted";

  const setField = (key: keyof FormState, value: string) => setForm(current => ({ ...current, [key]: value }));

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data: ProfileUpdate = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        whatsapp_number: form.whatsapp.trim() || null,
        brokerage_name: form.brokerage.trim() || null,
        broker_registration_number: form.registration.trim() || null,
        years_experience: form.experience ? Number(form.experience) : null,
        address_line1: form.address1.trim() || null,
        address_line2: form.address2.trim() || null,
        city: form.city.trim() || null,
        district: form.district.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postalCode.trim() || null,
      };
      await updateProfile(data);
      await refetch();
      setMessage("Profile details saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile details.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("Choose a JPEG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    setUploadingPhoto(true);
    setMessage(null);
    try {
      await uploadProfileAvatar(file);
      await refetch();
      setMessage("Profile photo updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const submitDocument = async () => {
    if (!documentFile || !consent) return;
    if (documentFile.size > 5 * 1024 * 1024) {
      setMessage("The identity document must be smaller than 5 MB.");
      return;
    }
    setUploadingDocument(true);
    setMessage(null);
    try {
      await uploadIdentityDocument(documentFile);
      await refetch();
      setDocumentFile(null);
      setConsent(false);
      setMessage("Identity document submitted for review.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit identity document.");
    } finally {
      setUploadingDocument(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 md:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="overflow-hidden rounded-3xl bg-slate-950 text-white">
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Professional account</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">{isBroker ? "Broker profile & verification" : "Your profile"}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{isBroker ? "Build trust with complete business details, a clear profile photo, and verified contact information." : "Keep your contact details and account information up to date."}</p>
              </div>
              <div className="min-w-52 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm font-bold"><span>Profile readiness</span><span>{completion}%</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${completion}%` }} /></div>
                <p className="mt-2 text-xs text-slate-400">{profileChecks.filter(Boolean).length} of {profileChecks.length} profile checks complete</p>
              </div>
            </div>
          </header>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <form onSubmit={event => void save(event)} className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-emerald-800">
                      {user.avatar_url ? <img src={user.avatar_url} alt="Broker profile" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Public-facing identity</p>
                      <h2 className="mt-1 text-lg font-extrabold text-slate-950">{form.name || "Your professional name"}</h2>
                      <p className="mt-1 text-sm text-slate-500">{form.brokerage || "Add your brokerage or business name"}</p>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:border-emerald-700 hover:text-emerald-800">
                    <Camera className="h-4 w-4" />{uploadingPhoto ? "Uploading..." : "Change photo"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingPhoto} onChange={event => { void uploadPhoto(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><UserRound className="h-5 w-5" /></span>
                  <div><h2 className="font-extrabold text-slate-950">Contact details</h2><p className="text-sm text-slate-500">How clients and our team can reach you</p></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" value={form.name} onChange={value => setField("name", value)} placeholder="As shown on your ID" required />
                  <Field label="Email address" value={form.email} onChange={value => setField("email", value)} type="email" placeholder="you@business.com" />
                  <label className="block text-sm font-semibold text-slate-700">Login mobile number
                    <input value={`+91 ${user.phone}`} readOnly className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`} />
                  </label>
                  <Field label="WhatsApp number" value={form.whatsapp} onChange={value => setField("whatsapp", value)} type="tel" placeholder="10-digit mobile number" />
                </div>
              </section>

              {isBroker && <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><Building2 className="h-5 w-5" /></span>
                  <div><h2 className="font-extrabold text-slate-950">Brokerage details</h2><p className="text-sm text-slate-500">Professional credentials and experience</p></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Agency / brokerage name" value={form.brokerage} onChange={value => setField("brokerage", value)} placeholder="Registered business name" />
                  <Field label="RERA / registration number" value={form.registration} onChange={value => setField("registration", value)} placeholder="If applicable in your market" />
                  <Field label="Years of experience" value={form.experience} onChange={value => setField("experience", value)} type="number" placeholder="e.g. 5" />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">Enter a registration number only where applicable. We do not treat an optional registration number as a substitute for identity verification.</p>
              </section>}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-800"><MapPin className="h-5 w-5" /></span>
                  <div><h2 className="font-extrabold text-slate-950">Office / business address</h2><p className="text-sm text-slate-500">Use the address associated with your brokerage</p></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Field label="Address line 1" value={form.address1} onChange={value => setField("address1", value)} placeholder="Building, street, area" /></div>
                  <div className="sm:col-span-2"><Field label="Address line 2" value={form.address2} onChange={value => setField("address2", value)} placeholder="Landmark or unit (optional)" /></div>
                  <Field label="City / town" value={form.city} onChange={value => setField("city", value)} />
                  <Field label="District" value={form.district} onChange={value => setField("district", value)} />
                  <Field label="State" value={form.state} onChange={value => setField("state", value)} />
                  <Field label="PIN code" value={form.postalCode} onChange={value => setField("postalCode", value)} inputMode="numeric" placeholder="6-digit PIN code" />
                </div>
              </section>

              {isBroker && <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><ShieldCheck className="h-5 w-5" /></span>
                    <div><h2 className="font-extrabold text-slate-950">Identity verification</h2><p className="text-sm text-slate-500">Status: <span className="font-bold text-slate-700">{statusText}</span></p></div>
                  </div>
                  {user.identity_verification_status === "VERIFIED" ? <BadgeCheck className="h-6 w-6 text-emerald-700" /> : <FileCheck2 className="h-6 w-6 text-amber-600" />}
                </div>
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-amber-950">Upload a masked Aadhaar or another government ID</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900">For Aadhaar, hide the first 8 digits before uploading. You may instead use an accepted government identity document. Do not enter your Aadhaar number into profile fields.</p>
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{documentFile?.name ?? user.identity_document_filename ?? "No document selected"}</p>
                      <p className="text-xs text-slate-500">JPEG, PNG, WebP, or PDF · up to 5 MB</p>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <Upload className="h-4 w-4" />Choose file
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={event => { setDocumentFile(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} />
                  </label>
                </div>
                <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-slate-600">
                  <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700" />
                  <span>I consent to secure storage and review of this document for broker account verification. I have masked my Aadhaar number if this upload is an Aadhaar document.</span>
                </label>
                {user.identity_verification_note && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">Review note: {user.identity_verification_note}</p>}
                <button type="button" onClick={() => void submitDocument()} disabled={!documentFile || !consent || uploadingDocument} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45">
                  <Upload className="h-4 w-4" />{uploadingDocument ? "Submitting..." : "Submit for verification"}
                </button>
                <p className="mt-3 text-xs text-slate-500">Identity files are stored privately and are not served as public profile media.</p>
              </section>}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <p aria-live="polite" className="text-sm font-semibold text-slate-600">{message ?? "Your profile information is visible only where needed to operate your account."}</p>
                <button type="submit" disabled={saving} className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-900 disabled:opacity-50">{saving ? "Saving..." : "Save profile"}</button>
              </div>
            </form>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Account summary</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Building2 className="h-5 w-5" /></span>
                  <div><p className="font-extrabold capitalize text-slate-950">{isBroker ? "Real estate broker" : user.role.toLowerCase()}</p><p className="text-xs text-slate-500">Member since {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p></div>
                </div>
                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Mobile</span><span className="font-semibold text-slate-800">+91 {user.phone}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Account check</span><span className="inline-flex items-center gap-1 font-semibold text-slate-800">{user.is_verified ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <ShieldCheck className="h-4 w-4 text-amber-600" />}{user.is_verified ? "Verified" : "Pending"}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">ID review</span><span className="font-semibold text-slate-800">{statusText}</span></div>
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 font-extrabold text-slate-900"><ShieldCheck className="h-4 w-4 text-emerald-800" />Privacy & safety</div>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                  <li>Never share OTPs or passwords with anyone.</li>
                  <li>Only upload masked Aadhaar images; do not submit the full Aadhaar number.</li>
                  <li>Identity documents are private and available only to you and authorized reviewers.</li>
                </ul>
              </section>
              <button onClick={() => void logout()} className="flex w-full items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50"><LogOut className="h-4 w-4" />Sign out</button>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function LegacyProfilePage() {
  const { user, loading, logout, refetch } = useAuth();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="min-h-screen bg-slate-bg" />;
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-slate-bg"><Link href="/login" className="rounded-xl bg-agri-green px-5 py-3 font-bold text-white">Sign in</Link></main>;

  const save = async () => { if (!name.trim()) return; setSaving(true); setMessage(null); try { await updateProfile({ name: name.trim() }); await refetch(); setMessage("Profile updated"); setName(""); } catch { setMessage("Unable to update profile"); } finally { setSaving(false); } };

  return <><Navbar /><main className="min-h-screen bg-slate-bg px-4 pb-16 pt-28 md:px-6"><div className="mx-auto max-w-2xl"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-agri-green-100 text-2xl font-black text-agri-green">{(user.name ?? user.phone).charAt(0).toUpperCase()}</div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile</p><h1 className="mt-1 text-2xl font-black text-slate-950">{user.name ?? "Complete your profile"}</h1><p className="mt-1 text-sm text-slate-500">+91 {user.phone}</p></div></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Account type</p><p className="mt-1 font-bold text-slate-900">{user.role}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Verification</p><p className="mt-1 flex items-center gap-1 font-bold text-slate-900">{user.is_verified ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verified</> : <><ShieldCheck className="h-4 w-4 text-amber-600" /> Pending</>}</p></div></div><div className="mt-8 border-t border-slate-100 pt-6"><label className="text-sm font-bold text-slate-700">Update display name</label><div className="mt-2 flex gap-2"><input value={name} onChange={event => setName(event.target.value)} placeholder={user.name ?? "Your full name"} className="input-modern" /><button onClick={() => void save()} disabled={saving || name.trim().length < 2} className="rounded-xl bg-agri-green px-5 py-2 text-sm font-bold text-white disabled:opacity-50">Save</button></div>{message && <p className="mt-3 text-sm font-semibold text-agri-green">{message}</p>}</div><button onClick={() => void logout()} className="mt-8 flex items-center gap-2 text-sm font-bold text-red-600"><LogOut className="h-4 w-4" /> Sign out</button></div></div></main></>;
}