// models/Message.ts
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "agent"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      enum: ["liked", "disliked", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);