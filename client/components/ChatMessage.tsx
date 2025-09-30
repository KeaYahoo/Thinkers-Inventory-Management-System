import { cn } from "@/lib/utils";

export type ChatMessageProps = {
  role: "user" | "ai";
  content: string;
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg max-w-md mb-4",
        role === "ai" && "self-start bg-gray-100 text-gray-800",
        role === "user" && "self-end bg-primary-brown text-white"
      )}
    >
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}
