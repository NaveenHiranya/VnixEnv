"use client";

import { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { BiLike, BiDislike } from "react-icons/bi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [leftNavBarV, setLeftNavBar] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; status: string; message: string }[]
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
    const loadUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setUser(null);
      }
    };

    loadUser();
  }, []);
  useEffect(() => {
    if (user?.id) loadChats(0);
  }, [user]);

  useEffect(() => {
    if (prompt === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [prompt]);

  const askGemini = async () => {
    if (!prompt.trim()) return;
    setState("sending...");
    const currentPrompt = prompt;
    setMessages((prev) => [
      ...prev,
      { id: "", status: "user", message: currentPrompt },
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
          userId: user?.id,
          chatId: chatId,
        }),
      });
      setState("receving...");

      const data = await res.json();
      if (!chatId) {
        setChatId(data.chatId);
      }
      setMessages((prev) => [
        ...prev,
        { id: data.agentMessageId, status: "agent", message: data.text },
      ]);
      setState("rendering");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: "", status: "agent", message: "Something went wrong." },
      ]);
    } finally {
      setLoading(true);
    }
  };

  const NewChat = () => {
    setChatId(null);
    setMessages([]);
  };
  const leftNavBar = () => {
    setLeftNavBar(!leftNavBarV);
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

  const refreshChats = async () => {
    if (!user?.id) return;

    setPage(0);
    setChats([]);
    setHasMore(true);

    const res = await fetch(`/api/chats?userId=${user.id}&page=0`);
    const data = await res.json();

    setChats(data.chats);
    setHasMore(data.hasMore);
    setPage(1);
  };
  const loadChats = async (nextPage?: number) => {
    if (!user?.id) return;

    const pageToLoad = nextPage ?? page;

    const res = await fetch(`/api/chats?userId=${user.id}&page=${pageToLoad}`);

    const data = await res.json();

    if (pageToLoad === 0) {
      setChats(data.chats);
    } else {
      setChats((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const newChats = data.chats.filter((c: any) => !existingIds.has(c._id));
        return [...prev, ...newChats];
      });
    }

    setHasMore(data.hasMore);
    setPage(pageToLoad + 1);
  };
  const openChat = async (id: string) => {
    setChatId(id);

    const res = await fetch(`/api/messages?chatId=${id}`);
    const data = await res.json();
    console.log("MESSAGES API RESULT:", data);

    setMessages(
      data.messages.map((m: any) => ({
        id: m._id,
        status: m.role,
        message: m.message,
      })),
    );
  };

  return (
    // Added overflow-hidden to the root to prevent any accidental body scrolling
    <div className="h-screen flex flex-col bg-neutral-900 text-white font-sans overflow-hidden">
      {/* Header with Glassmorphism */}
      <header className="p-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md z-10 shrink-0">
        <h1 className="text-xl font-bold tracking-wide">VnixAI</h1>
      </header>

      {/* Replaced h-full with flex-1 flex flex-col overflow-hidden */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* subHeader */}
        <div className="flex shrink-0 p-2">
          <button onClick={leftNavBar} className="border px-3 py-1 rounded">
            <p>x</p>
          </button>
          <button
            onClick={NewChat}
            className="ml-2 border px-3 py-1 rounded bg-white text-black"
          >
            New Chat
          </button>
        </div>

        {/* Replaced h-full with flex-1 to fill remaining space perfectly */}
        <div className="flex-1 flex border overflow-hidden">
          {/* left menu*/}
          <div className="flex flex-col relative shrink-0">
            <div
              className={`w-40 absolute ${
                leftNavBarV ? "hidden" : "flex"
              } flex-col bg-black h-full z-[100]`}
            >
              <div className="w-full h-full flex flex-col justify-between pb-4 px-2 py-1 border-b border-b-neutral-700">
                <div>
                  <p className="font-bold mb-2">Chats</p>

                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={refreshChats}
                      className="border px-2 py-1 rounded text-sm bg-white text-black"
                    >
                      Refresh
                    </button>

                    <button
                      onClick={() => loadChats(page)}
                      className="border px-2 py-1 rounded text-sm"
                      disabled={!hasMore}
                    >
                      Load more
                    </button>
                  </div>

                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <button
                        key={chat._id}
                        onClick={() => openChat(chat._id)}
                        className="w-full text-left border p-2 rounded hover:bg-neutral-800"
                      >
                        {chat.chatName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border p-2 rounded-2xl">
                  <Link href="/login">{user ? user.name : "Sign"}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* chatSpace with input field */}
          {/* Removed fixed heights, added flex-1 */}
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center w-full">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <h2 className="text-2xl md:text-3xl font-semibold text-neutral-500 tracking-tight">
                    Where should we begin?
                  </h2>
                </div>
              ) : (
                // Removed pb-24 because flex layout handles spacing naturally now
                <div className="w-full max-w-3xl space-y-6">
                  {messages.map((item, index) =>
                    item.status === "user" ? (
                      /* User Message Bubble */
                      <div key={index} className="flex justify-end w-full">
                        <div className="bg-neutral-700 text-neutral-200 rounded-3xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-md">
                          <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Agent Response Panel */
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
                      <div className="text-sm text-neutral-500">{state}</div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </main>

            {/* Input Area Bar */}
            {/* Removed sticky bottom-0, changed to shrink-0 so it naturally sits at the bottom of the flex container */}
            <div className="w-full p-4 pt-4 bg-neutral-900/70 backdrop-blur-xl border-t border-neutral-800/60 z-10 shrink-0">
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
        </div>
      </div>
    </div>
  );
}
