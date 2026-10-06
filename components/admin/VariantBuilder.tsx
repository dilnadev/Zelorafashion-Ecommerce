"use client";

import { Plus, Trash2 } from "lucide-react";
import { TagInput } from "@/components/admin/TagInput";
import { Button } from "@/components/ui/Button";
import type { OptionInput, VariantInput } from "@/app/(admin)/admin/products/actions";

interface OptionValuePair {
  option_name: string;
  value: string;
}

function cartesian(options: OptionInput[]): OptionValuePair[][] {
  let combos: OptionValuePair[][] = [[]];
  for (const option of options) {
    if (option.values.length === 0) continue;
    const next: OptionValuePair[][] = [];
    for (const combo of combos) {
      for (const value of option.values) {
        next.push([...combo, { option_name: option.name, value }]);
      }
    }
    combos = next;
  }
  return combos.length === 1 && combos[0].length === 0 ? [] : combos;
}

function comboKey(combo: OptionValuePair[]) {
  return combo
    .map((c) => `${c.option_name}:${c.value}`)
    .sort()
    .join("|");
}

function regenerateVariants(
  options: OptionInput[],
  existing: VariantInput[],
  baseSku: string
): VariantInput[] {
  const combos = cartesian(options);
  const existingByKey = new Map(existing.map((v) => [comboKey(v.optionValues), v]));

  return combos.map((combo) => {
    const found = existingByKey.get(comboKey(combo));
    if (found) return found;
    const suffix = combo
      .map((c) => c.value)
      .join("-")
      .toUpperCase()
      .replace(/\s+/g, "");
    return { optionValues: combo, sku: `${baseSku}-${suffix}`, price: null, stockQuantity: 0 };
  });
}

interface VariantBuilderProps {
  options: OptionInput[];
  variants: VariantInput[];
  baseSku: string;
  onChange: (options: OptionInput[], variants: VariantInput[]) => void;
}

export function VariantBuilder({ options, variants, baseSku, onChange }: VariantBuilderProps) {
  function updateOptions(next: OptionInput[]) {
    onChange(next, regenerateVariants(next, variants, baseSku || "SKU"));
  }

  function addOptionGroup() {
    updateOptions([...options, { name: "", values: [] }]);
  }

  function updateOptionName(index: number, name: string) {
    updateOptions(options.map((o, i) => (i === index ? { ...o, name } : o)));
  }

  function updateOptionValues(index: number, values: string[]) {
    updateOptions(options.map((o, i) => (i === index ? { ...o, values } : o)));
  }

  function removeOptionGroup(index: number) {
    updateOptions(options.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    onChange(
      options,
      variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-start gap-3">
            <input
              value={option.name}
              onChange={(e) => updateOptionName(index, e.target.value)}
              placeholder="Option name (e.g. Color)"
              className="h-11 w-40 shrink-0 rounded-xl border border-black/10 px-3 text-body text-ink outline-none focus:border-accent"
            />
            <div className="flex-1">
              <TagInput value={option.values} onChange={(values) => updateOptionValues(index, values)} />
            </div>
            <button
              type="button"
              onClick={() => removeOptionGroup(index)}
              aria-label="Remove option group"
              className="mt-2 cursor-pointer text-ink-muted transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {options.length < 3 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={addOptionGroup}
          >
            Add Option Group
          </Button>
        )}
      </div>

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
          <table className="w-full text-left">
            <thead className="border-b border-black/[0.06] bg-black/[0.02]">
              <tr className="text-caption text-ink-muted">
                {options.map((o) => (
                  <th key={o.name} className="px-4 py-2 font-normal">
                    {o.name}
                  </th>
                ))}
                <th className="px-4 py-2 font-normal">SKU</th>
                <th className="px-4 py-2 font-normal">Price override</th>
                <th className="px-4 py-2 font-normal">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {variants.map((variant, index) => (
                <tr key={comboKey(variant.optionValues)}>
                  {options.map((o) => (
                    <td key={o.name} className="px-4 py-2 text-body text-ink">
                      {variant.optionValues.find((ov) => ov.option_name === o.name)?.value}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, { sku: e.target.value })}
                      className="h-9 w-32 rounded-lg border border-black/10 px-2 text-body text-ink outline-none focus:border-accent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price ?? ""}
                      onChange={(e) =>
                        updateVariant(index, {
                          price: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Product price"
                      className="h-9 w-28 rounded-lg border border-black/10 px-2 text-body text-ink outline-none focus:border-accent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      value={variant.stockQuantity}
                      onChange={(e) => updateVariant(index, { stockQuantity: Number(e.target.value) })}
                      className="h-9 w-20 rounded-lg border border-black/10 px-2 text-body text-ink outline-none focus:border-accent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
