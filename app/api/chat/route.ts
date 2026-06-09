import { GoogleGenAI } from "@google/genai";
import mongoose from 'mongoose';
import { Message } from '@/models/Message'; // Adjust this import path as needed

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Helper function to manage serverless database connections
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    // 1. Ensure DB connection is established
    await connectToDatabase();

    const { prompt } = await req.json();

    // 2. Save the User's message to MongoDB
    const userMessage = await Message.create({
      role: 'user',
      message: prompt,
      state: 'none'
    });

    // 3. Generate response from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const agentText = response.text || "I'm sorry, I couldn't generate a response.";

    // 4. Save the Agent's message to MongoDB
    const agentMessage = await Message.create({
      role: 'agent',
      message: agentText,
      state: 'none'
    });

    // 5. Return the text AND the new database IDs to the client front-end
    return Response.json({
      text: agentText,
      userMessageId: userMessage._id,
      agentMessageId: agentMessage._id,
    });

  } catch (error) {
    console.error("API Route Error:", error);

    return Response.json(
      { error: "Failed to generate response or save to database." },
      { status: 500 }
    );
  }
}