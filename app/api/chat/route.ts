import OpenAI from "openai";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const models = [
  "deepseek-ai/deepseek-v4-pro",
  "google/gemma-4-31b-it",
  "meta/llama-3.3-70b-instruct",
];

export async function POST(req: Request) {
  try {
    await connectDB();

    const { prompt, userId, chatId, modelId } = await req.json();

    const index = Number(modelId);

    if (!models[index]) {
      return Response.json(
        { error: "Invalid model." },
        { status: 400 }
      );
    }

    let currentChatId = chatId;

    // Create new chat if needed
    if (!currentChatId) {
      const chat = await Chat.create({
        userId,
        chatName: prompt.slice(0, 20) || "New Chat",
      });

      currentChatId = chat._id;
    }

    // Save user message
    await Message.create({
      chatId: currentChatId,
      role: "user",
      message: prompt,
    });

    // Measure AI response time
    console.time("AI");

    const completion = await client.chat.completions.create({
      model: models[index],
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 512,
    });

    console.timeEnd("AI");

    const reply =
      completion.choices[0]?.message?.content ??
      "No response generated.";

    // Save AI message in background
    Message.create({
      chatId: currentChatId,
      role: "agent",
      message: reply,
    }).catch(console.error);

    return Response.json({
      chatId: currentChatId,
      text: reply,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}