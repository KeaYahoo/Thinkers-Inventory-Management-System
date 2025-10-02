import { Link } from "react-router-dom";
import type { Trip } from "@shared/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BackToTop } from "@/components/BackToTop";
import { useTrips } from "@/hooks/useTrips";
import { useTripFilters, DEFAULT_MAX_PRICE } from "@/hooks/useTripFilters";

export default function Trips() {
  const {
    searchTerm,
    setSearchTerm,
    maxPrice,
    setMaxPrice,
    debouncedSearchTerm,
    debouncedMaxPrice,
  } = useTripFilters();

  const effectiveMaxPrice = maxPrice ?? DEFAULT_MAX_PRICE;

  const { data: trips = [], isLoading, isError, error } = useTrips({
    searchTerm: debouncedSearchTerm || undefined,
    maxPrice: debouncedMaxPrice,
  });

  const handleSliderChange = (value: number[]) => {
    const nextValue = value[0] ?? DEFAULT_MAX_PRICE;
    setMaxPrice(nextValue >= DEFAULT_MAX_PRICE ? null : nextValue);
  };

  return (
    <>
      <Seo
        title="Browse unforgettable trips"
        description="Filter curated Trvlsync adventures by budget and discover your next South African escape."
      />
      <Header />
      <main className="pt-32 pb-20" aria-labelledby="trips-heading">
        <section className="px-6 lg:px-12">
          <div className="mx-auto max-w-6xl text-center">
            <h1 id="trips-heading" className="text-4xl font-light text-gray-900 lg:text-5xl">
              Available Trips
            </h1>
            <p className="mt-4 text-gray-600">
              Use the filters below to narrow down destinations that match your travel style and budget.
            </p>
          </div>
        </section>

        <section className="px-6 lg:px-12" aria-labelledby="trip-filters-heading">
          <div className="mx-auto mt-12 max-w-6xl rounded-lg border bg-white p-6 shadow-sm">
            <h2 id="trip-filters-heading" className="sr-only">
              Trip filters
            </h2>
            <form role="search" className="grid grid-cols-1 items-center gap-6 md:grid-cols-3" aria-label="Filter trips">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="trip-search" className="sr-only">
                  Search trips by name or location
                </Label>
                <Input
                  id="trip-search"
                  type="search"
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label id="max-price-label" className="text-sm font-medium">
                  Max price: R{effectiveMaxPrice}
                </Label>
                <Slider
                  max={DEFAULT_MAX_PRICE}
                  step={500}
                  value={[effectiveMaxPrice]}
                  onValueChange={handleSliderChange}
                  ariaLabelledBy="max-price-label"
                />
              </div>
            </form>
          </div>
        </section>

        <section className="px-6 lg:px-12" aria-live="polite" aria-busy={isLoading}>
          <div className="mx-auto mt-12 max-w-6xl">
            {isLoading ? (
              <p className="text-center text-gray-600">Loading trips...</p>
            ) : isError ? (
              <p className="text-center text-red-600">
                {error instanceof Error ? error.message : "Failed to load trips."}
              </p>
            ) : trips.length === 0 ? (
              <p className="text-center text-gray-600">
                No trips match your filters yet. Try widening your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip: Trip) => (
                  <Link
                    to={`/trips/${trip.id}`}
                    key={trip.id}
                    aria-label={`View details for ${trip.name}`}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-brown focus-visible:ring-offset-2"
                  >
                    <Card className="group flex h-full flex-col overflow-hidden">
                      <img
                        src={trip.image_url}
                        alt={trip.name}
                        className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <CardHeader>
                        <CardTitle>{trip.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-gray-600">{trip.description}</p>
                      </CardContent>
                      <CardFooter>
                        <p className="text-lg font-semibold text-primary-brown">From R{trip.price}</p>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <BackToTop />
      <Footer />
    </>
  );
}


