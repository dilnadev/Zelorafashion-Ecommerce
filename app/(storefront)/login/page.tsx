"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SignInForm } from "@/components/storefront/auth/SignInForm";
import { SignUpForm } from "@/components/storefront/auth/SignUpForm";
import { GoogleButton } from "@/components/storefront/auth/GoogleButton";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-8 text-center font-serif text-section text-ink">
        {tab === "signin" ? "Welcome back" : "Create your account"}
      </h1>

      <div className="mb-8 flex rounded border border-ink/15 p-1">
        {(["signin", "signup"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "relative flex-1 cursor-pointer rounded py-2.5 text-body font-medium transition-colors",
              tab === t ? "text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            {tab === t && (
              <motion.span
                layoutId="auth-tab-pill"
                className="absolute inset-0 rounded bg-ink"
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              />
            )}
            <span className="relative">{t === "signin" ? "Sign In" : "Sign Up"}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === "signin" ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === "signin" ? 16 : -16 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "signin" ? (
            <SignInForm redirectTo={redirectTo} />
          ) : (
            <SignUpForm redirectTo={redirectTo} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-black/10" />
        <span className="text-caption text-ink-muted">or</span>
        <div className="h-px flex-1 bg-black/10" />
      </div>

      <GoogleButton redirectTo={redirectTo} />
    </div>
  );
}
