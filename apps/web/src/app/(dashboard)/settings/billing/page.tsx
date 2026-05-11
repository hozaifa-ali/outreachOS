"use client";
export default function BillingSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Billing & Plan</h2>
      <div className="p-4 border border-border rounded-lg bg-muted/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-primary">Starter Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">2,500 emails/month • 1 seat</p>
        </div>
        <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted cursor-pointer">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
