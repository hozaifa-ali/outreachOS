"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Search, Filter, MessageSquare, CornerUpLeft, MoreVertical, Star, Inbox as InboxIcon, Send, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InboxPage() {
  const { data: threads, isLoading } = useQuery({
    queryKey: ["inbox-threads"],
    queryFn: () => apiFetch<any>("/inbox"),
  });

  const [selectedThread, setSelectedThread] = useState<any>(null);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col sm:flex-row gap-6 relative">
      {/* Left List View */}
      <Card className={`bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-2xl flex flex-col h-full w-full sm:w-[400px] shrink-0 overflow-hidden transition-all duration-300 ${selectedThread ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Inbox</h2>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 text-slate-300 hover:text-white">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-[#050505]/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 border-b border-white/5 animate-pulse bg-white/5 h-24" />
              ))}
            </div>
          ) : threads?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
              <InboxIcon className="w-12 h-12 mb-4 opacity-50" />
              <p>No messages yet.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {threads?.map((thread: any, i: number) => (
                <motion.button
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 text-left hover:bg-white/5 transition-colors relative ${selectedThread?.id === thread.id ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold ${selectedThread?.id === thread.id ? "text-primary" : "text-white"}`}>{thread.contact.email}</span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium truncate mb-1">Re: {thread.messages[0]?.subject || "New Message"}</p>
                  <p className="text-xs text-slate-500 truncate line-clamp-2">{thread.messages[0]?.bodyPreview || "No preview available"}</p>
                  
                  {thread.label && (
                    <div className="mt-2 flex gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded border border-white/5">
                        {thread.label.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Right Detail View */}
      <Card className={`flex-1 bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-2xl flex-col overflow-hidden transition-all duration-300 ${!selectedThread ? "hidden sm:flex items-center justify-center bg-[#050505]/50" : "flex"}`}>
        {!selectedThread ? (
          <div className="text-center p-8 text-slate-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Select a conversation to read</p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setSelectedThread(null)} className="sm:hidden p-1 -ml-1 text-slate-400 hover:text-white rounded">
                    <CornerUpLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-bold text-white tracking-tight">{selectedThread.messages?.[0]?.subject || "Conversation"}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> {selectedThread.contact.firstName} {selectedThread.contact.lastName}</span>
                  <span>&lt;{selectedThread.contact.email}&gt;</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                  <Star className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thread Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-[#050505]/30">
              <AnimatePresence>
                {selectedThread.messages?.map((msg: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${msg.direction === "outbound" ? "ml-auto" : "mr-auto"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-semibold text-slate-400">
                        {msg.direction === "outbound" ? "You" : selectedThread.contact.firstName || selectedThread.contact.email}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      msg.direction === "outbound" 
                        ? "bg-primary text-white rounded-tr-sm shadow-[0_0_20px_rgba(99,102,241,0.2)]" 
                        : "bg-white/10 text-slate-200 rounded-tl-sm border border-white/5"
                    }`}>
                      <div className="prose prose-sm prose-invert max-w-none font-sans" dangerouslySetInnerHTML={{ __html: msg.bodyHtml || msg.bodyText }} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Reply Box */}
            <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0a0a0f]">
              <div className="relative">
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-16 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none transition-all shadow-inner"
                  placeholder="Draft your reply..."
                />
                <button className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-white p-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center group">
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10">Enter</kbd> to send</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-secondary" /> AI Rewrite available</span>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
