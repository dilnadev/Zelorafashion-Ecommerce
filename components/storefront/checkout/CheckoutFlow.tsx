"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/providers/ToastProvider";
import { loadRazorpayCheckout } from "@/lib/loadRazorpayCheckout";
import { previewOrderAction, createOrderAction, type ShippingAddressInput } from "@/app/(storefront)/checkout/actions";
import type { OrderComputation, CartItemInput } from "@/lib/queries/order-calculation";
import { StepIndicator } from "./StepIndicator";
import { ShippingForm } from "./ShippingForm";
import { ReviewPaymentStep } from "./ReviewPaymentStep";
import type { ShippingMethod } from "@/types";

const EMPTY_ADDRESS: ShippingAddressInput = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
};

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CheckoutFlowProps {
  shippingMethods: ShippingMethod[];
  siteName: string;
  defaultEmail: string;
}

export function CheckoutFlow({ shippingMethods, siteName, defaultEmail }: CheckoutFlowProps) {
  const { items, coupon, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<ShippingAddressInput | null>(null);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [computation, setComputation] = useState<OrderComputation | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cartItemsForServer: CartItemInput[] = items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    quantity: i.quantity,
  }));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-ink-muted/40" />
        <p className="text-body-lg text-ink">Your bag is empty</p>
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center rounded bg-ink px-8 text-caption uppercase tracking-[0.1em] text-white transition-colors hover:bg-charcoal"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  async function handleShippingContinue(addr: ShippingAddressInput, methodId: string) {
    setAddress(addr);
    setShippingMethodId(methodId);
    setIsPreviewing(true);
    const preview = await previewOrderAction(cartItemsForServer, methodId, coupon?.code ?? null);
    setIsPreviewing(false);

    if (preview.errors.length > 0) {
      toast({
        title: "Please review your order",
        description: preview.errors[0],
        variant: "error",
      });
      return;
    }

    setComputation(preview);
    setStep(2);
  }

  async function handlePlaceOrder() {
    if (!address || !shippingMethodId) return;
    setIsPlacingOrder(true);

    try {
      const result = await createOrderAction(
        cartItemsForServer,
        shippingMethodId,
        coupon?.code ?? null,
        address
      );

      if (!result.success || !result.razorpayOrderId || !result.orderId) {
        toast({
          title: "Couldn't place order",
          description: result.message ?? "Please try again.",
          variant: "error",
        });
        setIsPlacingOrder(false);
        return;
      }

      await loadRazorpayCheckout();
      const orderId = result.orderId;

      const razorpay = new window.Razorpay!({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        order_id: result.razorpayOrderId,
        name: siteName,
        description: "Order payment",
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        },
        theme: { color: "#2563EB" },
        handler: async (response: unknown) => {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response as RazorpaySuccessResponse;

          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            clearCart();
            router.push(`/order-confirmation/${orderId}`);
          } else {
            toast({
              title: "Payment verification failed",
              description: verifyData.message ?? "Please contact support.",
              variant: "error",
            });
            setIsPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
          },
        },
      });

      razorpay.on("payment.failed", (response: unknown) => {
        const description =
          (response as { error?: { description?: string } })?.error?.description ??
          "Please try again.";
        toast({ title: "Payment failed", description, variant: "error" });
        setIsPlacingOrder(false);
      });

      razorpay.open();
    } catch {
      toast({
        title: "Something went wrong",
        description: "Couldn't load the payment window. Please try again.",
        variant: "error",
      });
      setIsPlacingOrder(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <ShippingForm
          shippingMethods={shippingMethods}
          defaultValues={{ ...EMPTY_ADDRESS, email: defaultEmail }}
          defaultShippingMethodId={shippingMethods[0]?.id ?? ""}
          onContinue={handleShippingContinue}
          isSubmitting={isPreviewing}
        />
      )}

      {step === 2 && computation && address && (
        <ReviewPaymentStep
          computation={computation}
          address={address}
          onBack={() => setStep(1)}
          onPlaceOrder={handlePlaceOrder}
          isPlacingOrder={isPlacingOrder}
        />
      )}
    </div>
  );
}
