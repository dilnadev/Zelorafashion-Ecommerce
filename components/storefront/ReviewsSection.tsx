"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Star } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { formatDate, cn } from "@/lib/utils";
import { submitReview } from "@/app/(storefront)/products/[slug]/actions";
import type { RatingBreakdown, ReviewsPage } from "@/lib/queries/product-detail";
import type { Review } from "@/types";

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="cursor-pointer"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              n <= (hovered || value) ? "fill-current text-ink" : "text-ink-muted"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-ink/[0.08] py-6">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < review.rating ? "fill-current text-ink" : "text-ink-muted"
              )}
            />
          ))}
        </div>
        {review.is_verified && (
          <span className="flex items-center gap-1 text-caption normal-case tracking-normal text-success">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Buyer
          </span>
        )}
      </div>
      {review.title && <p className="font-medium text-ink">{review.title}</p>}
      {review.body && <p className="mt-1 text-body text-ink-muted">{review.body}</p>}
      <p className="mt-2 text-caption normal-case tracking-normal text-ink-muted">
        {formatDate(review.created_at)}
      </p>
    </div>
  );
}

export function ReviewsSection({
  productId,
  productSlug,
  initialReviews,
  breakdown,
}: {
  productId: string;
  productSlug: string;
  initialReviews: ReviewsPage;
  breakdown: RatingBreakdown;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState(initialReviews.reviews);
  const [hasMore, setHasMore] = useState(initialReviews.hasMore);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleLoadMore() {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const res = await fetch(`/api/reviews?productId=${productId}&page=${nextPage}`);
    const data: ReviewsPage = await res.json();
    setReviews((prev) => [...prev, ...data.reviews]);
    setHasMore(data.hasMore);
    setPage(nextPage);
    setIsLoadingMore(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Select a star rating", variant: "error" });
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));
    const result = await submitReview(productId, productSlug, null, formData);
    setIsSubmitting(false);

    toast({
      title: result.success ? "Review posted" : "Couldn't post review",
      description: result.message,
      variant: result.success ? "success" : "error",
    });

    if (result.success) {
      formRef.current?.reset();
      setRating(0);
      setReviews((prev) => [
        {
          id: crypto.randomUUID(),
          product_id: productId,
          user_id: user!.id,
          rating,
          title: String(formData.get("title") ?? "") || null,
          body: String(formData.get("body") ?? ""),
          is_verified: true,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }

  return (
    <div>
      {breakdown.count > 0 && (
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
          <div className="text-center">
            <p className="font-serif text-4xl text-ink">{breakdown.average.toFixed(1)}</p>
            <div className="mt-1 flex justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(breakdown.average) ? "fill-current text-ink" : "text-ink-muted"
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-caption text-ink-muted">{breakdown.count} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const pct = breakdown.count
                ? Math.round((breakdown.counts[star] / breakdown.count) * 100)
                : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-caption text-ink-muted">
                  <span className="w-8 normal-case tracking-normal">{star} star</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-ink"
                    />
                  </div>
                  <span className="w-8 text-right normal-case tracking-normal">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        {reviews.length === 0 ? (
          <p className="py-6 text-body text-ink-muted">No reviews yet — be the first to review this product.</p>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>

      {hasMore && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" isLoading={isLoadingMore} onClick={handleLoadMore}>
            Load More Reviews
          </Button>
        </div>
      )}

      <div className="mt-10">
        <p className="mb-4 text-body-lg text-ink">Write a Review</p>
        {user ? (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <StarRatingInput value={rating} onChange={setRating} />
            <input
              type="text"
              name="title"
              placeholder="Review title (optional)"
              className="h-12 w-full rounded border border-ink/15 px-4 text-body text-ink outline-none focus:border-accent"
            />
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Share your thoughts on this product"
              className="w-full rounded border border-ink/15 p-4 text-body text-ink outline-none focus:border-accent"
            />
            <Button type="submit" isLoading={isSubmitting}>
              Submit Review
            </Button>
          </form>
        ) : (
          <p className="text-body text-ink-muted">
            Sign in to write a review for this product.
          </p>
        )}
      </div>
    </div>
  );
}
