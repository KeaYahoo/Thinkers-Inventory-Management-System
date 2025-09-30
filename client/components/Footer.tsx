/**
 * Footer Component: provides consistent global navigation, brand messaging, and legal links across pages.
 */
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-green-dark text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-semibold text-white">
              <span>trvlsync</span>
            </Link>
            <p className="text-sm text-gray-300 max-w-xs">
              Creating Memories. One destination at a time.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brown-light">Navigate</h3>
            <nav aria-label="Footer" className="mt-4 space-y-2 text-sm">
              <Link className="block text-gray-200 transition hover:text-white" to="/nearby">
                Nearby
              </Link>
              <Link className="block text-gray-200 transition hover:text-white" to="/destinations">
                Destinations
              </Link>
              <Link className="block text-gray-200 transition hover:text-white" to="/tours">
                AI Planner
              </Link>
              <Link className="block text-gray-200 transition hover:text-white" to="/about">
                About Us
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brown-light">Legal</h3>
            <div className="mt-4 space-y-2 text-sm">
              <Link className="block text-gray-200 transition hover:text-white" to="#">
                Terms of Service
              </Link>
              <Link className="block text-gray-200 transition hover:text-white" to="#">
                Privacy Policy
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brown-light">Connect</h3>
            <div className="mt-4 space-y-2 text-sm">
              <a className="block text-gray-200 transition hover:text-white" href="#" aria-label="Facebook">
                Facebook
              </a>
              <a className="block text-gray-200 transition hover:text-white" href="#" aria-label="Instagram">
                Instagram
              </a>
              <a className="block text-gray-200 transition hover:text-white" href="#" aria-label="Twitter">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 px-6 py-6 text-sm text-gray-300 md:flex-row md:items-center md:justify-between">
          <span>&copy; {currentYear} Trvlsync. All rights reserved.</span>
          <span className="flex items-center gap-2">Made in South Africa <span role="img" aria-label="South Africa flag">&#127475;&#127487;</span></span>
        </div>
      </div>
    </footer>
  );
}

