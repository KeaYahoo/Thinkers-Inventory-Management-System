/**
 * Type Safety: Swapped to an icon available in Heroicons to satisfy strict typings.
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { HandRaisedIcon, UsersIcon, ShieldCheckIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export default function About() {
  return (
    <>
      <Seo
        title="About Trvlsync"
        description="Learn how Trvlsync curates authentic, sustainable travel experiences across South Africa."
      />
      <Header />
      <main aria-labelledby="about-heading">
        {/* Title Section */}
        <section className="px-6 pt-32 pb-16 text-center">
          <h1 id="about-heading" className="mb-4 text-4xl font-light italic text-gray-900 lg:text-5xl">
            About Trvlsync
          </h1>
          <p className="text-lg text-gray-600">Your gateway to authentic South African adventures.</p>
        </section>

        {/* Mission Section */}
        <section className="px-6 pb-20 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="A sweeping South African landscape of mountains and sea"
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>
            <div>
              <h2 className="mb-6 text-2xl font-medium text-velvet-green">Our mission</h2>
              <p className="mb-4 leading-relaxed text-gray-600">
                Trvlsync was born from a simple, powerful idea: to share the authentic soul of South Africa with the world. We believe that travel is more than visiting a place; it is about connecting with its people, its culture, and its stories. Our mission is to curate unforgettable, tailor-made experiences that go beyond the typical tourist trail.
              </p>
              <p className="leading-relaxed text-gray-600">
                We partner with local guides, boutique hotels, and hidden gems to ensure every trip is unique, sustainable, and memorable. From the vibrant streets of Johannesburg to the serene vineyards of Stellenbosch, we are your trusted sync to the heart of South Africa.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-gray-50 px-6 py-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-center text-3xl font-light text-gray-900 lg:text-4xl">What we stand for</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="article">
                <HandRaisedIcon className="mx-auto mb-4 h-8 w-8 text-velvet-green" aria-hidden />
                <h3 className="text-lg font-medium">Authenticity</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  We prioritise genuine experiences that reflect the true culture and spirit of South Africa.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="article">
                <UsersIcon className="mx-auto mb-4 h-8 w-8 text-velvet-green" aria-hidden />
                <h3 className="text-lg font-medium">Local expertise</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Our team consists of passionate locals who know the country's best-kept secrets.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="article">
                <ShieldCheckIcon className="mx-auto mb-4 h-8 w-8 text-velvet-green" aria-hidden />
                <h3 className="text-lg font-medium">Quality & safety</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Your comfort and safety are paramount. We meticulously vet every partner and experience.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="article">
                <GlobeAltIcon className="mx-auto mb-4 h-8 w-8 text-velvet-green" aria-hidden />
                <h3 className="text-lg font-medium">Sustainability</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
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

