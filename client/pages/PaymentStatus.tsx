import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BackToTop } from "@/components/BackToTop";
import { CardHover } from "@/components/ui/cardHover";
import { useBooking } from "@/hooks/useBooking";
import { PaymentStatus as PaymentState } from "@shared/types";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";

const STATUS_LABEL: Record<PaymentState, string> = {
  [PaymentState.Pending]: "Pending",
  [PaymentState.Paid]: "Paid",
  [PaymentState.Failed]: "Failed",
};

const STATUS_MESSAGE: Record<PaymentState, string> = {
  [PaymentState.Pending]: "We are waiting for PayFast to confirm your payment. This usually takes a few moments.",
  [PaymentState.Paid]: "Payment received! Your trip is confirmed and we'll email the full itinerary shortly.",
  [PaymentState.Failed]: "We could not verify your payment. Please try again or contact support if the issue persists.",
};

export default function PaymentStatus() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const bookingQuery = useBooking(bookingId);
  const status = bookingQuery.data?.payment_status ?? PaymentState.Pending;

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    if (status === PaymentState.Paid || status === PaymentState.Failed) {
      return;
    }

    const interval = setInterval(() => {
      void bookingQuery.refetch();
    }, 3_000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, status]);

  const headline = useMemo(() => {
    const queryStatus = searchParams.get("status");
    if (queryStatus === "cancelled") {
      return "Payment Cancelled";
    }
    if (status === PaymentState.Paid) {
      return "Payment Successful";
    }
    if (status === PaymentState.Failed) {
      return "Payment Failed";
    }
    return "Payment In Progress";
  }, [searchParams, status]);

  const seoTitle = `${headline} | Trvlsync Payment Status`;
  const seoDescription = bookingQuery.data?.trips
    ? `Track the payment status of ${bookingQuery.data.trips.name} in ${bookingQuery.data.trips.location}.`
    : "Monitor your Trvlsync booking payment status and next steps.";

  return (
    <div className="flex min-h-screen flex-col">
      <Seo title={seoTitle} description={seoDescription} />
      <Header />
      <main className="flex-1 bg-white">
        <section className="px-6 pt-32 pb-20">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-8">
            <AnimatedSection className="col-span-12 space-y-3 text-center lg:col-span-8 lg:col-start-3">
              <h1 className="text-4xl font-light text-gray-900 lg:text-5xl">{headline}</h1>
              <p className="text-sm uppercase tracking-wide text-gray-500">Status: {STATUS_LABEL[status]}</p>
            </AnimatedSection>

            {bookingQuery.isLoading ? (
              <AnimatedSection className="col-span-12 lg:col-span-8 lg:col-start-3">
                <CardHover className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
                  <p className="text-sm text-gray-600">Checking the latest payment details.</p>
                </CardHover>
              </AnimatedSection>
            ) : bookingQuery.isError ? (
              <AnimatedSection className="col-span-12 lg:col-span-8 lg:col-start-3">
                <CardHover
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600"
                >
                  {bookingQuery.error instanceof Error
                    ? bookingQuery.error.message
                    : "We could not load your booking right now."}
                </CardHover>
              </AnimatedSection>
            ) : (
              <AnimatedSection className="col-span-12 space-y-6 lg:col-span-8 lg:col-start-3">
                <CardHover className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
                  <p className="text-base text-gray-700">{STATUS_MESSAGE[status]}</p>
                </CardHover>

                {bookingQuery.data?.trips && (
                  <CardHover className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-velvet-green">Trip summary</h2>
                    <dl className="mt-3 space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <dt>Experience</dt>
                        <dd className="font-medium text-gray-900">{bookingQuery.data.trips.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Destination</dt>
                        <dd>{bookingQuery.data.trips.location}</dd>
                      </div>
                      {bookingQuery.data.start_date && (
                        <div className="flex justify-between">
                          <dt>Start date</dt>
                          <dd>{new Date(bookingQuery.data.start_date).toLocaleDateString()}</dd>
                        </div>
                      )}
                    </dl>
                  </CardHover>
                )}

                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center rounded-full bg-primary-brown px-6 py-3 text-sm font-medium text-white transition hover:bg-brown-dark"
                  >
                    Go to dashboard
                  </Link>
                  <Link
                    to="/trips"
                    className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-primary-brown hover:text-primary-brown"
                  >
                    Explore more trips
                  </Link>
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}
