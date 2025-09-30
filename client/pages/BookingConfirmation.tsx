/**
 * Booking Confirmation Page: surfaces the trip booking details after checkout with guarded data fetch.
 */
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBooking } from "@/hooks/useBooking";

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useBooking(bookingId);

  const renderContent = () => {
    if (!bookingId) {
      return (
        <section className="pt-32 pb-20 text-center">
          <p className="text-gray-600">Missing booking identifier.</p>
        </section>
      );
    }

    if (isLoading) {
      return (
        <section className="pt-32 pb-20 text-center">
          <p className="text-gray-600">Confirming your booking...</p>
        </section>
      );
    }

    if (isError || !booking) {
      return (
        <section className="pt-32 pb-20 text-center">
          <p className="text-red-500">{error instanceof Error ? error.message : "Unable to load booking."}</p>
          <div className="mt-6">
            <Link to="/" className="text-primary-brown underline hover:text-brown-dark">
              Return home
            </Link>
          </div>
        </section>
      );
    }

    const trip = booking.trips;
    const bookingDate = new Date(booking.created_at).toLocaleDateString();

    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-velvet-green">Booking Confirmed!</h1>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for booking with Trvlsync. A confirmation email is on its way to you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Trip Details</h2>
              <p className="text-sm text-gray-600">{trip.name}</p>
              <p className="text-sm text-gray-600">Location: {trip.location}</p>
              <p className="text-sm text-gray-600">Booking reference: {booking.id}</p>
              <p className="text-sm text-gray-600">Booked on: {bookingDate}</p>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src={trip.image_url}
                alt={trip.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full bg-primary-brown px-6 py-2 text-sm font-medium text-white transition-colors duration-150 ease-in-out hover:bg-brown-dark"
            >
              View My Dashboard
            </Link>
            <Link to="/trips" className="text-sm font-medium text-velvet-green hover:underline">
              Continue exploring trips
            </Link>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <Header />
      <main className="bg-gray-50">{renderContent()}</main>
      <Footer />
    </>
  );
}
