"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Send, Users, BarChart3, Bot, Zap, Sparkles, Terminal } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary/30 font-sans overflow-hidden">
      
      {/* --- Futuristic Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center items-center">
        <div className="absolute inset-0 bg-grid-white opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* --- Navigation --- */}
      <nav className="relative z-50 w-full border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-white">Outreach<span className="text-primary">OS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="relative group overflow-hidden rounded-full p-[1px]">
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-70 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
              <div className="relative px-6 py-2 bg-[#0a0a0f] rounded-full text-sm font-medium text-white transition-all group-hover:bg-opacity-0">
                Start Free Trial
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto pt-12 md:pt-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span>OutreachOS 2.0 Powered by Claude 3.5</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05]"
            >
              Scale Outbound <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-pulse-glow">
                On Autopilot.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
            >
              The ultimate infrastructure for B2B revenue teams. Generate leads, personalize with AI, and track every conversion event in a single, high-performance command center.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="/signup" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                Initialize Workspace 
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <ArrowRight className="w-5 h-5 group-hover:text-primary transition-colors" />
                </motion.div>
              </Link>
              <Link href="#platform" className="flex items-center justify-center gap-2 px-8 py-4 glass-card text-white hover:bg-white/10 rounded-full font-bold text-lg transition-all border border-white/10 hover:border-white/20">
                <Terminal className="w-5 h-5" /> View Docs
              </Link>
            </motion.div>
          </div>

          {/* --- Glowing Dashboard Preview --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-24 relative max-w-5xl mx-auto perspective-1000"
          >
            <div className="glowing-border rounded-2xl p-2 bg-[#050505]/80 backdrop-blur-2xl shadow-2xl transform rotate-x-12 rotate-y-[-5deg] scale-100 hover:scale-[1.02] transition-transform duration-700 ease-out">
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0f] aspect-[16/9] flex relative">
                
                {/* Sidebar Mock */}
                <div className="w-48 md:w-64 border-r border-white/5 bg-[#050505] p-4 hidden sm:block">
                  <div className="h-6 w-24 bg-white/10 rounded mb-8" />
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`h-8 rounded-md ${i === 1 ? 'bg-primary/20 border border-primary/30' : 'bg-white/5'} w-full`} />
                    ))}
                  </div>
                </div>

                {/* Main Content Mock */}
                <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 bg-grid-white relative">
                  <div className="absolute inset-0 bg-[#0a0a0f]/80 pointer-events-none" />
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="h-8 w-48 bg-white/10 rounded-md" />
                    <div className="h-8 w-32 bg-primary/20 rounded-full border border-primary/30" />
                  </div>
                  
                  <div className="relative z-10 grid grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                        <div className="h-4 w-16 bg-white/10 rounded" />
                        <div className="h-8 w-24 bg-white/20 rounded" />
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 flex-1 bg-white/5 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                    <div className="h-12 border-b border-white/5 bg-[#050505]" />
                    <div className="flex-1 p-4 space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 bg-white/5 rounded-lg w-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* --- Bento Grid Features --- */}
      <section id="features" className="relative z-10 py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Engineered for <span className="text-primary">Performance</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Everything you need to scale outbound revenue, packaged in a beautifully fast, responsive interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 (Span 2) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-2 glass-card rounded-3xl p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                <Bot className="w-10 h-10 text-primary mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">Autonomous AI Agents</h3>
              <p className="text-slate-400 text-lg max-w-md">
                Deploy 5 specialized AI agents that write copy, personalize openers based on LinkedIn data, and classify inbox replies automatically.
              </p>
            </motion.div>

            {/* Bento Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-10 relative overflow-hidden group"
            >
              <motion.div animate={{ x: [0, 8, 0], y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                <Send className="w-10 h-10 text-secondary mb-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Sequencing</h3>
              <p className="text-slate-400">
                A/B test infinite variations. The platform automatically routes prospects down different branches based on behavior.
              </p>
            </motion.div>

            {/* Bento Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-10 relative overflow-hidden group"
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                <Users className="w-10 h-10 text-white mb-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-4">Live Enrichment</h3>
              <p className="text-slate-400">
                Upload a bare CSV. OutreachOS uses Clearbit & Apollo to instantly append verified emails, phone numbers, and titles.
              </p>
            </motion.div>

            {/* Bento Card 4 (Span 2) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-2 glass-card rounded-3xl p-10 relative overflow-hidden group"
            >
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-secondary/10 to-transparent" />
              <motion.div animate={{ height: ["100%", "80%", "100%"] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mb-6 h-10 overflow-hidden flex items-end">
                <BarChart3 className="w-10 h-10 text-secondary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">ClickHouse-Powered Analytics</h3>
              <p className="text-slate-400 text-lg max-w-md relative z-10">
                Process millions of email events in milliseconds. Track opens, clicks, and replies with sub-second latency and absolute precision.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- Footer CTA --- */}
      <section className="relative z-10 py-32 border-t border-white/5">
        <div className="absolute inset-0 bg-primary/5 bg-dot-white" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Stop typing. Start closing.</h2>
          <Link href="/signup" className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
            Deploy OutreachOS 
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </Link>
          <p className="mt-6 text-slate-400">14-day free trial. No credit card required.</p>
        </div>
      </section>
    </div>
  );
}
