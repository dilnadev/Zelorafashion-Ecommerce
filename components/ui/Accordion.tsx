"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

export function Accordion({
  children,
  defaultOpen,
}: {
  children: ReactNode;
  defaultOpen?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);
  return (
    <AccordionContext.Provider value={{ openId, setOpenId }}>
      <div className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  id,
  title,
  titleClassName,
  children,
}: {
  id: string;
  title: string;
  titleClassName?: string;
  children: ReactNode;
}) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");
  const { openId, setOpenId } = context;
  const isOpen = openId === id;
  const contentId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : id)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between py-5 text-left text-body-lg uppercase tracking-[0.1em] text-ink",
          titleClassName
        )}
      >
        {title}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-5 w-5 text-ink-muted" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-body text-ink-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
