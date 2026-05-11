"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plug, CheckCircle2, XCircle, RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function IntegrationsPage() {
  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: () => apiFetch<any>("/settings/webhooks").catch(() => []),
  });

  const availableIntegrations = [
    { id: "hubspot", name: "HubSpot", category: "CRM", connected: false, icon: "🟧" },
    { id: "salesforce", name: "Salesforce", category: "CRM", connected: false, icon: "☁️" },
    { id: "slack", name: "Slack", category: "Communication", connected: true, icon: "💬" },
    { id: "clearbit", name: "Clearbit", category: "Enrichment", connected: false, icon: "🔍" },
    { id: "apollo", name: "Apollo", category: "Enrichment", connected: true, icon: "🚀" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Integrations</h1>
        <p className="text-slate-400">Connect OutreachOS to your existing revenue stack.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableIntegrations.map((integration, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={integration.id}>
            <Card className="bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-xl hover:border-white/10 transition-colors h-full flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                  {integration.icon}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">{integration.name}</CardTitle>
                  <p className="text-xs text-slate-500 font-medium">{integration.category}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-6">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sync your data bidirectionally between OutreachOS and {integration.name} automatically.
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  {integration.connected ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                      <CheckCircle2 className="w-4 h-4" /> Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <XCircle className="w-4 h-4" /> Disconnected
                    </div>
                  )}
                  <Button variant="outline" className={`h-8 px-4 text-xs font-semibold rounded-lg transition-colors ${integration.connected ? "bg-white/5 border-white/10 text-white hover:bg-danger/10 hover:text-danger hover:border-danger/20" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white"}`}>
                    {integration.connected ? "Configure" : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Plug className="w-5 h-5 text-secondary" /> Custom Webhooks
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">Push events to your custom endpoints in real-time.</p>
              </div>
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/10 rounded-xl shadow-lg transition-all active:scale-95">
                Add Endpoint
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 text-slate-500 animate-spin" /></div>
            ) : !webhooks || webhooks.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 mb-4 max-w-md">You haven't configured any custom webhooks yet. Connect your internal tools by adding an endpoint.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {webhooks.map((hook: any) => (
                  <div key={hook.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="font-medium text-white">{hook.url}</p>
                      <div className="flex gap-2 mt-2">
                        {hook.events.map((ev: string) => (
                          <span key={ev} className="text-[10px] uppercase font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded border border-white/5">{ev}</span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10 rounded-lg">Remove</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
