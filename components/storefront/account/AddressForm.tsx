"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AddressInput } from "@/app/(storefront)/account/addresses/actions";
import type { Address } from "@/types";

interface AddressFormProps {
  initial?: Address;
  onSubmit: (input: AddressInput) => Promise<void>;
  isSubmitting: boolean;
}

export function AddressForm({ initial, onSubmit, isSubmitting }: AddressFormProps) {
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      country: String(formData.get("country") ?? ""),
      isDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" name="fullName" required defaultValue={initial?.full_name} />
        <Input label="Phone" name="phone" defaultValue={initial?.phone ?? ""} />
        <div className="sm:col-span-2">
          <Input
            label="Address line 1"
            name="addressLine1"
            required
            defaultValue={initial?.address_line1}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Address line 2 (optional)"
            name="addressLine2"
            defaultValue={initial?.address_line2 ?? ""}
          />
        </div>
        <Input label="City" name="city" required defaultValue={initial?.city} />
        <Input label="State / Province" name="state" required defaultValue={initial?.state} />
        <Input label="ZIP / Postal code" name="zip" required defaultValue={initial?.zip} />
        <Input label="Country" name="country" required defaultValue={initial?.country ?? "India"} />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-black/20 text-accent focus:ring-accent"
        />
        Set as default address
      </label>

      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
        Save Address
      </Button>
    </form>
  );
}
