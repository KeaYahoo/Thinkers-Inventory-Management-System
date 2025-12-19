/**
 * Admin Routes: review moderation endpoints restricted to admin users.
 */
import type { RequestHandler } from "express";
import { createSupabaseClient } from "../lib/supabaseClient";
import type { AuthenticatedRequest } from "../middleware/auth";

const REVIEW_COLUMNS = "id, rating, comment, user_id, trip_id, created_at, is_approved";
const USER_COLUMNS = "id, email";

export const handleGetPendingReviews: RequestHandler = async (req, res) => {
  try {
    const { token } = req as AuthenticatedRequest;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const supabase = createSupabaseClient(token);

    const { data, error } = await supabase
      .from("reviews")
      .select(`${REVIEW_COLUMNS}, user:profiles(${USER_COLUMNS})`)
      .eq("is_approved", false)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error('[API Error in handleGetPendingReviews]:', error);
    return res.status(500).json({
      message: "Error fetching pending reviews",
      error: "Internal Server Error",
    });
  }
};

export const handleApproveReview: RequestHandler = async (req, res) => {
  try {
    const { reviewId } = req.params as { reviewId?: string };
    const { token } = req as AuthenticatedRequest;

    if (!reviewId) {
      return res.status(400).json({ message: "Review identifier is required." });
    }
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const supabase = createSupabaseClient(token);

    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", reviewId);

    if (error) throw error;

    return res.status(200).json({ message: "Review approved" });
  } catch (error) {
    console.error('[API Error in handleApproveReview]:', error);
    return res.status(500).json({
      message: "Error approving review",
      error: "Internal Server Error",
    });
  }
};

export const handleDeleteReview: RequestHandler = async (req, res) => {
  try {
    const { reviewId } = req.params as { reviewId?: string };
    const { token } = req as AuthenticatedRequest;

    if (!reviewId) {
      return res.status(400).json({ message: "Review identifier is required." });
    }
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const supabase = createSupabaseClient(token);

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;

    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error('[API Error in handleDeleteReview]:', error);
    return res.status(500).json({
      message: "Error deleting review",
      error: "Internal Server Error",
    });
  }
};
