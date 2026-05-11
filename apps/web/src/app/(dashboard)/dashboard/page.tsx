"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Send, MousePointerClick, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<any>("/analytics/aggregate"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 text-danger p-6 rounded-2xl flex items-center gap-3">
        <Activity className="w-6 h-6" />
        <p>Failed to load analytics: {(error as any).message}</p>
      </div>
    );
  }

  const metrics = [
    { title: "Total Sent", value: data?.totalSent || 0, icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Total Opens", value: data?.totalOpens || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { title: "Total Clicks", value: data?.totalClicks || 0, icon: MousePointerClick, color: "text-secondary", bg: "bg-secondary/10" },
    { title: "Total Replies", value: data?.totalReplies || 0, icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Overview</h1>
        <p className="text-slate-400">Track your overall outbound performance and revenue metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={m.title}
          >
            <Card className="bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-xl hover:border-white/10 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{m.title}</CardTitle>
                <div className={`p-2 rounded-xl ${m.bg}`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {m.value.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-md font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% this month
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-xl h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Engagement Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-t border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
              <div className="text-slate-500 flex flex-col items-center gap-3 relative z-10">
                <BarChart3 className="w-10 h-10 opacity-50" />
                <span>Chart visualization available in next release</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-xl h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="border-t border-white/5 pt-6">
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      <div>
                        <p className="text-sm font-medium text-white">Q3 Enterprise Outreach</p>
                        <p className="text-xs text-slate-400 mt-0.5">2,450 contacts enrolled</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">8.4% Reply</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
