/**
 * UX Consistency: Ensured the AI Planner page uses the shared header and footer for consistent navigation.
 */
import ChatMessage from "@/components/ChatMessage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useRef, useEffect, useState } from "react";

type Message = { role: "user" | "ai"; content: string };

export default function Tours() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hello! I'm your Trvlsync planner. Where in South Africa are you dreaming of exploring? You can ask for ideas, like 'What are the best weekend trips from Johannesburg?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((curr) => [...curr, userMessage]);
    setInput("");

    try {
      setIsSending(true);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiAccum = "";

      setMessages((curr) => [...curr, { role: "ai", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiAccum += decoder.decode(value, { stream: true });
        setMessages((curr) => {
          const copy = [...curr];
          // Replace last message content as it streams
          const lastIdx = copy.length - 1;
          copy[lastIdx] = { role: "ai", content: aiAccum };
          return copy;
        });
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <div className="pt-32 pb-12 px-6 text-center">
          <h1 className="font-light text-4xl lg:text-5xl text-gray-900">AI Trip Planner</h1>
        </div>

        <div className="max-w-4xl mx-auto border rounded-lg h-[70vh] flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 flex flex-col">
            {messages.map((m, idx) => (
              <ChatMessage key={idx} role={m.role} content={m.content} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t p-4 flex items-center gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about destinations, activities, or prices..."
              className="flex-grow bg-gray-100 p-2 rounded-lg outline-none"
            />
            <button
              type="submit"
              disabled={isSending}
              className="bg-primary-brown text-white px-4 py-2 rounded-lg hover:bg-brown-dark flex items-center gap-2 disabled:opacity-60"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
