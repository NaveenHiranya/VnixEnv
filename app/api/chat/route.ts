import OpenAI from "openai";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const { prompt, userId, chatId } = await req.json();

    let currentChatId = chatId;

    // 1. CREATE CHAT if missing
    if (!currentChatId) {
      const chat = await Chat.create({
        userId,
        chatName: prompt.slice(0, 20) || "New Chat",
      });

      currentChatId = chat._id;
    }

    // 2. SAVE USER MESSAGE
    await Message.create({
      chatId: currentChatId,
      role: "user",
      message: prompt,
    });

    // 3. AI RESPONSE
    const completion = await client.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: prompt }],
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "No response generated.";

    // 4. SAVE AI MESSAGE
    const aiMessage = await Message.create({
      chatId: currentChatId,
      role: "agent",
      message: reply,
    });

    return Response.json({
      chatId: currentChatId,
      text: reply,
      agentMessageId: aiMessage._id,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}