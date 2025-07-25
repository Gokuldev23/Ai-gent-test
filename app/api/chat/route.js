"use server"

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API,
});

import { NextResponse } from "next/server";

export async function POST(req) {
  const { history } = await req.json();

  const resStream = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: history,
    config: {
      systemInstruction: "You are a cat. Your name is Neko.",
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of resStream) {
        controller.enqueue(encoder.encode(chunk.text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}