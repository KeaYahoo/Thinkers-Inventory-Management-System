/**
 * UX Consistency: Ensured the AI Planner page uses the shared header and footer for consistent navigation.
 */
import ChatMessage from "@/components/ChatMessage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useRef, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || isSending) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((curr) => [...curr, userMessage]);
    setInput("");

    try {
      setIsSending(true);
      const response = await apiFetch<Response>("/chat", {
        method: "POST",
        body: {
          messages: [...messages, userMessage].map((message) => ({
            role: message.role === "ai" ? "assistant" : "user",
            content: message.content,
          })),
        },
        rawResponse: true,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiAccumulated = "";

      setMessages((curr) => [...curr, { role: "ai", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiAccumulated += decoder.decode(value, { stream: true });
        setMessages((curr) => {
          const copy = [...curr];
          const lastIndex = copy.length - 1;
          copy[lastIndex] = { role: "ai", content: aiAccumulated };
          return copy;
        });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      setMessages((curr) => [...curr, { role: "ai", content: message }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <Seo
        title="AI trip planner"
        description="Chat with the Trvlsync planner to build itineraries, uncover hidden gems, and tailor your South African adventure."
      />
      <Header />
      <main aria-labelledby="planner-heading">
        <div className="px-6 pt-32 pb-12 text-center">
          <h1 id="planner-heading" className="text-4xl font-light text-gray-900 lg:text-5xl">
            AI trip planner
          </h1>
          <p className="mt-3 text-gray-600">
            Ask for inspiration, sample itineraries, or budget-friendly activities and we will generate ideas instantly.
          </p>
        </div>

        <div className="mx-auto flex h-[70vh] max-w-4xl flex-col rounded-xl border bg-white" role="region" aria-label="AI planner conversation">
          <div
            className="flex flex-1 flex-col overflow-y-auto p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-4 border-t p-4" aria-label="Send a new prompt">
            <div className="flex-grow space-y-1">
              <Label htmlFor="planner-input" className="sr-only">
                Ask the planner a question
              </Label>
              <Input
                id="planner-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about destinations, activities, or prices..."
                className="flex-grow"
                disabled={isSending}
                aria-describedby="planner-helper-text"
              />
              <p id="planner-helper-text" className="sr-only">
                Press Enter or select Send to submit your question to the planner.
              </p>
            </div>
            <Button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2"
              aria-label={isSending ? "Sending message" : "Send message"}
            >
              <PaperAirplaneIcon className="h-4 w-4" aria-hidden />
              Send
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
