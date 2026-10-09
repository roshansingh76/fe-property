"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Shield, ArrowRight, Leaf, RotateCcw,
  CheckCircle2, AlertCircle, ShoppingBag, Briefcase, Home,
} from "lucide-react";
import { requestOTP, verifyOTP, type UserRole } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type Step = "phone" | "otp" | "success";
type LoginRole = Extract<UserRole, "BUYER" | "SELLER" | "BROKER">;
type BrokerMode = "signin" | "register";

const ROLES: { value: LoginRole; label: string; sub: string; icon: React.ElementType; color: string }[] = [
  { value: "BUYER",  label: "Buyer",  sub: "Browse & enquire",   icon: ShoppingBag, color: "text-trust-blue   bg-trust-blue-50   border-trust-blue/30"  },
  { value: "SELLER", label: "Seller", sub: "List my property",   icon: Home,        color: "text-agri-green  bg-agri-green-50   border-agri-green/30"   },
  { value: "BROKER", label: "Broker", sub: "Register & manage clients", icon: Briefcase, color: "text-violet-600  bg-violet-50       border-violet-300" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-forest-950" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step,      setStep]      = useState<Step>("phone");
  const [phone,     setPhone]     = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [brokerMode, setBrokerMode] = useState<BrokerMode>("signin");
  const [role,      setRole]      = useState<LoginRole>(searchParams.get("role") === "BROKER" ? "BROKER" : "BUYER");
  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleRequestOTP = async () => {
    if (role === "BROKER" && brokerMode === "register" && brokerName.trim().length < 2) {
      setError("Enter your full name to register as a broker");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true); setError("");
    try {
      await requestOTP(phone);
      setStep("otp"); setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp]; next[index] = value.slice(-1); setOtp(next); setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every(d => d !== "")) void handleVerifyOTP(next.join(""));
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split("")); otpRefs.current[5]?.focus(); void handleVerifyOTP(pasted); }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true); setError("");
    try {
      const user = await verifyOTP(phone, code, role, role === "BROKER" && brokerMode === "register" ? brokerName.trim() : undefined);
      setStep("success");
      setTimeout(() => {
        if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) router.push("/admin");
        else if (user.role === "BROKER")                  router.push("/broker");
        else if (["SELLER", "AGENT"].includes(user.role)) router.push("/seller");
        else                                              router.push("/buyer");
      }, 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Invalid OTP");
      setOtp(["", "", "", "", "", ""]); otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setLoading(true); setError("");
    try {
      await requestOTP(phone); setCountdown(60); setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to resend OTP");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-950 via-forest-900 to-agri-green-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-agri-green to-forest-600 rounded-2xl flex items-center justify-center shadow-green">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-extrabold text-xl">Palia Property Hub</div>
            <div className="text-white/50 text-xs font-medium">Palia Kalan, Lakhimpur Kheri</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-agri-green via-forest-500 to-harvest-gold" />

          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── Step: Phone ── */}
              {step === "phone" && (
                <motion.div key="phone"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-agri-green-50 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-agri-green" />
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-slate-900">Sign In / Register</h1>
                      <p className="text-slate-500 text-sm">Enter your mobile to continue</p>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">I want to join as…</p>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map(r => {
                        const Icon = r.icon;
                        const active = role === r.value;
                        return (
                          <button
                            key={r.value}
                            onClick={() => setRole(r.value)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 text-center",
                              active
                                ? `${r.color} border-current shadow-sm`
                                : "border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-extrabold leading-none">{r.label}</span>
                            <span className="text-[10px] leading-tight opacity-70">{r.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {role === "BROKER" && (
                    <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1" aria-label="Broker account action">
                      <button type="button" onClick={() => { setBrokerMode("signin"); setError(""); }} className={cn("rounded-lg px-3 py-2 text-sm font-bold transition", brokerMode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>Sign in</button>
                      <button type="button" onClick={() => { setBrokerMode("register"); setError(""); }} className={cn("rounded-lg px-3 py-2 text-sm font-bold transition", brokerMode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>Register</button>
                    </div>
                  )}

                  {role === "BROKER" && (
                    brokerMode === "register" && <div className="mb-4">
                      <label htmlFor="broker-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                        Broker full name
                      </label>
                      <input
                        id="broker-name"
                        autoComplete="name"
                        value={brokerName}
                        onChange={event => { setBrokerName(event.target.value); setError(""); }}
                        maxLength={120}
                        placeholder="Your legal name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10 focus:bg-white transition-all"
                      />
                    </div>
                  )}

                  {/* Phone input */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 select-none whitespace-nowrap">
                        🇮🇳 +91
                      </div>
                      <input
                        autoComplete="tel"
                        aria-label="10-digit Indian mobile number"
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                        onKeyDown={e => e.key === "Enter" && void handleRequestOTP()}
                        placeholder="98765 43210"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 tracking-widest outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleRequestOTP}
                    disabled={loading || phone.length !== 10}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-agri-green to-forest-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-xl hover:shadow-green transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><span>Get OTP</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>

                  <p className="text-center text-xs text-slate-400 mt-5">
                    {role === "BROKER" && brokerMode === "signin" ? "Returning broker? Sign in with your registered mobile number." : "No password needed · Verify with a one-time code"}
                  </p>
                </motion.div>
              )}

              {/* ── Step: OTP ── */}
              {step === "otp" && (
                <motion.div key="otp"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-trust-blue-50 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-trust-blue" />
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-slate-900">Enter OTP</h1>
                      <p className="text-slate-500 text-sm">
                        Sent to <strong className="text-slate-700">+91 {phone}</strong>
                        {" · "}<span className="capitalize text-agri-green font-semibold">{role.toLowerCase()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center mb-5" onPaste={handleOTPPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="tel" inputMode="numeric" maxLength={1} value={digit}
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        aria-label={`OTP digit ${i + 1}`}
                        onChange={e => handleOTPChange(i, e.target.value)}
                        onKeyDown={e => handleOTPKeyDown(i, e)}
                        className={cn(
                          "w-12 h-14 text-center text-xl font-extrabold border-2 rounded-xl outline-none transition-all duration-200",
                          digit
                            ? "border-agri-green bg-agri-green-50 text-agri-green"
                            : "border-slate-200 bg-slate-50 text-slate-900 focus:border-agri-green focus:bg-white focus:ring-2 focus:ring-agri-green/10"
                        )}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </motion.div>
                  )}

                  <button
                    onClick={() => void handleVerifyOTP(otp.join(""))}
                    disabled={loading || otp.some(d => !d)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-agri-green to-forest-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-xl hover:shadow-green transition-all"
                  >
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><CheckCircle2 className="w-5 h-5" /><span>Verify &amp; Continue</span></>
                    }
                  </button>

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }}
                      className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      ← Change number
                    </button>
                    {countdown > 0 ? (
                      <span className="text-xs text-slate-400">Resend in {countdown}s</span>
                    ) : (
                      <button onClick={handleResend} disabled={loading}
                        className="text-xs font-semibold text-agri-green hover:text-forest-700 flex items-center gap-1 transition-colors">
                        <RotateCcw className="w-3 h-3" /> Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step: Success ── */}
              {step === "success" && (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 bg-agri-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-agri-green" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-1">Welcome!</h2>
                  <p className="text-slate-500 text-sm">Taking you to your dashboard…</p>
                  <div className="mt-4 flex justify-center">
                    <span className="w-6 h-6 border-2 border-agri-green border-t-transparent rounded-full animate-spin" />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          By signing in you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}
