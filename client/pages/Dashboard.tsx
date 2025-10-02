import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHover } from "@/components/ui/cardHover";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BackToTop } from "@/components/BackToTop";
import { cn } from "@/lib/utils";
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

  const heading = !isUserLoading && user?.email ? `Welcome, ${user.email}!` : "My dashboard";
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
          <CardHover className="rounded-2xl border border-dashed border-velvet-green/40 bg-white p-8 text-center">
            <h3 className="mb-4 text-2xl font-semibold text-velvet-green">No upcoming adventures yet!</h3>
            <p className="mb-6 text-gray-600">
              Ready for your next escape? Discover curated getaways tailored for you.
            </p>
            <Link to="/trips">
              <Button className="rounded-full">Explore trips</Button>
            </Link>
          </CardHover>
        );
      }

      return (
        <CardHover className="rounded-2xl border border-dashed border-primary-brown/30 bg-white p-8 text-center text-gray-600">
          <h3 className="mb-4 text-2xl font-semibold text-primary-brown">No past trips yet.</h3>
          <p>Book your first adventure to start building unforgettable memories.</p>
        </CardHover>
      );
    }

    return (
      <div className="space-y-8">
        {items.map((booking, index) => {
          const tripStartLabel = booking.trips.start_date
            ? new Date(booking.trips.start_date).toLocaleDateString()
            : "Date to be announced";
          const bookedOnLabel = new Date(booking.created_at).toLocaleDateString();

          return (
            <AnimatedSection delay={0.1 + index * 0.08} key={booking.id} className="grid grid-cols-12">
              <article className="col-span-12 focus-within:ring-primary-brown focus-within:ring-offset-2">
                <CardHover className="grid grid-cols-12 overflow-hidden">
                  <img
                    src={booking.trips.image_url}
                    alt={booking.trips.name}
                    className="col-span-12 h-56 w-full object-cover md:col-span-4 md:h-full"
                  />
                  <div className="col-span-12 md:col-span-8">
                    <CardHeader>
                      <CardTitle>{booking.trips.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-600">{booking.trips.location}</p>
                      <p className="text-sm text-gray-500">Trip starts: {tripStartLabel}</p>
                      <p className="text-sm text-gray-500">Booked on: {bookedOnLabel}</p>
                    </CardContent>
                  </div>
                </CardHover>
              </article>
            </AnimatedSection>
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
      <main className="flex-1 bg-white px-6 pb-20 pt-32 lg:px-12" aria-labelledby="dashboard-heading">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-8">
          <AnimatedSection className="col-span-12">
            <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
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
          </AnimatedSection>

          <AnimatedSection className="col-span-12 space-y-6" aria-labelledby="bookings-heading">
            <div className="grid grid-cols-12 items-end gap-4">
              <div className="col-span-12 md:col-span-8">
                <h2 id="bookings-heading" className="text-2xl font-semibold text-gray-900">
                  Your bookings
                </h2>
                <p className="text-gray-600">
                  All your adventures neatly organised by what's ahead and what's behind.
                </p>
              </div>
              <div
                role="tablist"
                aria-label="Bookings categories"
                className="col-span-12 inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm md:col-span-4 md:justify-end"
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
                      className={cn(
                        "rounded-full px-5 py-2 text-sm font-medium",
                        isActive ? "text-white" : "text-gray-600 hover:text-gray-900",
                      )}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
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
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
                  {errorMessage}
                </div>
              ) : activeTab === "upcoming" ? (
                renderBookingsList(upcomingBookings, "upcoming")
              ) : (
                renderBookingsList(pastBookings, "past")
              )}
            </div>
          </AnimatedSection>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </>
  );
}
