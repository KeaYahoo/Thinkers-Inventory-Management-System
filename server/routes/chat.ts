import type { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      res.status(500).json({ error: "GOOGLE_API_KEY is missing. Add it to .env and restart the server." });
      return;
    }

    const { messages } = req.body as { messages: Array<{ role: string; content: string }> };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // System prompt for Trvlsync persona
    const systemPrompt =
      "You are Trvlsync, a friendly and expert South African travel planner. Your goal is to help users discover and plan trips within South Africa. You should be enthusiastic, knowledgeable, and helpful. Always keep your responses concise and focused on travel planning in South Africa.";

    // Gemini chat contents format
    const fullPrompt = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood! I'm ready to help plan an amazing South African adventure." }] },
      ...messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    // Start streaming response
    const streamResp = await model.generateContentStream({ contents: fullPrompt });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    for await (const chunk of streamResp.stream) {
      const piece = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (piece) res.write(piece);
    }

    res.end();
  } catch (err: any) {
    console.error('[API Error in handleChat]:', err);
    res.status(500).json({ error: err?.message ?? "Unknown error" });
  }
};
