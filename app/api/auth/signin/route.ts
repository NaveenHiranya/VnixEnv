import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  if (user.password !== password) {
    return NextResponse.json(
      { message: "Wrong password" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Login successful",
    user,
  });
}