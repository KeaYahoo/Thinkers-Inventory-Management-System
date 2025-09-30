/**
 * Data Fetching: Refactored to consume the useServices React Query hook for consistent loading/error UX.
 */
import { useServices } from "@/hooks/useServices";
import type { Service } from "@shared/types";
import { CalendarDaysIcon, CreditCardIcon, PhoneIcon, MapPinIcon, EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "calendar": CalendarDaysIcon,
  "credit-card": CreditCardIcon,
  "phone": PhoneIcon,
  "map-pin": MapPinIcon,
};

export default function Services() {
  const {
    data: services = [],
    isLoading,
    isError,
  } = useServices();

  if (isLoading) {
    return (
      <section className="py-20 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading services...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-20 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center text-red-500">
          <p>Error: Failed to fetch services.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-medium text-velvet-green mb-12">Our Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Services Grid */}
          <div className="order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {services.map((service: Service) => {
                const key = (service.icon_name || '').toLowerCase();
                const IconComp = ICON_MAP[key] || EllipsisHorizontalCircleIcon;
                return (
                  <div key={service.id} className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
                      <IconComp className="w-10 h-10 text-primary-brown" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services Image */}
          <div className="relative order-2" style={{ flexShrink: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Beautiful landscape"
              className="object-cover rounded-2xl"
              style={{ width: '572px', height: '696px', flexShrink: 0 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
