import type { RequestHandler } from "express";
import { supabase } from "../lib/supabaseClient";
import {
  mapPayfastPaymentStatus,
  normaliseIncomingIp,
  isIpWhitelisted,
  verifyPayfastSignature,
} from "../utils/payfast";
import { PaymentProvider } from "../../shared/types";

const whitelist = (process.env.PAYFAST_IP_WHITELIST ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const handlePayfastIPN: RequestHandler = async (req, res) => {
  try {
    const forwardedFor = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
    const remoteAddress = normaliseIncomingIp(forwardedFor ?? req.socket.remoteAddress ?? req.ip);

    if (!isIpWhitelisted(remoteAddress, whitelist)) {
      return res.status(403).send("Forbidden");
    }

    const rawPayload = req.body ?? {};
    const payload: Record<string, string> = {};
    Object.entries(rawPayload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        payload[key] = value.join(",");
      } else if (typeof value !== "undefined" && value !== null) {
        payload[key] = String(value);
      }
    });

    const passphrase = process.env.PAYFAST_PASSPHRASE;
    if (!verifyPayfastSignature(payload, passphrase)) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const bookingId = payload.m_payment_id;
    if (!bookingId) {
      return res.status(400).json({ message: "Missing booking reference" });
    }

    const paymentStatus = mapPayfastPaymentStatus(payload.payment_status);
    const paymentMetadata = {
      provider: PaymentProvider.PayFast,
      payment_id: payload.pf_payment_id ?? null,
      payment_status: payload.payment_status ?? null,
      amount_gross: payload.amount_gross ?? payload.amount ?? null,
      processed_at: payload.pf_payment_date ?? new Date().toISOString(),
      raw_payload: payload,
    };

    const { error } = await supabase
      .from("bookings")
      .update({
        payment_status: paymentStatus,
        payment_provider: PaymentProvider.PayFast,
        payment_metadata: paymentMetadata,
      })
      .eq("id", bookingId);

    if (error) {
      throw error;
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("[PayFast IPN Error]:", error);
    return res.status(500).send("Error");
  }
};
