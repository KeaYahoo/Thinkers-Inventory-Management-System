/**
 * Reviews Section: surfaces aggregated guest feedback with an authenticated modal form for new submissions.
 */
import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/context/AuthContext";

interface ReviewsProps {
  tripId?: string;
}

export function Reviews({ tripId }: ReviewsProps) {
  const { isAuthenticated } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
  } = useReviews(tripId);

  const { average, total } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { average: 0, total: 0 };
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      total: reviews.length,
    };
  }, [reviews]);

  if (!tripId) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-24 w-full animate-pulse rounded-2xl border border-border bg-muted" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error instanceof Error ? error.message : "We couldn't load reviews right now."}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">Traveler reviews</p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={average} readOnly size="lg" />
              <div>
                <p className="text-xl font-semibold text-gray-900">{average.toFixed(1)} out of 5</p>
                <p className="text-sm text-gray-500">Based on {total} review{total === 1 ? "" : "s"}</p>
              </div>
            </div>
          </div>
          {isAuthenticated && (
            <Dialog.Root open={isDialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger asChild>
                <Button variant="outline" className="rounded-full">
                  Write a review
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-[state=closed]:opacity-0" />
                <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-2xl focus-visible:outline-none data-[state=closed]:scale-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
                  <div className="mb-4 flex items-center justify-between">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">Share your experience</Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="rounded-full p-1 text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brown"
                      >
                        <span className="sr-only">Close</span>
                        ×
                      </button>
                    </Dialog.Close>
                  </div>
                  <ReviewForm tripId={tripId} onSuccess={() => setDialogOpen(false)} />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </div>

        {total === 0 ? (
          <p className="text-sm text-gray-600">No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border border-border">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {review.user?.email ?? "Anonymous traveler"}
                    </span>
                    <StarRating rating={review.rating} readOnly size="sm" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-gray-700">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
