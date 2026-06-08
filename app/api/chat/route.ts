import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are VnixAI. Provide clear answers formatted using standard Markdown.",
      },
    });

    return Response.json({
      text: response.text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to generate response.",
      },
      {
        status: 500,
      }
    );
  }
}