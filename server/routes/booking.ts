/**
 * Booking Detail API: returns a single booking for the authenticated user with full trip timing and location context.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";

const BOOKING_COLUMNS = "id, user_id, trip_id, created_at";
const TRIP_COLUMNS = "id, name, location, description, price, image_url, start_date, created_at, latitude, longitude";

export const handleGetBookingById: RequestHandler = async (req, res) => {
  try {
    const { bookingId } = req.params as { bookingId?: string };
    const userId = (req as { userId?: string | number }).userId;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking identifier is required." });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`${BOOKING_COLUMNS}, trips(${TRIP_COLUMNS})`)
      .eq("id", bookingId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[API Error in handleGetBookingById]:', error);
    return res.status(500).json({
      message: "Error fetching booking",
      error: "Internal Server Error",
    });
  }
};
