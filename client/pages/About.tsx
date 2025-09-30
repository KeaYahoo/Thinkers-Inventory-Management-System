/**
 * Type Safety: Swapped to an icon available in Heroicons to satisfy strict typings.
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HandRaisedIcon, UsersIcon, ShieldCheckIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export default function About() {
  return (
    <>
      <Header />
      <main>
        {/* Title Section */}
        <section className="pt-32 pb-16 px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-light mb-4 text-gray-900 italic">About Trvlsync</h1>
          <p className="text-lg text-gray-600">Your Gateway to Authentic South African Adventures</p>
        </section>

        {/* Mission Section */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="South African landscape"
                className="rounded-2xl object-cover w-full h-full"
              />
            </div>
            <div>
              <h2 className="text-2xl font-medium text-velvet-green mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Trvlsync was born from a simple, powerful idea: to share the authentic soul of South Africa with the world. We believe that travel is more than just visiting a place; it's about connecting with its people, its culture, and its stories. Our mission is to curate unforgettable, tailor-made experiences that go beyond the typical tourist trail.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We partner with local guides, boutique hotels, and hidden gems to ensure every trip is unique, sustainable, and deeply memorable. From the vibrant streets of Johannesburg to the serene vineyards of Stellenbosch, we are your trusted sync to the heart of South Africa.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-gray-50 py-20 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-3xl lg:text-4xl font-light mb-12 text-gray-900">What We Stand For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <HandRaisedIcon className="w-8 h-8 mx-auto mb-4 text-velvet-green" />
                <h3 className="font-medium text-lg mb-2">Authenticity</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We prioritize genuine experiences that reflect the true culture and spirit of South Africa.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <UsersIcon className="w-8 h-8 mx-auto mb-4 text-velvet-green" />
                <h3 className="font-medium text-lg mb-2">Local Expertise</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Our team consists of passionate locals who know the country's best-kept secrets.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-4 text-velvet-green" />
                <h3 className="font-medium text-lg mb-2">Quality & Safety</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your comfort and safety are paramount. We meticulously vet every partner and experience.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <GlobeAltIcon className="w-8 h-8 mx-auto mb-4 text-velvet-green" />
                <h3 className="font-medium text-lg mb-2">Sustainability</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We are committed to responsible tourism that supports local communities and preserves nature.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
