/**
 * Trip Activities: presents per-trip experiences in a responsive, scrollable layout with hover motion cues.
 */
import type { Activity } from "@shared/types";
import { useActivities } from "@/hooks/useActivities";

type ActivitiesProps = {
  tripId?: string;
};

const skeletonPlaceholders = Array.from({ length: 3 });

export default function Activities({ tripId }: ActivitiesProps) {
  const {
    data: activities = [],
    isLoading,
    isError,
  } = useActivities(tripId);

  if (!tripId) {
    return null;
  }

  return (
    <section className="bg-white px-6 py-12 md:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-velvet-green">What You'll Do</h2>
          <p className="text-sm text-gray-600">Curated experiences to complete your journey.</p>
        </header>

        {isLoading ? (
          <div
            className="flex flex-col gap-6 md:flex-row md:overflow-x-auto md:scroll-smooth md:[scrollbar-width:none]"
            tabIndex={0}
          >
            {skeletonPlaceholders.map((_, index) => (
              <div
                key={index}
                className="flex w-full flex-shrink-0 flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm animate-pulse md:w-72"
              >
                <div className="h-40 w-full rounded-xl bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            We couldn't load the activities right now. Please try again later.
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-600">Activities will be announced soon. Check back for updates!</p>
        ) : (
          <div
            className="flex flex-col gap-6 md:flex-row md:overflow-x-auto md:scroll-smooth md:[scrollbar-width:none]"
            tabIndex={0}
          >
            {activities.map((activity: Activity) => (
              <article
                key={activity.id}
                className="group flex w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-transform duration-200 ease-in-out md:w-72 md:hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={activity.image_url}
                    alt={activity.name}
                    className="h-full w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h4 className="text-lg font-semibold text-gray-900">{activity.name}</h4>
                  <p className="flex-1 text-sm leading-relaxed text-gray-600">{activity.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
