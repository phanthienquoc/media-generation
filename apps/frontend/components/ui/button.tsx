"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm",
        variant === "default"
          ? "bg-[rgb(var(--primary))] text-white shadow-[0_5px_14px_rgba(109,93,252,0.22)] hover:bg-[rgb(94,78,238)]"
          : variant === "outline"
            ? "border bg-white text-[rgb(var(--foreground))] hover:border-[rgb(var(--primary)/0.35)] hover:bg-[rgb(var(--primary)/0.06)]"
            : "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--primary)/0.07)]",
        className,
      )}
      {...p}
    />
  );
}
