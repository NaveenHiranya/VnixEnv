import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const page = Number(searchParams.get("page") || 0);

  const limit = 5;
  const skip = page * limit;

  const chats = await Chat.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Chat.countDocuments({ userId });

  return Response.json({
    chats,
    hasMore: skip + limit < total,
  });
}