import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHover } from "@/components/ui/cardHover";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { usePendingReviews } from "@/hooks/usePendingReviews";
import { useApproveReview } from "@/hooks/useApproveReview";
import { useDeleteReview } from "@/hooks/useDeleteReview";
import type { ReviewWithUser } from "@shared/types";
import { toast } from "sonner";

const formatTimestamp = (isoDate: string) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleString();
};

export default function AdminDashboard() {
  const { data: pendingReviews = [], isLoading, isError, error } = usePendingReviews();
  const approveReview = useApproveReview();
  const deleteReview = useDeleteReview();

  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview.mutateAsync(reviewId);
      toast.success("Review approved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve review";
      toast.error(message);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success("Review deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete review";
      toast.error(message);
    }
  };

  const heading = "Admin dashboard";
  const seoDescription = "Moderate traveller feedback quickly by approving or rejecting pending Trvlsync reviews.";

  return (
    <>
      <Seo title={heading} description={seoDescription} />
      <Header />
      <main className="min-h-screen bg-gray-50 px-6 pb-20 pt-28 lg:px-12" aria-labelledby="admin-heading">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-8">
          <AnimatedSection className="col-span-12">
            <header>
              <h1 id="admin-heading" className="text-4xl font-light text-gray-900">
                {heading}
              </h1>
              <p className="text-gray-600">Moderate pending reviews submitted by travellers.</p>
            </header>
          </AnimatedSection>

          <AnimatedSection className="col-span-12" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <p className="text-gray-600">Loading pending reviews...</p>
            ) : isError ? (
              <p className="text-red-600">
                {error instanceof Error ? error.message : "Failed to load pending reviews."}
              </p>
            ) : pendingReviews.length === 0 ? (
              <CardHover className="rounded-2xl border border-dashed border-primary-brown/30 bg-white p-8 text-center text-gray-600">
                No reviews are awaiting moderation.
              </CardHover>
            ) : (
              <div className="space-y-6" role="list" aria-label="Pending reviews">
                {pendingReviews.map((review: ReviewWithUser, index) => (
                  <AnimatedSection key={review.id} delay={0.08 + index * 0.06}>
                    <CardHover role="listitem" className="space-y-4 p-6">
                      <CardHeader className="p-0">
                        <CardTitle className="text-lg font-semibold text-velvet-green">
                          {review.user?.email ?? "Unknown reviewer"} · Rating {review.rating}/5
                        </CardTitle>
                        <p className="text-sm text-gray-500">Submitted {formatTimestamp(review.created_at)}</p>
                      </CardHeader>
                      <CardContent className="space-y-4 p-0">
                        <p className="text-gray-700">{review.comment}</p>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            onClick={() => handleApprove(review.id)}
                            disabled={approveReview.isPending}
                            className="bg-velvet-green text-white hover:bg-green-dark"
                          >
                            {approveReview.isPending ? "Approving..." : "Approve"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDelete(review.id)}
                            disabled={deleteReview.isPending}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            {deleteReview.isPending ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </CardContent>
                    </CardHover>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </>
  );
}
