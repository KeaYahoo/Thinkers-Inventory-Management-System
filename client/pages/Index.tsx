import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Destinations />
        <Services />
      </main>
      <Footer />
    </div>
  );
}
