import OpenAI from "openai";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const { prompt } = await req.json();

    const userMessage = await Message.create({
      role: "user",
      message: prompt,
      state: "none",
    });

    const completion = await client.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const agentText =
      completion.choices[0]?.message?.content ??
      "I couldn't generate a response.";

    const agentMessage = await Message.create({
      role: "agent",
      message: agentText,
      state: "none",
    });

    return Response.json({
      text: agentText,
      userMessageId: userMessage._id,
      agentMessageId: agentMessage._id,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}