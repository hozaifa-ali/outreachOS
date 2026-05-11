"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import {
  LayoutDashboard, Send, Users, Inbox, BarChart3, Mail,
  FileText, Settings, Plug, LogOut, Menu, X, Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Send },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const configItems = [
  { href: "/mailboxes", label: "Mailboxes", icon: Mail },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/workspace", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]); // Close menu on route change

  const NavContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Outreach<span className="text-primary">OS</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 no-scrollbar">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Core</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}>
                  <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Configuration</p>
          <div className="space-y-1">
            {configItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}>
                  <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-danger/10 hover:text-danger w-full transition-all cursor-pointer">
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 overflow-hidden font-sans">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0a0a0f] border-r border-white/5 relative z-20">
        <NavContent />
      </aside>

      {/* --- Mobile Sidebar Overlay --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.3 }} className="md:hidden fixed inset-y-0 left-0 w-72 bg-[#0a0a0f] border-r border-white/5 z-50 flex flex-col shadow-2xl">
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white leading-tight">{user?.fullName || user?.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              {user?.fullName?.[0] || user?.email?.[0] || "U"}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
