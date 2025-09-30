/**
 * Locations API: aggregates trip and activity coordinates for map visualisation while enforcing explicit column selection.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";

type LocationPoint = {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  type: "trip" | "activity";
};

const TRIP_LOCATION_COLUMNS = "name, latitude, longitude";
const ACTIVITY_LOCATION_COLUMNS = "name, latitude, longitude";

export const handleGetLocationsByTripId: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params as { tripId?: string };

    if (!tripId) {
      return res.status(400).json({ message: "Trip identifier is required." });
    }

    const [tripResult, activitiesResult] = await Promise.all([
      supabase
        .from("trips")
        .select(TRIP_LOCATION_COLUMNS)
        .eq("id", tripId)
        .single(),
      supabase
        .from("activities")
        .select(ACTIVITY_LOCATION_COLUMNS)
        .eq("trip_id", tripId),
    ]);

    const { data: tripData, error: tripError } = tripResult;
    if (tripError) throw tripError;
    if (!tripData) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const { data: activitiesData, error: activitiesError } = activitiesResult;
    if (activitiesError) throw activitiesError;

    const locations: LocationPoint[] = [];

    locations.push({
      name: tripData.name,
      latitude: tripData.latitude,
      longitude: tripData.longitude,
      type: "trip",
    });

    if (activitiesData && activitiesData.length > 0) {
      for (const activity of activitiesData) {
        locations.push({
          name: activity.name,
          latitude: activity.latitude,
          longitude: activity.longitude,
          type: "activity",
        });
      }
    }

    return res.status(200).json(locations);
  } catch (error) {
    console.error('[API Error in handleGetLocationsByTripId]:', error);
    return res.status(500).json({
      message: "Error fetching locations",
      error: "Internal Server Error",
    });
  }
};
