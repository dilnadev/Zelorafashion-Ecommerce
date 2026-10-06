"use client";

import { motion } from "framer-motion";

export function OrderConfirmationCheck() {
  return (
    <motion.svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      fill="none"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="44"
        cy="44"
        r="40"
        stroke="#16A34A"
        strokeWidth="3"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
        }}
      />
      <motion.path
        d="M27 45L39 57L61 33"
        stroke="#16A34A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: {
            pathLength: 1,
            transition: { duration: 0.4, ease: "easeOut", delay: 0.5 },
          },
        }}
      />
    </motion.svg>
  );
}
