"use client";

import React, { useState } from "react";
import { ai } from "./geminiAi";
import { getAiResponse } from "./api/chat/route";

export default function Home() {
  const [history, setHistory] = useState([
    { role: "user", parts: [{ text: "Hi there" }] },
  ]);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // ...existing code...
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newHistory = [...history, { role: "user", parts: [{ text: input }] }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });

      const reader = res.body.getReader();
      let fullResponse = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value);
        setResponse(fullResponse); // Stream to UI
      }

      setHistory([
        ...newHistory,
        { role: "model", parts: [{ text: fullResponse }] },
      ]);
    } catch (err) {
      setResponse("Error: " + err.message);
    }
    setLoading(false);
  };
  // ...existing code...

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Chat with Neko 🐾</h2>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          {history.map((msg, idx) => (
            <div key={idx} style={{ margin: "8px 0" }}>
              <b>{msg.role === "user" ? "You" : "Neko"}:</b> {msg.parts[0].text}
            </div>
          ))}
          {loading && (
            <div style={{ margin: "8px 0", color: "purple" }}>
              <b>Neko:</b> {response || <i>Thinking...</i>}
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "80%", padding: 8 }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{ padding: 8 }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
