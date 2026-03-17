"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Input } from "./ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "./ui/button";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type UIMessage } from "@ai-sdk/react";
import Loader from "./Loader";

type Props = {
  chatId: string;
};

// Inner component — only mounts once initialMessages is available,
// so useChat is seeded with real data and never starts with an empty array.
const ChatInner = ({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages: UIMessage[];
}) => {
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { chatId },
    }),
    messages: initialMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col relative min-h-screen max-h-screen overflow-auto bg-transparent"
      id="message-container"
    >
      <div className="sticky top-0 inset-x-0 p-2 h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>
      <MessageList
        messages={messages}
        isLoading={false}
        completionLoading={isLoading}
      />

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-5"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button
            type="submit"
            className="bg-orange-600 ml-2"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

// Wrapper — fetches persisted messages first, shows a loader until ready,
// then mounts ChatInner so useChat is initialized with the correct data.
const ChatComponent = ({ chatId }: Props) => {
  const { data: initialMessages } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<UIMessage[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  if (!initialMessages) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return <ChatInner chatId={chatId} initialMessages={initialMessages} />;
};

export default ChatComponent;
