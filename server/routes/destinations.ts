/**
 * Query Hardening: restrict destination select to explicit columns to avoid over-fetching and data leaks.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";

export const handleGetDestinations: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("destinations")
      .select("id, name, description, image_url, created_at");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('[API Error in handleGetDestinations]:', error);
    res.status(500).json({
      message: "Error fetching destinations",
      error: "Internal Server Error",
    });
  }
};
