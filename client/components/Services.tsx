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
      <section className="bg-gray-50 py-20 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <p>Loading services...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-gray-50 py-20 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl text-center text-red-500">
          <p>Error: Failed to fetch services.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-20 px-6 lg:px-12" aria-labelledby="services-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="services-heading" className="mb-12 text-2xl font-medium text-velvet-green">
          Our services
        </h2>

        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="order-1">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {services.map((service: Service) => {
                const key = (service.icon_name || "").toLowerCase();
                const IconComp = ICON_MAP[key] || EllipsisHorizontalCircleIcon;
                return (
                  <article key={service.id} className="text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
                      <IconComp className="h-10 w-10 text-primary-brown" aria-hidden />
                    </div>
                    <h3 className="mb-4 text-xl font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-base leading-relaxed text-gray-600">{service.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="relative order-2" style={{ flexShrink: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Two travellers enjoying a South African landscape"
              className="rounded-2xl object-cover"
              style={{ width: "572px", height: "696px", flexShrink: 0 }}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
