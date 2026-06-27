import OpenAI from "openai";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // Required by SDK, can be any string
});

const models = [
  "qwen2.5-coder",
];

export async function POST(req: Request) {
  try {
    await connectDB();

    const { prompt, userId, chatId, modelId = 0 } = await req.json();

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

    console.time("AI");

    const completion = await client.chat.completions.create({
      model: models[index],
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineer. Write clean, production-ready code with explanations when needed.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    });

    console.timeEnd("AI");

    const reply =
      completion.choices?.[0]?.message?.content ??
      "No response generated.";

    // Save AI message
    await Message.create({
      chatId: currentChatId,
      role: "agent",
      message: reply,
    });

    return Response.json({
      chatId: currentChatId,
      text: reply,
    });

  } catch (error) {
    console.error("Ollama Error:", error);

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