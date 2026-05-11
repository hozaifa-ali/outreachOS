"use client";
import { Mail, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function MailboxesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mailboxes</h1>
          <p className="text-muted-foreground mt-1">Connected email accounts for sending</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Connect Mailbox
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Gmail", "Outlook", "SMTP"].map((provider) => (
          <motion.button key={provider} whileHover={{ scale: 1.02 }} className="glass rounded-xl p-6 text-left hover:border-primary/30 transition-all cursor-pointer border border-transparent">
            <Mail className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold">Connect {provider}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {provider === "Gmail" && "Connect via Google OAuth"}
              {provider === "Outlook" && "Connect via Microsoft OAuth"}
              {provider === "SMTP" && "Add custom SMTP server"}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="glass rounded-xl p-8 text-center">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No mailboxes connected</h3>
        <p className="text-sm text-muted-foreground">Connect a mailbox to start sending campaigns.</p>
      </div>
    </div>
  );
}
