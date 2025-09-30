/**
 * Booking Routes: restrict selects and partition a user\'s bookings into upcoming and past collections for the dashboard.
 */
import type { RequestHandler } from "express";
import type { Booking } from "@shared/types";
import { supabase } from "../lib/supabaseClient";

const BOOKING_COLUMNS = "id, user_id, trip_id, created_at";
const TRIP_COLUMNS = "id, name, location, description, price, image_url, start_date, created_at";

export const handleCreateBooking: RequestHandler = async (req, res) => {
  try {
    const userId = (req as { userId?: string | number }).userId;
    const { trip_id } = req.body as { trip_id?: string };

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!trip_id) return res.status(400).json({ message: "trip_id is required" });

    const { data, error } = await supabase
      .from("bookings")
      .insert({ user_id: userId, trip_id })
      .select("id")
      .single();

    if (error) throw error;

    return res.status(201).json({ message: "Booking created", bookingId: data?.id });
  } catch (error) {
    console.error('[API Error in handleCreateBooking]:', error);
    return res.status(500).json({
      message: "Error creating booking",
      error: "Internal Server Error",
    });
  }
};

export const handleGetMyBookings: RequestHandler = async (req, res) => {
  try {
    const userId = (req as { userId?: string | number }).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { data, error } = await supabase
      .from("bookings")
      .select(`${BOOKING_COLUMNS}, trips(${TRIP_COLUMNS})`)
      .eq("user_id", userId);

    if (error) throw error;

    const bookings = (data ?? []) as Booking[];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    bookings.forEach((booking) => {
      const startDateRaw = booking.trips?.start_date;
      const startDate = startDateRaw ? new Date(startDateRaw) : null;

      if (startDate && !Number.isNaN(startDate.getTime()) && startDate >= today) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    return res.status(200).json({ upcoming, past });
  } catch (error) {
    console.error('[API Error in handleGetMyBookings]:', error);
    return res.status(500).json({
      message: "Error fetching bookings",
      error: "Internal Server Error",
    });
  }
};
