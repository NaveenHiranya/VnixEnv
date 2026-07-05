import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AppCreate } from "@/models/AppCreate";

export async function POST(req: Request) {
  await connectDB();

  const { userId, appName, code } = await req.json();

  const exists = await AppCreate.findOne({ appName });

  if (exists) {
    return NextResponse.json(
      { message: "App name already exists" },
      { status: 400 }
    );
  }

  const slug = appName.toLowerCase().replace(/\s+/g, "-");

  const appCreate = await AppCreate.create({
    userId,
    appName,
    slug,
    code,
  });

  console.log("created", appCreate);

  return NextResponse.json({
    success: true,
    message: "App created",
  });
}

export async function GET() {
  await connectDB();

  const apps = await AppCreate.find({});

  return NextResponse.json(apps);
}