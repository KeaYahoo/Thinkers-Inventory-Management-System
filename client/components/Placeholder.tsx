import { Link } from "react-router-dom";
import Header from "@/components/Header";

interface PlaceholderProps {
  title: string;
  description?: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-light mb-6 text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-gray-600 mb-8">
              {description}
            </p>
          )}
          <div className="bg-white rounded-2xl p-12 shadow-sm">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Page Under Construction
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              This page is being built! Continue prompting to help us fill in the content for this section.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-brown hover:bg-brown-dark text-white rounded-full transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
