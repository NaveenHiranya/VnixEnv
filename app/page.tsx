"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  const askGemini = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    setAnswer(data.text);
  };

  return (
    <main style={{ padding: 20 }}>
      <textarea
        rows={5}
        cols={60}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <br />

      <button onClick={askGemini}>
        Ask Gemini
      </button>

      <h2>Response</h2>

      <p>{answer}</p>
    </main>
  );
}