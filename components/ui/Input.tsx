"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onAnimationStart"> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, leftIcon, rightIcon, id, onFocus, onBlur, onChange, defaultValue, value, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(defaultValue ?? value ?? "")
    );

    const isFloating = isFocused || hasValue;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(Boolean(e.target.value));
              onChange?.(e);
            }}
            className={cn(
              "peer h-14 w-full rounded border bg-white px-4 pt-4 text-body text-ink outline-none transition-colors",
              "border-ink/15 focus:border-accent",
              error && "border-destructive focus:border-destructive",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <motion.label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-4 right-4 truncate whitespace-nowrap text-ink-muted",
              leftIcon && "left-11"
            )}
            initial={false}
            animate={{
              top: isFloating ? "0.55rem" : "50%",
              y: isFloating ? 0 : "-50%",
              scale: isFloating ? 0.8 : 1,
              color: error
                ? "#DC2626"
                : isFocused
                ? "#C99A96"
                : "#75706A",
            }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ originX: 0 }}
          >
            {label}
          </motion.label>
          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-caption normal-case tracking-normal text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
