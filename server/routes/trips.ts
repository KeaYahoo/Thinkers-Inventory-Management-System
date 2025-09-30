/**
 * Query Hardening: constrain trip queries to explicit columns, now including start dates for scheduling features.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";

const TRIP_COLUMNS = "id, name, location, description, price, image_url, start_date, created_at";
const TRIP_AVAILABILITY_COLUMNS = "start_date, price";

export const handleGetTrips: RequestHandler = async (req, res) => {
  try {
    const { search, maxPrice } = req.query;

    let query = supabase.from("trips").select(TRIP_COLUMNS);

    if (typeof search === "string" && search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (typeof maxPrice === "string" && !isNaN(parseFloat(maxPrice))) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    const { data, error } = await query;

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('[API Error in handleGetTrips]:', error);
    res.status(500).json({
      message: "Error fetching trips",
      error: "Internal Server Error",
    });
  }
};

export const handleGetTripById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { data, error } = await supabase
      .from("trips")
      .select(TRIP_COLUMNS)
      .eq("id", id)
      .single();

    if (error) throw error;

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "Trip not found" });
    }
  } catch (error) {
    console.error('[API Error in handleGetTripById]:', error);
    res.status(500).json({
      message: "Error fetching trip",
      error: "Internal Server Error",
    });
  }
};

export const handleGetTripAvailability: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };

    const { data, error } = await supabase
      .from("trips")
      .select(TRIP_AVAILABILITY_COLUMNS)
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const availabilityEntry = {
      start_date: data.start_date,
      price: data.price,
    };

    if (!availabilityEntry.start_date) {
      return res.status(200).json([]);
    }

    return res.status(200).json([availabilityEntry]);
  } catch (error) {
    console.error('[API Error in handleGetTripAvailability]:', error);
    return res.status(500).json({
      message: "Error fetching trip availability",
      error: "Internal Server Error",
    });
  }
};
