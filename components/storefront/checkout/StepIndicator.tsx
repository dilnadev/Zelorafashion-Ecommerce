"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Shipping", "Payment", "Confirmation"];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-12 flex items-center">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-body transition-colors",
                  isComplete && "border-accent bg-accent text-white",
                  isActive && "border-accent text-accent",
                  !isComplete && !isActive && "border-black/15 text-ink-muted"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-caption uppercase tracking-[0.1em]",
                  isActive || isComplete ? "text-ink" : "text-ink-muted"
                )}
              >
                {label}
              </span>
            </div>
            {stepNumber < STEPS.length && (
              <div className="mx-3 h-px flex-1 bg-black/10">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
