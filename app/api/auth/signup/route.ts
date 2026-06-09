import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password } = await req.json();

  const exists = await User.findOne({ email });

  if (exists) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  const user = await User.create({ name, email, password });

  const res = NextResponse.json({
    success: true,
    message: "Account created",
  });

  res.cookies.set("userId", user._id.toString(), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}