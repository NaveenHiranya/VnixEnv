"use client";

import { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  message: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!isSending && prompt.trim()) {
        sendMessage();
      }
    }
  };

  const sendMessage = async () => {
    if (!prompt.trim() || isSending) return;

    const currentPrompt = prompt;

    // Show user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        message: currentPrompt,
      },
    ]);

    setPrompt("");
    setIsSending(true);

    try {
      const res = await fetch("/api/createapp/identifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      if (data.isProgram) {
        console.log("Generate app...");
        console.log(data.message);

        appGenerator(currentPrompt);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            message: data.message,
          },
        ]);
      }
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: "Something went wrong.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const appGenerator = async (prompt:string) => {
    console.log("working",prompt);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="p-4 border-b border-neutral-800 bg-neutral-900">
        <h1 className="text-xl font-bold">ALoHa</h1>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-3xl text-neutral-500">
              Where should we begin?
            </h2>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto mb-4">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === "user" ? "bg-blue-600" : "bg-neutral-800"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.message}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end bg-neutral-800 rounded-3xl p-2 border border-neutral-700">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent outline-none resize-none px-4 py-3 max-h-52 text-white placeholder-neutral-400"
          />

          <button
            disabled={isSending || !prompt.trim()}
            onClick={sendMessage}
            className={`p-3 rounded-full transition ${
              !isSending && prompt.trim()
                ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
            }`}
          >
            <IoSend size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
