/**
 * Authentication Routes: manages registration and login with role-aware JWT payloads.
 */
import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterUserSchema } from "../../shared/types";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase();
const JWT_SECRET = process.env.JWT_SECRET as string | undefined;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in the environment variables.");
}

type UserRole = "admin" | "user";

type JwtPayload = {
  userId: string | number;
  role: UserRole;
};

const determineRole = (email: string): UserRole => {
  if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL) {
    return "admin";
  }
  return "user";
};

const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, JWT_SECRET as string, { expiresIn: "7d" });

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const validatedBody = RegisterUserSchema.parse(req.body);
    const { email, password } = validatedBody;

    const { data: existingUsers, error: selectError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email);
    if (selectError) throw selectError;
    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ email, password_hash: hashedPassword })
      .select("id")
      .single();
    if (insertError) throw insertError;
    if (!newUser) throw new Error("User creation failed.");

    const role = determineRole(email);
    const token = signToken({ userId: newUser.id, role });

    res.status(201).json({ message: "User registered successfully", token, role });
  } catch (error) {
    console.error('[API Error in handleRegister]:', error);
    res.status(400).json({ message: "Invalid input", details: error });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const { data: users, error: getError } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("email", email)
      .limit(1);
    if (getError) throw getError;
    const user = users && users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash as string);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const role = determineRole(email);
    const token = signToken({ userId: user.id, role });

    res.status(200).json({ message: "Login successful", token, role });
  } catch (error) {
    console.error('[API Error in handleLogin]:', error);
    res.status(500).json({ message: "Server error" });
  }
};
