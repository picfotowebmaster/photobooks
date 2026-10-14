"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NavLink {
  href: string;
  label: string;
  Icon: LucideIcon;
}

interface NavSidebarProps {
  links: NavLink[];
  children?: ReactNode;
}

export function NavSidebar({ links, children }: NavSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-neutral-200 bg-neutral-50 flex flex-col p-4 gap-1">
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname.startsWith(link.href)
                ? "bg-neutral-200 text-neutral-900 font-medium"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            <link.Icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </aside>
  );
}
