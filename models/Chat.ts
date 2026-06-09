// models/Chat.ts
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    chatName: {
      type: String,
      default: "New Chat",
    },
  },
  { timestamps: true }
);

export const Chat =
  mongoose.models.Chat || mongoose.model("Chat", chatSchema);