"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreVertical, Play, Pause, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function CampaignsPage() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => apiFetch<any>("/campaigns"),
  });

  const campaigns = response?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Campaigns</h1>
          <p className="text-slate-400">Create and manage your automated outbound sequences.</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f]/80 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto bg-[#0a0a0f]/80 backdrop-blur-md border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 text-danger p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p>Failed to load campaigns</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-[#0a0a0f]/50 backdrop-blur-md border border-white/5 rounded-3xl text-center shadow-2xl">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No campaigns yet</h3>
          <p className="text-slate-400 max-w-md mb-8">Get started by creating your first automated outreach sequence to start engaging prospects.</p>
          <Link href="/campaigns/new">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform">
              Create Campaign
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign: any, i: number) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={campaign.id}
            >
              <Card className="bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-xl hover:border-primary/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all group overflow-hidden relative">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  campaign.status === "active" ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : 
                  campaign.status === "paused" ? "bg-amber-500" : "bg-slate-500"
                }`} />

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate pr-4">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 capitalize bg-white/5 px-2 py-1 rounded-md">
                          {campaign.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {campaign.status}
                        </span>
                        <span className="text-xs text-slate-500 border-l border-white/10 pl-2">
                          Created {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium mb-1">Contacts</span>
                      <span className="text-xl font-bold text-white">0</span>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-4">
                      <span className="text-xs text-slate-500 font-medium mb-1">Open Rate</span>
                      <span className="text-xl font-bold text-white">0%</span>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-4">
                      <span className="text-xs text-slate-500 font-medium mb-1">Reply Rate</span>
                      <span className="text-xl font-bold text-primary">0%</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-lg h-9 text-xs">
                      Edit Sequence
                    </Button>
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-lg h-9 w-9 p-0">
                      {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
