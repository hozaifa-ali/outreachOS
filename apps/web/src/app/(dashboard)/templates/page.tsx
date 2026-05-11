"use client";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Templates</h1><p className="text-muted-foreground mt-1">Email template library</p></div>
      <div className="glass rounded-xl p-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Template Library</h3>
        <p className="text-sm text-muted-foreground">Create and manage reusable email templates.</p>
      </div>
    </div>
  );
}
