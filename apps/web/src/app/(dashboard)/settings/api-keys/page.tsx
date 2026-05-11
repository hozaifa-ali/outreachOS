"use client";
export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">Manage your secret API keys</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer">
          Generate New Key
        </button>
      </div>
      <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm">
        No API keys generated yet.
      </div>
    </div>
  );
}
