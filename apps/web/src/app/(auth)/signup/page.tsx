"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Building, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", orgName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<any>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  const MicrosoftIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 21 21">
      <path fill="#f25022" d="M0 0h10v10H0z"/>
      <path fill="#7fba00" d="M11 0h10v10H11z"/>
      <path fill="#00a4ef" d="M0 11h10v10H0z"/>
      <path fill="#ffb900" d="M11 11h10v10H11z"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex bg-[#050505] text-slate-200 selection:bg-primary/30">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-[#0a0a0f] border-r border-white/5">
        <div className="absolute inset-0 bg-grid-white opacity-10" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-secondary/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Outreach<span className="text-primary">OS</span></span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Scale outbound in minutes.</h2>
          <div className="space-y-4">
            {["AI Personalization", "Smart Sequencing", "Real-time Analytics"].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#6366f1]" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 relative py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-10 justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Outreach<span className="text-primary">OS</span></span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">Create workspace</h1>
            <p className="text-slate-400 mt-2">Start your 14-day free trial. No credit card required.</p>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button className="flex-1 flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">
              <GoogleIcon /> Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">
              <MicrosoftIcon /> Microsoft
            </button>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Or continue with email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl p-4 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text" required value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="Company Name"
                />
              </div>
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                placeholder="Work Email"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                placeholder="Create Password (min. 8 characters)"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              {loading ? "Creating..." : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
