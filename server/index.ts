/**
 * Server Bootstrap: verifies JWT configuration and wires profile read/write routes alongside bookings, activities, and reviews.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleChat } from "./routes/chat";
import { handleRegister, handleLogin } from "./routes/auth";
import { handleGetDestinations } from "./routes/destinations";
import { handleGetServices } from "./routes/services";
import { handleGetTrips, handleGetTripById, handleGetTripAvailability } from "./routes/trips";
import { handleCreatePayment } from "./routes/payments";
import { handlePayfastIPN } from "./routes/payfast";
import { authMiddleware, adminMiddleware } from "./middleware/auth";
import { handleCreateBooking, handleGetMyBookings } from "./routes/bookings";
import { handleGetBookingById } from "./routes/booking";
import { handleGetActivitiesByTripId } from "./routes/activities";
import { handleGetLocationsByTripId } from "./routes/locations";
import { handleGetReviewsByTripId, handleCreateReview } from "./routes/reviews";
import { handleGetCurrentUser, handleUpdateUser } from "./routes/users";
import { handleGetPendingReviews, handleApproveReview, handleDeleteReview } from "./routes/admin";

export function createServer() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in the environment variables. Server cannot start.");
    process.exit(1);
  }

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/chat", handleChat);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/destinations", handleGetDestinations);
  app.get("/api/services", handleGetServices);
  app.get("/api/trips", handleGetTrips);
  app.get("/api/trips/:id", handleGetTripById);
  app.get("/api/trips/:id/availability", handleGetTripAvailability);
  app.get("/api/trips/:tripId/activities", handleGetActivitiesByTripId);
  app.get("/api/trips/:tripId/locations", handleGetLocationsByTripId);
  app.get("/api/trips/:tripId/reviews", handleGetReviewsByTripId);
  app.post("/api/trips/:tripId/reviews", authMiddleware, handleCreateReview);

  // Protected routes
  app.post("/api/bookings", authMiddleware, handleCreateBooking);
  app.post("/api/payments", authMiddleware, handleCreatePayment);
  app.post("/api/payfast/ipn", handlePayfastIPN);
  app.get("/api/admin/reviews/pending", authMiddleware, adminMiddleware, handleGetPendingReviews);
  app.post("/api/admin/reviews/:reviewId/approve", authMiddleware, adminMiddleware, handleApproveReview);
  app.delete("/api/admin/reviews/:reviewId", authMiddleware, adminMiddleware, handleDeleteReview);
  app.get("/api/my-bookings", authMiddleware, handleGetMyBookings);
  app.get("/api/bookings/:bookingId", authMiddleware, handleGetBookingById);
  app.get("/api/users/me", authMiddleware, handleGetCurrentUser);
  app.put("/api/users/me", authMiddleware, handleUpdateUser);

  return app;
}
