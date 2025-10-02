import type { Page } from "@playwright/test";
import type {
  Activity,
  Booking,
  Destination,
  ReviewWithUser,
  Service,
  Trip,
  TripAvailability,
} from "@shared/types";
import { PaymentProvider, PaymentStatus } from "@shared/types";

type PartitionedBookings = {
  upcoming: Booking[];
  past: Booking[];
};

type TripCollection = Record<string, TripAvailability[]>;
type ActivityCollection = Record<string, Activity[]>;
type ReviewCollection = Record<string, ReviewWithUser[]>;

type MockData = {
  destinations: Destination[];
  services: Service[];
  trips: Trip[];
  tripAvailability: TripCollection;
  activities: ActivityCollection;
  tripReviews: ReviewCollection;
  bookings: PartitionedBookings;
  pendingReviews: ReviewWithUser[];
  bookingIndex: Record<string, Booking>;
};

const tripOne: Trip = {
  id: "trip-1",
  name: "Cape Winelands Escape",
  location: "Stellenbosch, South Africa",
  description: "Sip world-class wines and explore vineyard valleys.",
  price: 3500,
  image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=960&q=80",
  start_date: "2025-06-01T00:00:00.000Z",
  created_at: "2024-12-01T00:00:00.000Z",
  latitude: -33.9333,
  longitude: 18.8667,
};

const tripTwo: Trip = {
  id: "trip-2",
  name: "Garden Route Getaway",
  location: "Knysna, South Africa",
  description: "Road-trip through lagoons, forests, and coastal cliffs.",
  price: 5400,
  image_url: "https://images.unsplash.com/photo-1499696010181-8ee4475286b7?auto=format&fit=crop&w=960&q=80",
  start_date: "2025-07-15T00:00:00.000Z",
  created_at: "2024-12-05T00:00:00.000Z",
  latitude: -34.0363,
  longitude: 23.0471,
};

const defaultBooking: Booking = {
  id: "booking-1",
  user_id: "user-1",
  trip_id: "trip-1",
  created_at: "2025-01-15T00:00:00.000Z",
  payment_status: PaymentStatus.Paid,
  payment_provider: PaymentProvider.PayFast,
  payment_metadata: {
    provider: PaymentProvider.PayFast,
    amount: tripOne.price,
    currency: "ZAR",
    processed_at: "2025-01-15T00:00:00.000Z",
  },
  start_date: tripOne.start_date,
  trips: tripOne,
};
const defaultData: MockData = {
  destinations: [
    {
      id: "dest-1",
      name: "Cape Town",
      description: "Coastal city with Table Mountain views.",
      image_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
      created_at: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "dest-2",
      name: "Kruger National Park",
      description: "Big five safaris and sunrise game drives.",
      image_url: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=800&q=80",
      created_at: "2025-01-01T00:00:00.000Z",
    },
  ],
  services: [
    {
      id: "service-1",
      title: "Tailored itineraries",
      description: "Personalised schedules curated by local experts.",
      icon_name: "calendar",
      created_at: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "service-2",
      title: "Flexible payments",
      description: "Secure payment plans with instant confirmation.",
      icon_name: "credit-card",
      created_at: "2025-01-01T00:00:00.000Z",
    },
  ],
  trips: [tripOne, tripTwo],
  tripAvailability: {
    "trip-1": [
      { start_date: "2025-06-01T00:00:00.000Z", price: 3500 },
      { start_date: "2025-07-01T00:00:00.000Z", price: 3600 },
    ],
    "trip-2": [
      { start_date: "2025-07-15T00:00:00.000Z", price: 5400 },
      { start_date: "2025-08-05T00:00:00.000Z", price: 5200 },
    ],
  },
  activities: {
    "trip-1": [
      {
        id: "activity-1",
        name: "Estate wine tasting",
        description: "Sample handcrafted vintages with local sommeliers.",
        image_url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
        trip_id: "trip-1",
        created_at: "2024-12-06T00:00:00.000Z",
      },
    ],
    "trip-2": [
      {
        id: "activity-2",
        name: "Tsitsikamma canopy tour",
        description: "Zip-line between ancient hardwood trees.",
        image_url: "https://images.unsplash.com/photo-1578926078640-90a7e92d498f?auto=format&fit=crop&w=800&q=80",
        trip_id: "trip-2",
        created_at: "2024-12-07T00:00:00.000Z",
      },
    ],
  },
  tripReviews: {
    "trip-1": [
      {
        id: "review-1",
        rating: 5,
        comment: "Spectacular scenery and friendly guides!",
        user_id: "user-2",
        trip_id: "trip-1",
        created_at: "2025-01-10T00:00:00.000Z",
        is_approved: true,
        user: { id: "user-2", email: "traveler.one@example.com" },
      },
    ],
  },
  bookings: {
    upcoming: [defaultBooking],
    past: [],
  },
  pendingReviews: [
    {
      id: "pending-1",
      rating: 4,
      comment: "Lovely stay, breakfast could improve.",
      user_id: "user-3",
      trip_id: "trip-1",
      created_at: "2025-02-01T00:00:00.000Z",
      user: { id: "user-3", email: "traveler.one@example.com" },
    },
    {
      id: "pending-2",
      rating: 5,
      comment: "Exceeded all expectations!",
      user_id: "user-4",
      trip_id: "trip-2",
      created_at: "2025-02-02T00:00:00.000Z",
      user: { id: "user-4", email: "traveler.two@example.com" },
    },
  ],
  bookingIndex: {
    [defaultBooking.id]: defaultBooking,
  },
};

function cloneData(data: MockData): MockData {
  return JSON.parse(JSON.stringify(data)) as MockData;
}

function mergeData(target: MockData, source: Partial<MockData>) {
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      // @ts-expect-error runtime merge for arrays
      target[key] = value;
    } else if (typeof value === "object" && value !== null) {
      // @ts-expect-error runtime merge for index signatures
      target[key] = { ...target[key], ...value };
    } else {
      // @ts-expect-error runtime merge for primitives
      target[key] = value;
    }
  }
}

function createJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `${header}.${body}.signature`;
}

function decodeToken(token: string | undefined) {
  if (!token) {
    return {} as Record<string, unknown>;
  }
  const parts = token.split(".");
  if (parts.length < 2) {
    return {} as Record<string, unknown>;
  }
  try {
    const decoded = Buffer.from(parts[1], "base64").toString("utf8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function jsonResponse(route: import("@playwright/test").Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

export async function setupDefaultMocks(page: Page, overrides?: Partial<MockData>) {
  const data = cloneData(defaultData);
  const indexedBookings = [...data.bookings.upcoming, ...data.bookings.past];
  data.bookingIndex = {};
  indexedBookings.forEach((booking) => {
    data.bookingIndex[booking.id] = booking;
  });
  if (overrides) {
    mergeData(data, overrides);
  }
  const mergedBookings = [...data.bookings.upcoming, ...data.bookings.past];
  data.bookingIndex = {};
  mergedBookings.forEach((booking) => {
    data.bookingIndex[booking.id] = booking;
  });

  const mapPayfastStatus = (value?: string | null): PaymentStatus => {
    const normalised = (value ?? "").toUpperCase();
    if (normalised === "COMPLETE") {
      return PaymentStatus.Paid;
    }
    if (normalised === "FAILED" || normalised === "CANCELLED") {
      return PaymentStatus.Failed;
    }
    return PaymentStatus.Pending;
  };

  const upsertBooking = (booking: Booking, group: "upcoming" | "past" = "upcoming") => {
    const target = data.bookings[group];
    const existingIndex = target.findIndex((entry) => entry.id === booking.id);
    if (existingIndex >= 0) {
      target[existingIndex] = booking;
    } else {
      target.push(booking);
    }
    const otherGroup = group === "upcoming" ? "past" : "upcoming";
    data.bookings[otherGroup] = data.bookings[otherGroup].filter((entry) => entry.id !== booking.id);
    data.bookingIndex[booking.id] = booking;
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    const authHeader = request.headers()["authorization"];
    const authToken = authHeader?.replace("Bearer ", "");
    const claims = decodeToken(authToken);

    const respondJSON = (body: unknown, status = 200) => jsonResponse(route, body, status);

    if (method === "GET" && pathname === "/api/destinations") {
      return respondJSON(data.destinations);
    }

    if (method === "GET" && pathname === "/api/services") {
      return respondJSON(data.services);
    }

    if (method === "GET" && pathname === "/api/trips") {
      let trips = [...data.trips];
      const searchTerm = url.searchParams.get("search");
      const maxPrice = url.searchParams.get("maxPrice");
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        trips = trips.filter((trip) =>
          trip.name.toLowerCase().includes(lower) || trip.location.toLowerCase().includes(lower),
        );
      }
      if (maxPrice) {
        const cap = Number(maxPrice);
        if (!Number.isNaN(cap)) {
          trips = trips.filter((trip) => trip.price <= cap);
        }
      }
      return respondJSON(trips);
    }

    const tripMatch = pathname.match(/^\/api\/trips\/(.+)$/);
    if (tripMatch) {
      const [, rest] = tripMatch;
      const [tripId, resource] = rest.split("/");
      if (!tripId) {
        return respondJSON({ message: "Trip id missing" }, 400);
      }

      if (method === "GET" && !resource) {
        const trip = data.trips.find((item) => item.id === tripId);
        return respondJSON(trip ?? { message: "Trip not found" }, trip ? 200 : 404);
      }

      if (method === "GET" && resource === "availability") {
        return respondJSON(data.tripAvailability[tripId] ?? []);
      }

      if (method === "GET" && resource === "activities") {
        return respondJSON(data.activities[tripId] ?? []);
      }

      if (method === "GET" && resource === "reviews") {
        return respondJSON(data.tripReviews[tripId] ?? []);
      }

      if (method === "POST" && resource === "reviews") {
        const payload = request.postDataJSON() as { rating: number; comment: string };
        const newReview: ReviewWithUser = {
          id: `review-${Date.now()}`,
          rating: payload.rating,
          comment: payload.comment,
          user_id: String(claims.userId ?? "user-e2e"),
          trip_id: tripId,
          created_at: new Date().toISOString(),
          user: {
            id: String(claims.userId ?? "user-e2e"),
            email: String(claims.email ?? "user@example.com"),
          },
          is_approved: true,
        };
        data.tripReviews[tripId] = [...(data.tripReviews[tripId] ?? []), newReview];
        return respondJSON({ message: "Review created", review: newReview }, 201);
      }
    }

    if (method === "POST" && pathname === "/api/auth/register") {
      const body = request.postDataJSON() as { email: string };
      const token = createJwt({ role: "user", userId: "user-1", email: body.email });
      return respondJSON({ token, role: "user" });
    }

    if (method === "POST" && pathname === "/api/auth/login") {
      const body = request.postDataJSON() as { email: string };
      const isAdmin = body.email?.toLowerCase().includes("admin");
      const token = createJwt({
        role: isAdmin ? "admin" : "user",
        userId: isAdmin ? "admin-1" : "user-1",
        email: body.email,
      });
      return respondJSON({ token, role: isAdmin ? "admin" : "user" });
    }

    if (method === "GET" && pathname === "/api/users/me") {
      const email = String(claims.email ?? "user@example.com");
      const id = String(claims.userId ?? "user-1");
      return respondJSON({ id, email, full_name: null, avatar_url: null });
    }

    const bookingMatch = pathname.match(/^\/api\/bookings\/(.+)$/);
    if (bookingMatch && method === "GET") {
      const bookingId = bookingMatch[1];
      const booking = data.bookingIndex[bookingId];
      if (!booking) {
        return respondJSON({ message: "Booking not found" }, 404);
      }
      return respondJSON(booking);
    }

    if (method === "GET" && pathname === "/api/my-bookings") {
      return respondJSON(data.bookings);
    }

    if (method === "POST" && pathname === "/api/payments") {
      const payload = request.postDataJSON() as { trip_id?: string; start_date?: string };
      const tripId = payload.trip_id ?? data.trips[0]?.id ?? "trip-1";
      const trip = data.trips.find((item) => item.id === tripId) ?? data.trips[0];
      const amount = trip?.price ?? 0;
      const bookingId = `booking-${Date.now()}`;
      const userId = String(claims.userId ?? "user-1");
      const newBooking: Booking = {
        id: bookingId,
        user_id: userId,
        trip_id: trip?.id ?? tripId,
        created_at: new Date().toISOString(),
        payment_status: PaymentStatus.Pending,
        payment_provider: PaymentProvider.PayFast,
        payment_metadata: {
          provider: PaymentProvider.PayFast,
          amount,
          currency: "ZAR",
        },
        start_date: payload.start_date ?? trip?.start_date ?? null,
        trips: trip ?? data.trips[0],
      };
      upsertBooking(newBooking, "upcoming");

      const paymentUrl = `https://sandbox.payfast.co.za/eng/process?m_payment_id=${bookingId}`;

      return respondJSON({ bookingId, paymentUrl }, 201);
    }

    if (method === "POST" && pathname === "/api/payfast/ipn") {
      const rawBody = request.postData() ?? "";
      const params = new URLSearchParams(rawBody);
      const bookingId = params.get("m_payment_id");
      if (!bookingId) {
        return respondJSON({ message: "Missing booking reference" }, 400);
      }
      const booking = data.bookingIndex[bookingId];
      if (!booking) {
        return respondJSON({ message: "Booking not found" }, 404);
      }
      booking.payment_status = mapPayfastStatus(params.get("payment_status"));
      booking.payment_metadata = {
        ...(booking.payment_metadata ?? {}),
        payment_status: params.get("payment_status"),
        pf_payment_id: params.get("pf_payment_id"),
      };
      upsertBooking(booking, "upcoming");
      return respondJSON({ message: "Acknowledged" });
    }

    if (method === "GET" && pathname === "/api/admin/reviews/pending") {
      return respondJSON(data.pendingReviews);
    }

    const approveMatch = pathname.match(/^\/api\/admin\/reviews\/(.+)\/approve$/);
    if (method === "POST" && approveMatch) {
      const reviewId = approveMatch[1];
      data.pendingReviews = data.pendingReviews.filter((review) => review.id !== reviewId);
      return respondJSON({ message: "Review approved" });
    }

    const deleteMatch = pathname.match(/^\/api\/admin\/reviews\/(.+)$/);
    if (method === "DELETE" && deleteMatch) {
      const reviewId = deleteMatch[1];
      data.pendingReviews = data.pendingReviews.filter((review) => review.id !== reviewId);
      return respondJSON({ message: "Review deleted" });
    }

    if (method === "GET" && pathname.startsWith("/api/trips")) {
      return respondJSON([]);
    }

    return respondJSON({ message: `Unhandled mock for ${method} ${pathname}` }, 404);
  });

  return {
    data,
    createJwt,
  };
}

export { createJwt };
