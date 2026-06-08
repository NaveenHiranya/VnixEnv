import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server"; // Using Next.js native response object

// 1. Initialize outside the handler so the instance is reused across requests
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    // 2. Input Validation: Ensure prompt exists before calling the API
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "A valid prompt is required." },
        { status: 400 }
      );
    }

    // 3. API Call
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    // 4. Successful Response
    return NextResponse.json({
      text: response.text,
    });

  } catch (error: any) {
    console.error("Gemini API Error details:", error);

    // Extract status and message from the error object
    const status = error?.status || error?.response?.status || 500;
    const errorMessage = error?.message || "An unexpected error occurred.";

    // 5. Granular Error Catching

    // Check for Rate Limit / Quota Exceeded
    if (status === 429 || errorMessage.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { error: "API quota exceeded. Please check your billing details or try again later." },
        { status: 429 }
      );
    }

    // Check for Invalid/Missing API Key
    if (status === 400 || status === 403 || errorMessage.toLowerCase().includes("api key")) {
      return NextResponse.json(
        { error: "Authentication failed. Please verify your Gemini API key." },
        { status: 401 }
      );
    }

    // Default catch-all: Pass the actual error message back to the client
    return NextResponse.json(
      { error: errorMessage },
      { status: status }
    );
  }
}