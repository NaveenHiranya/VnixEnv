import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { messageId, state } = await req.json();

    if (!messageId || !state) {
      return Response.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { state },
      { new: true }
    );

    return Response.json({
      success: true,
      message: updated,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}