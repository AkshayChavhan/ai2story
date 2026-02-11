"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  ImageIcon,
  BookTemplate,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Dashboard sidebar navigation.
 * Shows branding, "New Story" CTA, and nav links with active state.
 * Used in both desktop sidebar and mobile Sheet.
 */

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Projects", href: "/projects", icon: FolderOpen, exact: false },
  { label: "Media Library", href: "/media", icon: ImageIcon, exact: false },
  { label: "Templates", href: "/templates", icon: BookTemplate, exact: false },
  { label: "Settings", href: "/settings", icon: Settings, exact: false },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className={cn("flex h-full flex-col", className)}>
      {/* Brand */}
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-foreground"
          onClick={onNavigate}
        >
          StoryForge <span className="text-primary">AI</span>
        </Link>
      </div>

      <Separator />

      {/* Create New Story CTA */}
      <div className="px-4 py-4">
        <Link
          href="/projects/new"
          className={cn(buttonVariants({ size: "default" }), "w-full gap-2")}
          onClick={onNavigate}
        >
          <Plus className="h-4 w-4" />
          New Story
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href, item.exact)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
