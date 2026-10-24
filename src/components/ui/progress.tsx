"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { value?: number | null; max?: number }
>(({ className, value, max = 100, ...props }, ref) => {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const current = typeof value === "number" && Number.isFinite(value)
    ? Math.min(limit, Math.max(0, value))
    : undefined;

  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
      {...props}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={current}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - ((current ?? 0) / limit) * 100}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
