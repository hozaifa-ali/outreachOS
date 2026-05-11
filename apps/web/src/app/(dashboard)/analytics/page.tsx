"use client";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your outreach performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Emails Sent", value: "—", sub: "this month" },
          { label: "Open Rate", value: "—", sub: "avg" },
          { label: "Reply Rate", value: "—", sub: "avg" },
          { label: "Bounce Rate", value: "—", sub: "avg" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-5">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl p-8 text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Campaign Performance</h3>
        <p className="text-sm text-muted-foreground">Charts will appear once you have campaign data</p>
      </div>
    </div>
  );
}
