"use client";

import { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import loadingSvg from "@/public/circle-fade2.svg";
import Image from "next/image";
import Header from "../components/header";
import ArrayEditor from "../components/ArrayEditor";

interface AppData {
  isDev: boolean;
  appName: string;
  appDescription: string;
  message: string;
  features: string[];
  pages: string[];
  components: string[];
  uiSuggestions: string[];
  technicalNotes: string[];
}

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
  const [formOn, setFormOn] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);

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

    setMessages((prev) => [...prev, { role: "user", message: currentPrompt }]);

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
        setAppData(app);
        setFormOn(true);

        setLoading(false);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", message: app.message },
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

  const installApp = async () => {
    try {
      setLoading(true);
      setState("Installing....")

      const res = await fetch("/api/appcreate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "12345",
          appName: appData?.appName,
          code: generatedCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState(data.message || "Error Installing app");
        // alert(data.message || "Error creating app");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", message: "Error Installing application" },
        ]);
        return;
      }

      setState(data.message); // "App created"
      setMessages((prev) => [
          ...prev,
          { role: "assistant", message: data.message },
        ]);
      console.log("Saved:", data);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
          ...prev,
          { role: "assistant", message: "Something went wrong" },
        ]);
    } finally {
      setLoading(false);
    }
  };

  const codeGenerator = async (prompt: String) => {
    setLoading(true);
    setGenerated(true);
    setState("Developing application");

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

  function buildPrompt(data: AppData) {
    return `
Application Name:
${data.appName}

Description:
${data.appDescription}

Features:
${data.features.map((f) => `- ${f}`).join("\n")}

Pages:
${data.pages.map((p) => `- ${p}`).join("\n")}

Components:
${data.components.map((c) => `- ${c}`).join("\n")}

UI Suggestions:
${data.uiSuggestions.map((u) => `- ${u}`).join("\n")}

Technical Notes:
${data.technicalNotes.map((t) => `- ${t}`).join("\n")}
`.trim();
  }

const handleSubmit = async () => {
  if (!appData) return;
  setFormOn(false);

  const prompt = buildPrompt(appData);

  codeGenerator(prompt);
};

  return (
    <div className="w-full h-screen flex flex-col text-white bg-linear-to-br from-black to-blue-900">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center relative">
            <h2 className="text-2xl text-neutral-100">
              Lets build your application !
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
                    m.role === "user" ? "bg-blue-600" : "bg-neutral-800"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.message}
                  </ReactMarkdown>
                </div>
              </div>
            ))}


            <div className={`${formOn ? "static": "hidden"} text-white bg-neutral-800 p-4 rounded-2xl`}>
              {appData && (
                <>
                  <p className="font-bold text-xl">Name:</p>
                  <input
                    className="border my-1 p-2 rounded-2xl"
                    value={appData.appName}
                    onChange={(e) =>
                      setAppData({
                        ...appData,
                        appName: e.target.value,
                      })
                    }
                  />
                  <p className="font-bold text-xl">Description</p>
                  <textarea
                    className="w-full outline-none border rounded-2xl p-2"
                    value={appData.appDescription}
                    onChange={(e) =>
                      setAppData({
                        ...appData,
                        appDescription: e.target.value,
                      })
                    }
                  />

                  <ArrayEditor
                    title="Features"
                    items={appData.features}
                    onChange={(features) =>
                      setAppData({ ...appData, features })
                    }
                  />

                  <ArrayEditor
                    title="Pages"
                    items={appData.pages}
                    onChange={(pages) => setAppData({ ...appData, pages })}
                  />

                  <ArrayEditor
                    title="Components"
                    items={appData.components}
                    onChange={(components) =>
                      setAppData({ ...appData, components })
                    }
                  />

                  <ArrayEditor
                    title="UI Suggestions"
                    items={appData.uiSuggestions}
                    onChange={(uiSuggestions) =>
                      setAppData({ ...appData, uiSuggestions })
                    }
                  />

                  <ArrayEditor
                    title="Technical Notes"
                    items={appData.technicalNotes}
                    onChange={(technicalNotes) =>
                      setAppData({ ...appData, technicalNotes })
                    }
                  />

                  <button onClick={handleSubmit} disabled={!generated && loading} className={`font-bold p-2 px-3 cursor-pointer rounded-xl bg-green-600 ${loading || generated ? "hidden": ""}`}>Submit</button>
                </>
              )}
            </div>

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

            {/* Loading indicator */}
            {loading  && (
              <div className="ml-2 flex items-center gap-2 text-white">
                <Image alt="loading" width={20} height={20} src={loadingSvg} />
                <span className="text-sm text-neutral-300">{state}</span>
              </div>
            )}

            {generated &&  generatedCode && (<div className="bg-neutral-600 flex gap-4 items-center p-3 rounded-2xl">
              <p>After Installing application It will appear in home screen draft list</p>
              <button onClick={installApp} className="bg-green-400 text-white font-bold p-1 px-3 rounded-xl cursor-pointer">Install</button>
            </div>)}


          </div>
        )}
      </main>

      {/* INPUT */}
      <div className="shrink-0 m-3">
        <div className="flex bg-neutral-900 rounded-3xl p-2 border border-neutral-700">
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
