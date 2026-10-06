"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

const CLOTHING_SIZES = [
  { size: "XS", bust: "31–32", waist: "24–25", hip: "34–35" },
  { size: "S", bust: "33–34", waist: "26–27", hip: "36–37" },
  { size: "M", bust: "35–36", waist: "28–29", hip: "38–39" },
  { size: "L", bust: "37–39", waist: "30–32", hip: "40–42" },
  { size: "XL", bust: "40–42", waist: "33–35", hip: "43–45" },
];

const FOOTWEAR_SIZES = [
  { uk: "3", us: "5", eu: "36", cm: "22.5" },
  { uk: "4", us: "6", eu: "37", cm: "23.5" },
  { uk: "5", us: "7", eu: "38", cm: "24.5" },
  { uk: "6", us: "8", eu: "39", cm: "25.5" },
  { uk: "7", us: "9", eu: "40", cm: "26.5" },
];

function SizeTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Record<string, string>[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink/15">
            {headers.map((h) => (
              <th key={h} className="py-2.5 pr-4 text-caption uppercase tracking-[0.1em] text-ink-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ink/[0.08]">
              {Object.values(row).map((value, j) => (
                <td key={j} className="py-2.5 pr-4 text-body text-ink">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-body text-ink transition-colors hover:text-accent"
      >
        Size Guide
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Size Guide" size="lg">
        <div className="space-y-8">
          <p className="text-body text-ink-muted">
            All measurements are in inches unless otherwise noted. For the best fit, compare these
            measurements to a similar garment you already own and love.
          </p>

          <div>
            <h3 className="mb-3 text-caption uppercase tracking-[0.1em] text-ink-muted">
              Clothing
            </h3>
            <SizeTable
              headers={["Size", "Bust (in)", "Waist (in)", "Hip (in)"]}
              rows={CLOTHING_SIZES.map((s) => ({
                size: s.size,
                bust: s.bust,
                waist: s.waist,
                hip: s.hip,
              }))}
            />
          </div>

          <div>
            <h3 className="mb-3 text-caption uppercase tracking-[0.1em] text-ink-muted">
              Footwear
            </h3>
            <SizeTable
              headers={["UK", "US", "EU", "CM"]}
              rows={FOOTWEAR_SIZES.map((s) => ({
                uk: s.uk,
                us: s.us,
                eu: s.eu,
                cm: s.cm,
              }))}
            />
          </div>

          <p className="text-caption normal-case tracking-normal text-ink-muted">
            Still unsure about sizing? <a href="/contact" className="text-accent underline underline-offset-4">Contact us</a> and we&apos;ll be happy to help.
          </p>
        </div>
      </Modal>
    </>
  );
}
