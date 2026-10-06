"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn, formatCurrency } from "@/lib/utils";
import type { ShippingMethod } from "@/types";
import type { ShippingAddressInput } from "@/app/(storefront)/checkout/actions";

interface ShippingFormProps {
  shippingMethods: ShippingMethod[];
  defaultValues: ShippingAddressInput;
  defaultShippingMethodId: string;
  onContinue: (address: ShippingAddressInput, shippingMethodId: string) => void;
  isSubmitting?: boolean;
}

export function ShippingForm({
  shippingMethods,
  defaultValues,
  defaultShippingMethodId,
  onContinue,
  isSubmitting = false,
}: ShippingFormProps) {
  const [shippingMethodId, setShippingMethodId] = useState(
    defaultShippingMethodId || shippingMethods[0]?.id || ""
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const address: ShippingAddressInput = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      country: String(formData.get("country") ?? ""),
    };
    onContinue(address, shippingMethodId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="mb-4 text-body-lg text-ink">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            name="fullName"
            required
            defaultValue={defaultValues.fullName}
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            required
            defaultValue={defaultValues.email}
          />
          <div className="sm:col-span-2">
            <Input
              label="Phone"
              name="phone"
              type="tel"
              required
              defaultValue={defaultValues.phone}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-body-lg text-ink">Shipping Address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Address line 1"
              name="addressLine1"
              required
              defaultValue={defaultValues.addressLine1}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Address line 2 (optional)"
              name="addressLine2"
              defaultValue={defaultValues.addressLine2}
            />
          </div>
          <Input label="City" name="city" required defaultValue={defaultValues.city} />
          <Input label="State / Province" name="state" required defaultValue={defaultValues.state} />
          <Input label="ZIP / Postal code" name="zip" required defaultValue={defaultValues.zip} />
          <Input label="Country" name="country" required defaultValue={defaultValues.country} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-body-lg text-ink">Shipping Method</h2>
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <label
              key={method.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded border px-4 py-4 transition-colors",
                shippingMethodId === method.id
                  ? "border-accent bg-accent/5"
                  : "border-ink/15 hover:border-ink/30"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={shippingMethodId === method.id}
                  onChange={() => setShippingMethodId(method.id)}
                  className="h-4 w-4 cursor-pointer text-accent focus:ring-accent"
                />
                <div>
                  <p className="text-body text-ink">{method.name}</p>
                  {method.estimated_delivery && (
                    <p className="text-caption normal-case tracking-normal text-ink-muted">
                      {method.estimated_delivery}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-body text-ink">{formatCurrency(method.price)}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
        Continue to Payment
      </Button>
    </form>
  );
}
