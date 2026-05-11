"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Send, Users, Layers, Clock, Eye } from "lucide-react";
import Link from "next/link";

const steps = [
  { label: "Name & Goal", icon: Send },
  { label: "Choose Contacts", icon: Users },
  { label: "Build Sequence", icon: Layers },
  { label: "Configure Sending", icon: Clock },
  { label: "Review & Launch", icon: Eye },
];

export default function NewCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Step {currentStep + 1} of 5</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <button onClick={() => setCurrentStep(i)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all cursor-pointer ${i === currentStep ? "bg-primary/10 text-primary border border-primary/20" : i < currentStep ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              {i < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              <span className="hidden lg:inline">{step.label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="glass rounded-xl p-8"
        >
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Campaign Details</h2>
              <div>
                <label className="block text-sm font-medium mb-1.5">Campaign Name</label>
                <input className="w-full px-4 py-2.5 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g., Q1 VP Sales Outreach" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Goal</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Book Meetings", "Get Replies", "Drive Clicks"].map((goal) => (
                    <button key={goal} className="px-4 py-3 border border-border rounded-lg text-sm hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">{goal}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Select Contact List</h2>
              <p className="text-muted-foreground text-sm">Choose a contact list or import new contacts.</p>
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a list or <Link href="/contacts/import" className="text-primary hover:underline">import contacts</Link></p>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Build Your Sequence</h2>
              <p className="text-muted-foreground text-sm">Add email steps, wait periods, and conditions. Drag to reorder.</p>
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No steps yet</p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer">+ Add Email Step</button>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Configure Sending</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">Timezone</label><select className="w-full px-4 py-2.5 bg-muted border border-border rounded-md"><option>UTC</option><option>US/Eastern</option><option>US/Pacific</option></select></div>
                <div><label className="block text-sm font-medium mb-1.5">Throttle (per hour)</label><input type="number" defaultValue={50} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md" /></div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="rounded" /> Track Opens</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="rounded" /> Track Clicks</label>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <Eye className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-semibold">Review & Launch</h2>
              <p className="text-muted-foreground text-sm">Review your campaign settings before launching.</p>
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all cursor-pointer">🚀 Launch Campaign</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-30 hover:bg-muted transition-all cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} disabled={currentStep === 4} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-30 hover:bg-primary/90 transition-all cursor-pointer">
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
