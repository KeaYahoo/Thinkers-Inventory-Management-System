/**
 * Activities API: exposes trip-specific activities with explicit column selection and hardened error handling.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";

const ACTIVITY_COLUMNS = "id, name, description, image_url, trip_id, created_at";

export const handleGetActivitiesByTripId: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params as { tripId?: string };

    if (!tripId) {
      return res.status(400).json({ message: "Trip identifier is required." });
    }

    const { data, error } = await supabase
      .from("activities")
      .select(ACTIVITY_COLUMNS)
      .eq("trip_id", tripId);

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('[API Error in handleGetActivitiesByTripId]:', error);
    return res.status(500).json({
      message: "Error fetching activities",
      error: "Internal Server Error",
    });
  }
};
