import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDaysIcon, MapPinIcon, UsersIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <section className="relative flex h-screen items-center justify-start" aria-labelledby="hero-heading">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://cdn.builder.io/api/v1/image/assets%2Fea961abc0da24d56b7467e50e5f5e782%2F1d1eda99208a4cd1b5e6dc182be60613?format=webp&width=800')",
        }}
        role="presentation"
        aria-hidden
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden />
      </div>

      <div className="relative z-10 max-w-2xl px-6 lg:px-12">
        <h1 id="hero-heading" className="mb-6 text-4xl font-light leading-tight text-white sm:text-5xl lg:text-6xl">
          <span className="italic">Creating memories.</span>
          <br />
          <span className="italic">One destination at a time.</span>
        </h1>

        <p className="mb-12 max-w-md text-lg leading-relaxed text-white/90">
          Trvlsync curates tailor-made experiences for jet-setters looking to create a memorable time exploring.
        </p>

        <form
          className="flex max-w-2xl flex-col items-stretch gap-2 rounded-full bg-gradient-to-r from-primary-brown to-transparent p-3 backdrop-blur-sm sm:flex-row sm:items-center"
          aria-label="Search for tailored trips"
        >
          <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-2">
            <MapPinIcon className="h-4 w-4 text-white/70" aria-hidden />
            <div className="flex w-full flex-col">
              <Label htmlFor="search-location" className="sr-only">
                City, province, or airport
              </Label>
              <Input
                id="search-location"
                type="search"
                placeholder="City, province, airport"
                className="h-auto flex-1 border-none bg-transparent px-0 text-sm text-white placeholder-white/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-describedby="location-helper"
              />
              <span id="location-helper" className="sr-only">
                Enter a city, province, or airport you would like to explore.
              </span>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-white/30 sm:block" aria-hidden />

          <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-2">
            <CalendarDaysIcon className="h-4 w-4 text-white/70" aria-hidden />
            <div className="flex w-full flex-col">
              <Label htmlFor="search-dates" className="sr-only">
                Preferred travel dates
              </Label>
              <Input
                id="search-dates"
                type="text"
                placeholder="Date"
                className="h-auto flex-1 border-none bg-transparent px-0 text-sm text-white placeholder-white/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="hidden h-6 w-px bg-white/30 sm:block" aria-hidden />

          <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-2">
            <UsersIcon className="h-4 w-4 text-white/70" aria-hidden />
            <div className="flex w-full flex-col">
              <Label htmlFor="search-guests" className="sr-only">
                Number of guests
              </Label>
              <Input
                id="search-guests"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Guests"
                className="h-auto flex-1 border-none bg-transparent px-0 text-sm text-white placeholder-white/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            className="self-end rounded-full bg-velvet-green hover:bg-green-dark sm:self-auto"
            aria-label="Search trips"
          >
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Search trips</span>
          </Button>
        </form>
      </div>
    </section>
  );
}
