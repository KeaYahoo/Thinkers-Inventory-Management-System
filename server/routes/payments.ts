/**
 * Payments API: creates a booking and returns a stubbed payment URL for checkout simulation.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";

export const handleCreatePayment: RequestHandler = async (req, res) => {
  try {
    const userId = (req as { userId?: string | number }).userId;
    const { trip_id: tripId, start_date: startDate } = req.body as {
      trip_id?: string;
      start_date?: string;
    };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!tripId) {
      return res.status(400).json({ message: "trip_id is required" });
    }

    const insertPayload: { user_id: string | number; trip_id: string; start_date?: string } = {
      user_id: userId,
      trip_id: tripId,
    };

    if (startDate) {
      insertPayload.start_date = startDate;
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      return res.status(500).json({ message: "Failed to create booking", error: "Missing booking identifier" });
    }

    const bookingId = String(data.id);
    const paymentUrl = `/booking-success/${bookingId}`;

    return res.status(201).json({ bookingId, paymentUrl });
  } catch (error) {
    console.error('[API Error in handleCreatePayment]:', error);
    return res.status(500).json({
      message: "Error creating payment",
      error: "Internal Server Error",
    });
  }
};
