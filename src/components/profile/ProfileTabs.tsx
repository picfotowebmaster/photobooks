"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Tab = { id: string; label: string; icon: LucideIcon };

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <nav className="flex gap-1 border-b border-neutral-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === tab.id
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
          )}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
