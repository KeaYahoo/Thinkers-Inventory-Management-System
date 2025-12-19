/**
 * Users API Hardened: exposes and mutates authenticated profile data without leaking sensitive fields.
 */
import type { Request, RequestHandler } from "express";
import { createSupabaseClient } from "../lib/supabaseClient";
import type { AuthenticatedRequest } from "../middleware/auth";

const USER_COLUMNS = "id, email, full_name, avatar_url";

export const handleGetCurrentUser: RequestHandler = async (req, res) => {
  try {
    const { userId, token } = req as AuthenticatedRequest;

    if (!userId || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const supabase = createSupabaseClient(token);

    const { data, error } = await supabase
      .from("profiles")
      .select(USER_COLUMNS)
      .eq("id", userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("[API Error in handleGetCurrentUser]:", error);
    return res.status(500).json({
      message: "Error fetching current user",
      error: "Internal Server Error",
    });
  }
};

export const handleUpdateUser: RequestHandler = async (req, res) => {
  try {
    const { userId, token } = req as AuthenticatedRequest;
    if (!userId || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { full_name, avatar_url } = req.body as {
      full_name?: unknown;
      avatar_url?: unknown;
    };

    const updates: { full_name?: string | null; avatar_url?: string | null } = {};

    if (typeof full_name !== "undefined") {
      if (full_name === null) {
        updates.full_name = null;
      } else if (typeof full_name === "string") {
        const trimmed = full_name.trim();
        if (trimmed.length > 120) {
          return res.status(400).json({ message: "full_name must be 120 characters or fewer." });
        }
        updates.full_name = trimmed.length === 0 ? null : trimmed;
      } else {
        return res.status(400).json({ message: "full_name must be a string." });
      }
    }

    if (typeof avatar_url !== "undefined") {
      if (avatar_url === null) {
        updates.avatar_url = null;
      } else if (typeof avatar_url === "string") {
        const trimmed = avatar_url.trim();
        if (trimmed.length > 2048) {
          return res.status(400).json({ message: "avatar_url is too long." });
        }
        updates.avatar_url = trimmed.length === 0 ? null : trimmed;
      } else {
        return res.status(400).json({ message: "avatar_url must be a string." });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No profile fields provided." });
    }

    const supabase = createSupabaseClient(token);

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select(USER_COLUMNS)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("[API Error in handleUpdateUser]:", error);
    return res.status(500).json({
      message: "Error updating profile",
      error: "Internal Server Error",
    });
  }
};
