/**
 * Dashboard Personalization: keeps the tailored greeting, consumes the new partitioned bookings hook,
 * and presents upcoming versus past trips in an accessible tabbed layout.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

  const errorMessage =
    bookingsError instanceof Error
      ? bookingsError.message
      : "We couldn't load your bookings. Please try again.";

  const renderBookingsList = (items: Booking[], tab: TabKey) => {
    if (items.length === 0) {
      if (tab === "upcoming") {
        return (
          <div className="text-center py-16 border rounded-lg">
            <h3 className="text-2xl font-medium mb-4">No upcoming adventures yet!</h3>
            <p className="text-gray-600 mb-6">
              Ready for your next escape? Discover curated getaways tailored for you.
            </p>
            <Link to="/trips">
              <Button className="bg-primary-brown hover:bg-brown-dark">Explore Trips</Button>
            </Link>
          </div>
        );
      }

      return (
        <div className="text-center py-16 border rounded-lg text-gray-600">
          <h3 className="text-2xl font-medium mb-4">No past trips yet.</h3>
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
            <Card
              key={booking.id}
              className="flex flex-col md:flex-row items-center overflow-hidden"
            >
              <img
                src={booking.trips.image_url}
                alt={booking.trips.name}
                className="w-full md:w-1/3 h-64 md:h-full object-cover"
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
          );
        })}
      </div>
    );
  };

  const tabs: Array<{ id: TabKey; label: string }> = [
    { id: "upcoming", label: `Upcoming Trips (${upcomingBookings.length})` },
    { id: "past", label: `Past Trips (${pastBookings.length})` },
  ];

  return (
    <>
      <Header />
      <main className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-light text-gray-900">{heading}</h1>
              <p className="text-gray-600">{subheading}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="rounded-full self-start md:self-auto"
            >
              Log Out
            </Button>
          </div>

          <section aria-labelledby="bookings-heading" className="space-y-6">
            <div>
              <h2 id="bookings-heading" className="text-2xl font-semibold text-gray-900">
                Your bookings
              </h2>
              <p className="text-gray-600">
                All your adventures neatly organised by what\'s ahead and what\'s behind.
              </p>
            </div>

            <div role="tablist" aria-label="Bookings categories" className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-brown focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-primary-brown text-white shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {isBookingsLoading ? (
                <p>Loading your bookings...</p>
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
