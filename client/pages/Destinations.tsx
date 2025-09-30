import Header from "@/components/Header";
import Destinations from "@/components/Destinations";
import Footer from "@/components/Footer";

export default function DestinationsPage() {
  return (
    <>
      <Header />
      <main>
        <div className="pt-32 pb-12 px-6 text-center">
          <h2 className="font-light text-4xl lg:text-5xl text-gray-900">All Destinations</h2>
        </div>
        <Destinations showTitle={false} />
      </main>
      <Footer />
    </>
  );
}
