/**
 * Trip Detail Page: now redirects successful bookings to the confirmation screen while preserving the existing trip layout.
 */
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { CardHover } from "@/components/ui/cardHover";
import { AnimatedSection } from "@/components/AnimatedSection";
import Activities from "@/components/Activities";
import TripMap from "@/components/TripMap";
import { Reviews } from "@/components/Reviews";
import { useTrip } from "@/hooks/useTrip";
import { useTripAvailability } from "@/hooks/useTripAvailability";
import { useCreatePayment } from "@/hooks/useCreatePayment";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

const formatAvailabilityDate = (isoDate: string) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const {
    data: trip,
    isLoading,
    isError,
    error,
  } = useTrip(id);
  const { data: availability = [], isLoading: isAvailabilityLoading } = useTripAvailability(id);
  const createPayment = useCreatePayment();
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);

  useEffect(() => {
    if (availability.length > 0) {
      setSelectedStartDate((previous) => {
        if (previous && availability.some((slot) => slot.start_date === previous)) {
          return previous;
        }
        return availability[0].start_date;
      });
      return;
    }

    if (trip?.start_date) {
      setSelectedStartDate(trip.start_date);
    } else {
      setSelectedStartDate(null);
    }
  }, [availability, trip?.start_date]);

  const selectedAvailability = useMemo(() => {
    if (!selectedStartDate) {
      return undefined;
    }
    return availability.find((slot) => slot.start_date === selectedStartDate);
  }, [availability, selectedStartDate]);

  const displayPrice = selectedAvailability?.price ?? trip?.price ?? 0;

  const seoTitle = trip ? `${trip.name} in ${trip.location}` : "Trip details";
  const seoDescription = trip
    ? `Plan your stay at ${trip.name} in ${trip.location}. Discover activities, maps, and traveller reviews.`
    : "Explore curated trip details and availability with Trvlsync.";
  const seoImage = trip?.image_url;

  const handleBooking = async () => {
    if (!id) {
      toast.error("Booking failed.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const startDateForBooking = selectedStartDate ?? availability[0]?.start_date ?? trip?.start_date;
      if (!startDateForBooking) {
        throw new Error("No start date available for booking");
      }

      const payload = await createPayment.mutateAsync({ trip_id: id, start_date: startDateForBooking });

      toast.success("Redirecting to payment...");
      navigate(payload.paymentUrl);
    } catch (bookingError: unknown) {
      const message =
        bookingError instanceof ApiError
          ? bookingError.message
          : bookingError instanceof Error
          ? bookingError.message
          : "Booking failed.";
      toast.error(message);
    }
  };

  const renderContent = () => {
    if (!id) {
      return (
        <AnimatedSection className="px-6">
          <section className="mx-auto max-w-5xl py-24 text-center">
            <p className="text-gray-600">Invalid trip identifier.</p>
          </section>
        </AnimatedSection>
      );
    }

    if (isLoading) {
      return (
        <AnimatedSection className="px-6">
          <section className="mx-auto max-w-5xl py-24 text-center">
            <p className="text-gray-600">Loading trip details...</p>
          </section>
        </AnimatedSection>
      );
    }

    if (isError || !trip) {
      return (
        <AnimatedSection className="px-6">
          <section className="mx-auto max-w-5xl py-24 text-center">
            <p className="text-red-500">{error instanceof Error ? error.message : "Failed to load trip."}</p>
          </section>
        </AnimatedSection>
      );
    }

    return (
      <>
        <AnimatedSection>
          <section className="relative h-[55vh] min-h-[320px]">
            <img src={trip.image_url} alt={trip.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <h1 className="text-4xl font-light tracking-wide text-white drop-shadow-lg md:text-6xl">
                {trip.name}
              </h1>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
          <section className="grid grid-cols-12 gap-8">
            <article className="col-span-12 space-y-6 text-left lg:col-span-8">
              <h2 className="text-2xl font-semibold text-velvet-green">About this experience</h2>
              <p className="leading-relaxed text-gray-700">{trip.description}</p>
            </article>

            <aside className="col-span-12 lg:col-span-4">
              <CardHover className="h-full space-y-6 p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500">Investment</p>
                    <p className="mt-2 text-3xl font-semibold text-primary-brown">R{displayPrice}</p>
                    <p className="text-sm text-gray-500">per person</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="trip-start-date" className="text-sm font-medium text-gray-700">
                      Choose your start date
                    </label>
                    {isAvailabilityLoading ? (
                      <p className="text-sm text-gray-500">Checking availability...</p>
                    ) : availability.length > 0 ? (
                      <select
                        id="trip-start-date"
                        value={selectedStartDate ?? ""}
                        onChange={(event) => setSelectedStartDate(event.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-brown"
                      >
                        {availability.map((slot) => (
                          <option key={slot.start_date} value={slot.start_date}>
                            {formatAvailabilityDate(slot.start_date)} - R{slot.price}
                          </option>
                        ))}
                      </select>
                    ) : trip.start_date ? (
                      <p className="text-sm text-gray-500">
                        Next start date: {formatAvailabilityDate(trip.start_date)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Currently unavailable.</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleBooking}
                  disabled={
                    createPayment.isPending || (!selectedStartDate && availability.length === 0 && !trip.start_date)
                  }
                  className="w-full"
                >
                  {createPayment.isPending ? "Processing..." : "Book Now"}
                </Button>
              </CardHover>
            </aside>
          </section>
        </AnimatedSection>

        <AnimatedSection className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <Activities tripId={trip.id} />
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <TripMap tripId={trip.id} />
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <Reviews tripId={trip.id} />
            </div>
          </div>
        </AnimatedSection>
      </>
    );
  };

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} image={seoImage} />
      <Header />
      <main className="bg-white">{renderContent()}</main>
      <Footer />
    </>
  );
}
