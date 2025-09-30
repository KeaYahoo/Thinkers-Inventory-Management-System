/**
 * Data Fetching: Refactored to consume the useDestinations React Query hook for declarative loading and error handling.
 */
import type { Destination } from "@shared/types";
import { useDestinations } from "@/hooks/useDestinations";

type DestinationsProps = {
  showTitle?: boolean;
};

export default function Destinations({ showTitle = true }: DestinationsProps) {
  const {
    data: destinations = [],
    isLoading,
    isError,
  } = useDestinations();

  if (isLoading) {
    return (
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading destinations...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center text-red-500">
          <p>Error: Failed to fetch destinations.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {showTitle && (
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4 text-gray-900 italic">
              Explore South Africa
            </h2>
            <p className="text-gray-600 text-lg">
              Discover South Africa's magic and wonder
            </p>
          </div>
        )}
        
        <div className="mb-12">
          <h3 className="text-2xl font-medium text-velvet-green mb-8">Top Destinations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((destination: Destination) => (
              <div 
                key={destination.id}
                className="relative group overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer"
              >
                <img 
                  src={destination.image_url}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h4 className="text-xl font-semibold mb-2">{destination.name}</h4>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {destination.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
