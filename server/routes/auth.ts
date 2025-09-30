/**
 * Security Update: Removed hard-coded JWT secret fallback so tokens always rely on the operator-provided JWT_SECRET.
 * This change ensures authentication integrity and complements the server fail-fast requirement for missing secrets.
 */
import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterUserSchema } from "../../shared/types";
import { supabase } from "../lib/supabaseClient";

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    // 1. Validate the request body
    const validatedBody = RegisterUserSchema.parse(req.body);
    const { email, password } = validatedBody;

    // 2. Check if user already exists
    const { data: existingUsers, error: selectError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);
    if (selectError) throw selectError;
    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save the new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ email, password_hash: hashedPassword })
      .select('id')
      .single();
    if (insertError) throw insertError;
    if (!newUser) throw new Error('User creation failed.');

    // 5. Create a JWT token for the new user session
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    // 6. Send a success response with the token
    res.status(201).json({ message: "User registered successfully", token });
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

    // Find user in Supabase
    const { data: users, error: getError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('email', email)
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

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error('[API Error in handleLogin]:', error);
    res.status(500).json({ message: "Server error" });
  }
};
