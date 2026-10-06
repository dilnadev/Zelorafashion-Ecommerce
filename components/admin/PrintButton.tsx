"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      leftIcon={<Printer className="h-3.5 w-3.5" />}
      onClick={() => window.print()}
    >
      Print Invoice
    </Button>
  );
}
