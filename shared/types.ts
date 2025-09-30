/**
 * Shared types: expose Trip.start_date for time-aware features and extend user profiles with optional name/avatar fields.
 */
import { z } from "zod";

export const RegisterUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

export interface Destination {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  created_at: string;
}

export interface Trip {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  image_url: string;
  start_date: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

export interface TripAvailability {
  start_date: string;
  price: number;
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  created_at: string;
  trips: Trip;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  trip_id: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user_id: string;
  trip_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface PaymentResponse {
  bookingId: string;
  paymentUrl: string;
}

