/**
 * useCreatePayment: creates a booking/payment session and returns the payment URL.
 */
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { PaymentResponse } from "@shared/types";

export interface CreatePaymentPayload {
  trip_id: string;
  start_date?: string;
}

export function useCreatePayment() {
  const { token, isAuthenticated } = useAuth();

  return useMutation({
    mutationKey: ["payments", "create"],
    mutationFn: async (payload: CreatePaymentPayload) => {
      if (!token || !isAuthenticated) {
        throw new Error("You must be logged in to create a payment.");
      }

      return apiFetch<PaymentResponse>("/payments", {
        method: "POST",
        token,
        body: { ...payload },
      });
    },
  });
}
