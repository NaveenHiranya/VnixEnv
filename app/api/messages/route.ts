import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ messages: [] });
  }

  const messages = await Message.find({
    chatId: new mongoose.Types.ObjectId(chatId),
  }).sort({ createdAt: 1 });


  return Response.json({ messages });
}