import Header from "@/components/Header";
import Destinations from "@/components/Destinations";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";

export default function DestinationsPage() {
  return (
    <>
      <Seo
        title="Explore South African destinations"
        description="Browse the most loved cities and regions curated by Trvlsync with rich descriptions and photography."
      />
      <Header />
      <main aria-labelledby="destinations-heading">
        <div className="px-6 pt-32 pb-12 text-center">
          <h1 id="destinations-heading" className="text-4xl font-light text-gray-900 lg:text-5xl">
            All Destinations
          </h1>
          <p className="mt-4 text-gray-600">
            Discover inspiring locations handpicked for unforgettable South African itineraries.
          </p>
        </div>
        <Destinations showTitle={false} />
      </main>
      <Footer />
    </>
  );
}
