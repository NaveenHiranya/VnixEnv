// models/AppCreate.ts
import mongoose from "mongoose";

const appCreateSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    appName: {
      type: String,
      default: "Untitled",
    },
    code: {
        type: String,
        default: "empty html file"
    }

  },
  { timestamps: true }
);

export const AppCreate  =
  mongoose.models.AppCreate || mongoose.model("AppCreate", appCreateSchema);