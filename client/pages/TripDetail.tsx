/**
 * Trip Detail Page: now redirects successful bookings to the confirmation screen while preserving the existing trip layout.
 */
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
        <section className="pt-32 pb-20 text-center">
          <p className="text-gray-600">Invalid trip identifier.</p>
        </section>
      );
    }

    if (isLoading) {
      return (
        <section className="pt-32 pb-20 text-center">
          <p className="text-gray-600">Loading trip details...</p>
        </section>
      );
    }

    if (isError || !trip) {
      return (
        <section className="pt-32 pb-20 text-center">
          <p className="text-red-500">{error instanceof Error ? error.message : "Failed to load trip."}</p>
        </section>
      );
    }

    return (
      <>
        <section className="relative h-[55vh] min-h-[320px]">
          <img
            src={trip.image_url}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <h1 className="text-4xl font-light tracking-wide text-white drop-shadow-lg md:text-6xl">
              {trip.name}
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <article className="space-y-6 md:col-span-2">
              <h2 className="text-2xl font-semibold text-velvet-green">About this experience</h2>
              <p className="leading-relaxed text-gray-700">{trip.description}</p>
            </article>

            <aside className="h-fit space-y-6 rounded-2xl border border-border bg-white p-6 shadow-xl">
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
                className="w-full bg-primary-brown text-white transition-colors duration-150 ease-in-out hover:bg-brown-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brown disabled:opacity-60"
              >
                {createPayment.isPending ? "Processing..." : "Book Now"}
              </Button>
            </aside>
          </div>
        </section>

        <Activities tripId={trip.id} />
        <TripMap tripId={trip.id} />
        <Reviews tripId={trip.id} />
      </>
    );
  };

  return (
    <>
      <Header />
      <main className="bg-white">{renderContent()}</main>
      <Footer />
    </>
  );
}
