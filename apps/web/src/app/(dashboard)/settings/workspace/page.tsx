"use client";
import { useState } from "react";

export default function WorkspaceSettingsPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Workspace Settings</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1.5">Workspace Name</label>
          <input className="w-full px-4 py-2 bg-muted border border-border rounded-md" defaultValue="Acme Corp" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Timezone</label>
          <select className="w-full px-4 py-2 bg-muted border border-border rounded-md">
            <option>UTC</option>
            <option>US/Eastern</option>
            <option>US/Pacific</option>
          </select>
        </div>
        <button
          onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1000); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
