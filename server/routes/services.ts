/**
 * Query Hardening: explicitly select service columns to prevent accidental exposure of future fields.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";

export const handleGetServices: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("id, title, description, icon_name, created_at");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('[API Error in handleGetServices]:', error);
    res.status(500).json({
      message: "Error fetching services",
      error: "Internal Server Error",
    });
  }
};
