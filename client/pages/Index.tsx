import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { AnimatedSection } from "@/components/AnimatedSection";

export default function Index() {
  return (
    <>
      <Seo
        title="Tailored South African getaways"
        description="Discover curated trips, destinations, and services designed to make every South African adventure unforgettable."
      />
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1" aria-label="Featured travel inspiration">
          <AnimatedSection className="grid grid-cols-12">
            <div className="col-span-12">
              <Hero />
            </div>
          </AnimatedSection>
          <AnimatedSection className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12">
                <Destinations />
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12">
                <Services />
              </div>
            </div>
          </AnimatedSection>
        </main>
        <Footer />
      </div>
    </>
  );
}
