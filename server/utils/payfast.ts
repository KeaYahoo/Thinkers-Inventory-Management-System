import crypto from "crypto";
import { PaymentStatus } from "../../shared/types";

export const PAYFAST_SANDBOX_URL = "https://sandbox.payfast.co.za/eng/process";
export const PAYFAST_PRODUCTION_URL = "https://www.payfast.co.za/eng/process";

export function normalisePayfastValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export function buildPayfastSignature(params: Record<string, string>, passphrase?: string): string {
  const pairs = Object.keys(params)
    .filter((key) => typeof params[key] !== "undefined" && params[key] !== null)
    .sort()
    .map((key) => `${key}=${normalisePayfastValue(String(params[key]))}`);

  let signaturePayload = pairs.join("&");
  if (passphrase) {
    signaturePayload += `&passphrase=${normalisePayfastValue(passphrase)}`;
  }

  return crypto.createHash("md5").update(signaturePayload).digest("hex");
}

export function verifyPayfastSignature(payload: Record<string, string>, passphrase?: string): boolean {
  const { signature, ...rest } = payload;
  if (!signature) {
    return false;
  }
  const expected = buildPayfastSignature(rest, passphrase);
  return signature.toLowerCase() === expected.toLowerCase();
}

export function mapPayfastPaymentStatus(status?: string): PaymentStatus {
  switch ((status ?? "").toUpperCase()) {
    case "COMPLETE":
      return PaymentStatus.Paid;
    case "FAILED":
    case "CANCELLED":
      return PaymentStatus.Failed;
    default:
      return PaymentStatus.Pending;
  }
}

export function normaliseIncomingIp(ip?: string | null): string | undefined {
  if (!ip) {
    return undefined;
  }
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

export function isIpWhitelisted(ip: string | undefined, whitelist: string[]): boolean {
  if (!whitelist.length) {
    return true;
  }
  if (!ip) {
    return false;
  }
  return whitelist.includes(ip);
}
