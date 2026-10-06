"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { OrderTimelineEntry } from "@/types";

export function OrderTimeline({ entries }: { entries: OrderTimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <motion.ol
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
    >
      {entries.map((entry, index) => (
        <motion.li
          key={entry.id}
          variants={{
            hidden: { opacity: 0, x: -12 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
          }}
          className="relative flex gap-4 pb-8 last:pb-0"
        >
          {index < entries.length - 1 && (
            <span className="absolute left-[11px] top-6 h-full w-px bg-black/10" />
          )}
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-body capitalize text-ink">{entry.status}</p>
            {entry.note && <p className="text-body text-ink-muted">{entry.note}</p>}
            <p className="text-caption normal-case tracking-normal text-ink-muted">
              {formatDate(entry.created_at, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
}
