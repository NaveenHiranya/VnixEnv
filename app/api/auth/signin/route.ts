import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
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

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    res.cookies.set("userId", user._id.toString(), {
      httpOnly: true,
      path: "/settings",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}