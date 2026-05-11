"use client";
import { Settings, Users, CreditCard, Key } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/settings/workspace", label: "Workspace", icon: Settings },
    { href: "/settings/team", label: "Team", icon: Users },
    { href: "/settings/billing", label: "Billing", icon: CreditCard },
    { href: "/settings/api-keys", label: "API Keys", icon: Key },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace and account settings</p>
      </div>

      <div className="flex border-b border-border gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-medium transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="glass rounded-xl p-8">
        {children}
      </div>
    </div>
  );
}
