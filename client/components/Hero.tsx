import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDaysIcon, MapPinIcon, UsersIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-start">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fea961abc0da24d56b7467e50e5f5e782%2F1d1eda99208a4cd1b5e6dc182be60613?format=webp&width=800')`
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 lg:px-12 max-w-2xl">
        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-light mb-6 leading-tight">
          <span className="italic">Creating Memories.</span>
          <br />
          <span className="italic">One destination at a time.</span>
        </h1>

        <p className="text-white/90 text-lg mb-12 max-w-md leading-relaxed">
          trvlsync curates tailor-made experiences for jet-setters looking to create a memorable time exploring.
        </p>

        {/* Search Form */}
        <div className="bg-gradient-to-r from-primary-brown to-transparent backdrop-blur-sm rounded-full p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-white/0 rounded-full">
            <MapPinIcon className="w-4 h-4 text-white/70" />
            <Input
              type="text"
              placeholder="City, Province, Airport"
              className="h-auto flex-1 border-none bg-transparent px-0 text-sm text-white placeholder-white/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/30" />

          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-white/0 rounded-full">
            <CalendarDaysIcon className="w-4 h-4 text-white/70" />
            <Input
              type="text"
              placeholder="Date"
              className="h-auto flex-1 border-none bg-transparent px-0 text-sm text-white placeholder-white/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/30" />

          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-white/0 rounded-full">
            <UsersIcon className="w-4 h-4 text-white/70" />
            <Input
              type="text"
              placeholder="Guests"
              className="h-auto flex-1 border-none bg-transparent px-0 text-sm text-white placeholder-white/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="button"
            size="icon"
            className="self-end sm:self-auto rounded-full bg-velvet-green hover:bg-green-dark"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="sr-only">Search trips</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
