import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Trip } from '@shared/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [price, setPrice] = useState<number[]>([10000]);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (price[0] < 10000) params.append('maxPrice', price[0].toString());

      const response = await fetch(`/api/trips?${params.toString()}`);
      const data = await response.json();
      setTrips(data);
      setIsLoading(false);
    };

    const handler = setTimeout(() => {
      fetchTrips();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, price]);

  return (
    <>
      <Header />
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <h1 className="text-4xl lg:text-5xl font-light mb-12 text-center text-gray-900">
          Available Trips
        </h1>

        <div className="max-w-7xl mx-auto mb-12 p-6 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Price: R{price[0]}</label>
            <Slider
              defaultValue={[10000]}
              max={10000}
              step={500}
              value={price}
              onValueChange={setPrice}
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-center">Loading trips...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {trips.map((trip) => (
              <Link to={`/trips/${trip.id}`} key={trip.id}>
                <Card className="overflow-hidden h-full flex flex-col group">
                  <img src={trip.image_url} alt={trip.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <CardHeader>
                    <CardTitle>{trip.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-sm">{trip.description}</p>
                  </CardContent>
                  <CardFooter>
                    <p className="font-semibold text-lg text-primary-brown">From R{trip.price}</p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
