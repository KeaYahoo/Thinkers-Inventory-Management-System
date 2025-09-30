/**
 * Trip Detail Page: now redirects successful bookings to the confirmation screen while preserving the existing trip layout.
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Activities from "@/components/Activities";
import TripMap from "@/components/TripMap";
import { Reviews } from "@/components/Reviews";
import { useTrip } from "@/hooks/useTrip";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

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
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trip_id: id }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload && typeof payload.message === "string" ? payload.message : undefined;
        throw new Error(message ?? "Booking failed");
      }

      toast.success("Trip booked successfully!");
      const bookingId = payload && typeof payload.bookingId === "string" ? payload.bookingId : null;
      if (bookingId) {
        navigate(`/booking-success/${bookingId}`);
      } else {
        console.warn("Booking ID missing from response payload");
      }
    } catch (bookingError) {
      const message = bookingError instanceof Error ? bookingError.message : "Booking failed.";
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
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Investment</p>
                <p className="mt-2 text-3xl font-semibold text-primary-brown">R{trip.price}</p>
                <p className="text-sm text-gray-500">per person</p>
              </div>
              <Button
                type="button"
                onClick={handleBooking}
                className="w-full bg-primary-brown text-white transition-colors duration-150 ease-in-out hover:bg-brown-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brown"
              >
                Book Now
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

