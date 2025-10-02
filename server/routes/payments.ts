/**
 * Payments API: integrates with PayFast to create hosted payment sessions and persist booking state.
 */
import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";
import type { AuthenticatedRequest } from "../middleware/auth";
import {
  PAYFAST_PRODUCTION_URL,
  PAYFAST_SANDBOX_URL,
  buildPayfastSignature,
  normalisePayfastValue,
} from "../utils/payfast";
import { PaymentProvider, PaymentStatus } from "../../shared/types";

const PAYFAST_DEFAULT_MODE = "sandbox";

function buildApplicationUrl(path: string) {
  const baseUrl = process.env.APP_PUBLIC_URL ?? "http://127.0.0.1:8080";
  const normalisedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalisedBase}${path}`;
}

function toTwoDecimalPlaces(amount: number) {
  return amount.toFixed(2);
}

export const handleCreatePayment: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
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

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;

    if (!merchantId || !merchantKey) {
      return res.status(500).json({ message: "PayFast credentials are not configured." });
    }

    const [{ data: trip, error: tripError }, { data: userProfile, error: userError }] = await Promise.all([
      supabase
        .from("trips")
        .select("id, name, price, description")
        .eq("id", tripId)
        .single(),
      supabase
        .from("users")
        .select("email, full_name")
        .eq("id", userId)
        .single(),
    ]);

    if (tripError) throw tripError;
    if (userError) throw userError;
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const amount = Number(trip.price ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Trip price is invalid." });
    }

    const initialMetadata = {
      provider: PaymentProvider.PayFast,
      amount,
      currency: "ZAR",
      created_at: new Date().toISOString(),
    };

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        trip_id: tripId,
        start_date: startDate ?? null,
        payment_status: PaymentStatus.Pending,
        payment_provider: PaymentProvider.PayFast,
        payment_metadata: initialMetadata,
      })
      .select("id")
      .single();

    if (bookingError) throw bookingError;

    if (!booking?.id) {
      return res.status(500).json({ message: "Failed to create booking", error: "Missing booking identifier" });
    }

    const bookingId = String(booking.id);
    const appReturnBase = `/payment-status/${bookingId}`;
    const returnUrl = buildApplicationUrl(`${appReturnBase}?status=success`);
    const cancelUrl = buildApplicationUrl(`${appReturnBase}?status=cancelled`);
    const notifyUrl = process.env.PAYFAST_NOTIFY_URL ?? buildApplicationUrl("/api/payfast/ipn");

    const recipientEmail = userProfile?.email ?? "traveler@example.com";
    const splitName = (userProfile?.full_name ?? "Traveler").trim().split(" ");
    const nameFirst = splitName[0] ?? "Traveler";
    const nameLast = splitName.slice(1).join(" ") || "";

    const paymentParams: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      amount: toTwoDecimalPlaces(amount),
      item_name: trip.name.slice(0, 100),
      item_description: (trip.description ?? `Booking for ${trip.name}`).slice(0, 255),
      email_address: recipientEmail,
      name_first: nameFirst,
      name_last: nameLast,
      m_payment_id: bookingId,
    };

    if (startDate) {
      paymentParams.custom_str1 = startDate;
    }

    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const signature = buildPayfastSignature(paymentParams, passphrase);
    paymentParams.signature = signature;

    const payfastMode = (process.env.PAYFAST_MODE ?? PAYFAST_DEFAULT_MODE).toLowerCase();
    const payfastBaseUrl = process.env.PAYFAST_BASE_URL ?? (payfastMode === "production" ? PAYFAST_PRODUCTION_URL : PAYFAST_SANDBOX_URL);

    const query = Object.keys(paymentParams)
      .sort()
      .map((key) => `${key}=${normalisePayfastValue(paymentParams[key])}`)
      .join("&");

    const paymentUrl = `${payfastBaseUrl}?${query}`;

    return res.status(201).json({ bookingId, paymentUrl });
  } catch (error) {
    console.error("[API Error in handleCreatePayment]:", error);
    return res.status(500).json({
      message: "Error creating payment",
      error: "Internal Server Error",
    });
  }
};
