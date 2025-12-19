/**
 * Reviews API: exposes trip review retrieval/creation with explicit selects and guarded access.
 */
import type { RequestHandler } from "express";
import { z } from "zod";
import { createSupabaseClient, supabase as publicSupabase } from "../lib/supabaseClient";
import type { AuthenticatedRequest } from "../middleware/auth";

const REVIEW_COLUMNS = "id, rating, comment, user_id, trip_id, created_at, is_approved";
const USER_COLUMNS = "id, email";

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required").max(1000),
});

export const handleGetReviewsByTripId: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params as { tripId?: string };

    if (!tripId) {
      return res.status(400).json({ message: "Trip identifier is required." });
    }

    const { data, error } = await publicSupabase
      .from("reviews")
      .select(`${REVIEW_COLUMNS}, user:profiles(${USER_COLUMNS})`)
      .eq("trip_id", tripId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error('[API Error in handleGetReviewsByTripId]:', error);
    return res.status(500).json({
      message: "Error fetching reviews",
      error: "Internal Server Error",
    });
  }
};

export const handleCreateReview: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params as { tripId?: string };
    const { userId, token } = req as AuthenticatedRequest;

    if (!tripId) {
      return res.status(400).json({ message: "Trip identifier is required." });
    }

    if (!userId || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parseResult = createReviewSchema.safeParse({
      rating: Number(req.body?.rating),
      comment: req.body?.comment,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid review payload",
        details: parseResult.error.issues,
      });
    }

    const reviewPayload = {
      rating: parseResult.data.rating,
      comment: parseResult.data.comment,
      trip_id: tripId,
      user_id: userId,
      is_approved: false,
    };

    const supabase = createSupabaseClient(token);

    const { data, error } = await supabase
      .from("reviews")
      .insert(reviewPayload)
      .select(REVIEW_COLUMNS)
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Review submitted for moderation",
      review: data,
    });
  } catch (error) {
    console.error('[API Error in handleCreateReview]:', error);
    return res.status(500).json({
      message: "Error submitting review",
      error: "Internal Server Error",
    });
  }
};
