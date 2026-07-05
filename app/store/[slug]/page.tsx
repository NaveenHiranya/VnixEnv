import { connectDB } from "@/lib/mongodb";
import { AppCreate } from "@/models/AppCreate";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectDB();

  const app = await AppCreate.findOne({ slug });

  if (!app) return notFound();

  return (
    <div dangerouslySetInnerHTML={{ __html: app.code }} />
  );
}