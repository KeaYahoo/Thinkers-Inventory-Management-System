import Header from "@/components/Header";
import Destinations from "@/components/Destinations";
import Footer from "@/components/Footer";

export default function Nearby() {
  return (
    <>
      <Header />
      <main>
        <div className="pt-32 pb-4 px-6 text-center">
          <h2 className="font-light text-4xl lg:text-5xl text-gray-900">Destinations Near You</h2>
          <p className="text-lg text-gray-600 mt-2">Discover amazing places just a short trip away.</p>
        </div>
        <Destinations showTitle={false} />
      </main>
      <Footer />
    </>
  );
}
