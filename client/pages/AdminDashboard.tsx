import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 pb-20 px-6 lg:px-12">
        <section className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-4xl font-light text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Moderate pending reviews submitted by travellers.</p>
          </div>

          {isLoading ? (
            <p className="text-gray-600">Loading pending reviews...</p>
          ) : isError ? (
            <p className="text-red-600">{error instanceof Error ? error.message : "Failed to load pending reviews."}</p>
          ) : pendingReviews.length === 0 ? (
            <p className="text-gray-600">No reviews are awaiting moderation.</p>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review: ReviewWithUser) => (
                <Card key={review.id} className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-velvet-green">
                      {review.user?.email ?? "Unknown reviewer"} · Rating {review.rating}/5
                    </CardTitle>
                    <p className="text-sm text-gray-500">Submitted {formatTimestamp(review.created_at)}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{review.comment}</p>
                    <div className="flex gap-3">
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
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
