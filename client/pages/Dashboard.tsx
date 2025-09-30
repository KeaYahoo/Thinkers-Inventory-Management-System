import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useMyBookings } from "@/hooks/useMyBookings";
import type { Booking } from "@shared/types";

type TabKey = "upcoming" | "past";

export default function Dashboard() {
  const { logout } = useAuth();
  const { data: user, isLoading: isUserLoading } = useUser();
  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    error: bookingsError,
  } = useMyBookings();
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const upcomingBookings = bookingsData?.upcoming ?? [];
  const pastBookings = bookingsData?.past ?? [];

  const heading = !isUserLoading && user?.email ? `Welcome, ${user.email}!` : "My Dashboard";
  const subheading = isUserLoading
    ? "Loading your profile..."
    : "Track your adventures and manage upcoming trips.";

  const seoTitle = useMemo(() => {
    if (user?.full_name) {
      return `${user.full_name}'s travel dashboard`;
    }
    if (user?.email) {
      return `${user.email}'s travel dashboard`;
    }
    return "Your personalised travel dashboard";
  }, [user?.email, user?.full_name]);

  const seoDescription = "Review upcoming adventures, revisit past trips, and manage your Trvlsync profile.";

  const errorMessage =
    bookingsError instanceof Error
      ? bookingsError.message
      : "We couldn't load your bookings. Please try again.";

  const renderBookingsList = (items: Booking[], tab: TabKey) => {
    if (items.length === 0) {
      if (tab === "upcoming") {
        return (
          <div className="rounded-lg border px-6 py-16 text-center">
            <h3 className="mb-4 text-2xl font-medium">No upcoming adventures yet!</h3>
            <p className="mb-6 text-gray-600">
              Ready for your next escape? Discover curated getaways tailored for you.
            </p>
            <Link to="/trips">
              <Button className="bg-primary-brown hover:bg-brown-dark">Explore trips</Button>
            </Link>
          </div>
        );
      }

      return (
        <div className="rounded-lg border px-6 py-16 text-center text-gray-600">
          <h3 className="mb-4 text-2xl font-medium">No past trips yet.</h3>
          <p>Book your first adventure to start building unforgettable memories.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {items.map((booking) => {
          const tripStartLabel = booking.trips.start_date
            ? new Date(booking.trips.start_date).toLocaleDateString()
            : "Date to be announced";
          const bookedOnLabel = new Date(booking.created_at).toLocaleDateString();

          return (
            <article
              key={booking.id}
              className="focus-within:ring-primary-brown focus-within:ring-offset-2"
            >
              <Card className="flex flex-col items-center overflow-hidden md:flex-row">
                <img
                  src={booking.trips.image_url}
                  alt={booking.trips.name}
                  className="h-64 w-full object-cover md:h-full md:w-1/3"
                />
                <div className="flex-1">
                  <CardHeader>
                    <CardTitle>{booking.trips.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-600">{booking.trips.location}</p>
                    <p className="text-sm text-gray-500">Trip starts: {tripStartLabel}</p>
                    <p className="text-sm text-gray-500">Booked on: {bookedOnLabel}</p>
                  </CardContent>
                </div>
              </Card>
            </article>
          );
        })}
      </div>
    );
  };

  const tabs: Array<{ id: TabKey; label: string }> = [
    { id: "upcoming", label: `Upcoming trips (${upcomingBookings.length})` },
    { id: "past", label: `Past trips (${pastBookings.length})` },
  ];

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} />
      <Header />
      <main className="px-6 pb-20 pt-32 lg:px-12" aria-labelledby="dashboard-heading">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 id="dashboard-heading" className="text-4xl font-light text-gray-900 lg:text-5xl">
                {heading}
              </h1>
              <p className="text-gray-600">{subheading}</p>
            </div>
            <Button
              onClick={logout}
              type="button"
              variant="outline"
              className="self-start rounded-full md:self-auto"
            >
              Log out
            </Button>
          </header>

          <section aria-labelledby="bookings-heading" className="space-y-6">
            <div>
              <h2 id="bookings-heading" className="text-2xl font-semibold text-gray-900">
                Your bookings
              </h2>
              <p className="text-gray-600">
                All your adventures neatly organised by what\'s ahead and what\'s behind.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Bookings categories"
              className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveTab(tab.id)}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:ring-primary-brown focus-visible:ring-offset-2 ${
                      isActive ? "text-white shadow" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={`tab-${activeTab}`}
              aria-live="polite"
            >
              {isBookingsLoading ? (
                <p className="text-gray-600">Loading your bookings...</p>
              ) : isBookingsError ? (
                <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-red-700">
                  {errorMessage}
                </div>
              ) : activeTab === "upcoming" ? (
                renderBookingsList(upcomingBookings, "upcoming")
              ) : (
                renderBookingsList(pastBookings, "past")
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
