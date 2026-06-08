"use client";

import { useState,useEffect } from "react";
import { useRef } from "react";
import { IoSend } from "react-icons/io5";
// import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { BiLike, BiDislike } from "react-icons/bi";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<
    { status: string; message: string }[]
  >([]);

  //scroll controller
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //gemini api call
  const askGemini = async () => {
    if (prompt != "") {
      setLoading(false);
      setPrompt("");
      setMessages((messages) => [
        ...messages,
        { status: "user", message: prompt },
      ]);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setMessages((messages) => [
        ...messages,
        { status: "agent", message: data.text },
      ]);

      setAnswer(data.text);
      setLoading(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-neutral-700 p-3">
        <h2 className="font-bold text-white">VnixAI</h2>
      </div>
      <main className={`flex flex-col ${messages.length === 0 ? "justify-center": ""} p-4 pt-0 items-center bg-black text-white h-full border`}>
        <div>
          {messages.length === 0 ? (
            <div className="w-full flex items-center justify-center h-full">
              <p className="font-semibold text-2xl md:text-3xl lg:text-4xl text-wrap">
                Where should we begin?
              </p>
            </div>
          ) : (
            ""
          )}
        </div>
        <div
          className={`${messages.length === 0 ? "hidden" : "flex"} flex-col gap-1 w-full relative max-w-2xl pt-3 h-160 overflow-y-auto scrollbar-hide`}
        >
          {messages.map((item, index) =>
            item.status === "agent" ? (
              <div className="p-3" key={index}>
                <p>{item.message}</p>
                <div className="flex gap-2">
                  <BiLike className="cursor-pointer" />
                  <BiDislike className="cursor-pointer" />
                </div>
              </div>
            ) : (
              <div
                className="bg-neutral-600 flex flex-col rounded-3xl ml-auto w-[80%] p-4"
                key={index}
              >
                <p>{item.message}</p>
              </div>
            ),
          )}
          <div className={`${!loading ? "flex": "hidden"}`}>...</div>
          <div ref={messagesEndRef} />
        </div>
        <div
          className={`flex items-center justify-center ${messages.length === 0 ? "" : "mb-3"}  w-full`}
        >
          <div className="mt-4 bg-neutral-800  w-full flex justify-center items-center mx-4 p-3 rounded-3xl max-w-2xl">
            <input
              
              className="w-full h-full text-xl text-blue-50 outline-none"
              type="text"
              placeholder="what's on your mind ?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && loading) {
                  askGemini();
                }
              }}
            ></input>
            <button
              className="mx-2 p-2 cursor-pointer bg-white font-bold  text-black rounded-full"
              onClick={() => {
                if(loading)
                askGemini();
              }}
            >
              <IoSend />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
