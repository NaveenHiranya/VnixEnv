"use client";

import { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { BiLike, BiDislike } from "react-icons/bi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");
  const [messages, setMessages] = useState<
    {id:string; status: string; message: string }[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (prompt === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [prompt]);

  const askGemini = async () => {
    if (!prompt.trim()) return;
    setState("sending...")
    const currentPrompt = prompt;
     setMessages((prev) => [
      ...prev,
      { id: "",
        status: "user",
        message: currentPrompt,
      },
    ]);
    setLoading(false);
    setPrompt("");

    const combinedPrompt = `${currentPrompt}`;
    setState("Analyzing search results...");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: combinedPrompt,
        }),
      });
      setState("receving...");
      

      const data = await res.json();
         

      setMessages((prev) => [
        ...prev,
        { id: data.agentMessageId,
          status: "agent",
          message: data.text,
        },
      ]);
      setState("rendering");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id:"",
          status: "agent",
          message: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (loading && prompt.trim()) {
        askGemini();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-white font-sans">
      {/* Header with Glassmorphism */}
      <header className="p-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-wide">VnixAI</h1>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center w-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-500 tracking-tight">
              Where should we begin?
            </h2>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-6 pb-24">
            {messages.map((item, index) =>
              item.status === "user" ? (
                /* User Message Bubble */
                <div key={index} className="flex justify-end w-full">
                  <div className="bg-neutral-700 text-neutral-200 rounded-3xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-md">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              ) : (
                /* Agent Response Panel (Full Width Markdown Layout) */
                <div
                  key={index}
                  className="w-full border-b border-neutral-800/60 pb-6"
                >
                  <div className="prose prose-invert max-w-none prose-pre:bg-neutral-800 prose-pre:p-4 prose-pre:rounded-xl prose-code:text-green-400 leading-relaxed tracking-wide">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.message}
                    </ReactMarkdown>
                  </div>

                  {/* Feedback Action Buttons */}
                  <div className="flex gap-3 mt-4 text-neutral-500">
                    <BiLike
                      size={18}
                      className="cursor-pointer hover:text-white transition-colors"
                    />
                    <BiDislike
                      size={18}
                      className="cursor-pointer hover:text-white transition-colors"
                    />
                  </div>
                </div>
              ),
            )}

            {/* Typing Loader Element */}
            {!loading && (
              <div>
                <div className="flex gap-1.5 py-4 items-center">
                  <div
                    className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <div>{state}</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area Bar (Sticky Bottom Container with Premium Top Blur Glassmorphism) */}
      <div className="w-full sticky bottom-0 p-4 pt-6 bg-neutral-900/70 backdrop-blur-xl border-t border-neutral-800/60 z-10">
        <div className="max-w-3xl mx-auto flex items-end bg-neutral-800 rounded-3xl p-2 border border-neutral-700 focus-within:border-neutral-500 focus-within:ring-4 focus-within:ring-neutral-800/40 transition-all shadow-2xl">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent outline-none resize-none px-4 py-3 max-h-[200px] text-white placeholder-neutral-400"
          />

          <button
            disabled={!loading || !prompt.trim()}
            onClick={askGemini}
            className={`p-3 rounded-full transition-all duration-200 shadow-md ${
              loading && prompt.trim()
                ? "bg-white text-black hover:bg-neutral-200 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
            }`}
          >
            <IoSend
              size={20}
              className={loading && prompt.trim() ? "ml-0.5" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
