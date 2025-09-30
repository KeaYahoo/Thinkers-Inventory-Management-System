import Header from "@/components/Header";
import Destinations from "@/components/Destinations";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";

export default function Nearby() {
  return (
    <>
      <Seo
        title="Destinations near you"
        description="Find short-haul getaways and nearby South African escapes curated by Trvlsync."
      />
      <Header />
      <main aria-labelledby="nearby-heading">
        <div className="px-6 pt-32 pb-4 text-center">
          <h1 id="nearby-heading" className="text-4xl font-light text-gray-900 lg:text-5xl">
            Destinations near you
          </h1>
          <p className="mt-2 text-lg text-gray-600">Discover amazing places just a short trip away.</p>
        </div>
        <Destinations showTitle={false} />
      </main>
      <Footer />
    </>
  );
}
