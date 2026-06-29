"use client";

import { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import loadingSvg from "@/public/circle-fade2.svg";
import Image from "next/image";
import Header from "../components/header";

type Message = {
  role: "user" | "assistant";
  message: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [generated, setGenerated] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSending && prompt.trim()) sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!prompt.trim() || isSending) return;

    const currentPrompt = prompt;

    setIsSending(true);
    setLoading(true);
    setState("Sending...");

    setMessages((prev) => [
      ...prev,
      { role: "user", message: currentPrompt },
    ]);

    setPrompt("");

    try {
      setState("Understanding content...");

      const res = await fetch("/api/createapp/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      if (!res.ok) throw new Error("Request failed");

      const app = await res.json();

      if (app.isDev) {
        // setState("Objective: " + data.message);
        console.log(app);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", message: app.appDescription },
        ]);
        setLoading(false);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", message: app.appDescription },
        ]);

        setState("Describe your application clearly...");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: "Something went wrong." },
      ]);

      setState("Error: model not responded correctly.");
      setLoading(false);
    } finally {
      setIsSending(false);
    }
  };

  const appGenerator = async (prompt: string) => {
    setLoading(true);
    setState("Improving prompt...");

    try {
      const res = await fetch("/api/createapp/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();

      if (data.isWebApplication) {
        setState("Understanding application: " + data.shortDescription);
        await codeGenerator(data);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", message: data.message },
        ]);

        setState("This model supports only web applications yet.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: "Something went wrong." },
      ]);

      setState("Error: feature model failed.");
      setLoading(false);
    }
  };

  const codeGenerator = async (prompt: {
    isWebApplication: boolean;
    appName: string;
    features: string;
  }) => {
    setLoading(true);
    setGenerated(true);
    setState("Developing: " + prompt.appName);

    try {
      const res = await fetch("/api/createapp/creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
      });

      if (!res.ok) throw new Error("Request failed");

      const html = await res.text();

      setGeneratedCode(html);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: "Application generated successfully.",
        },
      ]);

      setState("App generated successfully");
    } catch (err) {
      console.error(err);

      setGenerated(false);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: "Something went wrong." },
      ]);

      setState("Error: code generation failed.");
    } finally {
      setLoading(false);
      setIsSending(false);
    }
  };

  return (
    <div className="border border-white w-full h-screen flex flex-col text-white">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-2xl text-neutral-500">
              I'm here to help you create your application...
            </h2>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-blue-600"
                      : "bg-neutral-800"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.message}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="ml-2 flex items-center gap-2 text-white">
                <Image
                  alt="loading"
                  width={20}
                  height={20}
                  src={loadingSvg}
                />
                <span className="text-sm text-neutral-300">{state}</span>
              </div>
            )}

            {/* PREVIEW PANEL (IMPROVED IFRAME) */}
            {generated && generatedCode && (
              <div className="w-full mt-4 border border-neutral-700 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 text-sm text-white">
                  <span>Live Preview</span>
                  <button
                    onClick={() => {
                      setGenerated(false);
                      setGeneratedCode("");
                    }}
                    className="text-neutral-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <iframe
                  srcDoc={generatedCode}
                  sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                  className="w-full min-h-[500px] h-[60vh]"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* INPUT */}
      <div className="shrink-0 m-3">
        <div className="flex bg-neutral-800 rounded-3xl p-2 border border-neutral-700">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="build an application for..."
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
      </div>
    </div>
  );
}