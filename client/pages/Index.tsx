import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";

export default function Index() {
  return (
    <>
      <Seo
        title="Tailored South African getaways"
        description="Discover curated trips, destinations, and services designed to make every South African adventure unforgettable."
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1" aria-label="Featured travel inspiration">
          <Hero />
          <Destinations />
          <Services />
        </main>
        <Footer />
      </div>
    </>
  );
}
