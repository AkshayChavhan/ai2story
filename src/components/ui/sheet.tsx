"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * Sheet component set — Shadcn/UI style (no Radix dependency).
 * Slide-in panel from the left side with overlay and CSS transitions.
 */

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  // Escape key handler
  React.useEffect(() => {
    if (!open) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return <>{children}</>;
}

// ─── SheetOverlay ────────────────────────────────────────────────────

interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
}

const SheetOverlay = React.forwardRef<HTMLDivElement, SheetOverlayProps>(
  ({ className, open, onClose, ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity",
          className
        )}
        onClick={onClose}
        aria-hidden="true"
        {...props}
      />
    );
  }
);
SheetOverlay.displayName = "SheetOverlay";

// ─── SheetContent ────────────────────────────────────────────────────

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
  side?: "left" | "right";
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, open, onClose, side = "left", children, ...props }, ref) => (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-y-0 z-50 bg-background shadow-lg transition-transform duration-300 ease-in-out",
        side === "left" && "left-0",
        side === "right" && "right-0",
        open
          ? "translate-x-0"
          : side === "left"
            ? "-translate-x-full"
            : "translate-x-full",
        className
      )}
      {...props}
    >
      {children}
      <button
        type="button"
        className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
);
SheetContent.displayName = "SheetContent";

export { Sheet, SheetOverlay, SheetContent };
