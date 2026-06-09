import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectDB();

  const cookieStore = await cookies();  

  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json({ user: null });
  }

  const user = await User.findById(userId);

  return Response.json({
    user: user
      ? {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        }
      : null,
  });
}