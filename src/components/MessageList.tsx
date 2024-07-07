import { cn } from "@/lib/utils";
import { type Message } from "ai/react";
import Loader from "./Loader";

type Props = {
  messages: Message[];
  isLoading: boolean;
  completionLoading: boolean;
};

const MessageList = ({ messages, isLoading, completionLoading }: Props) => {
  if (isLoading)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  if (!messages) return <></>;
  return (
    <div className="flex flex-col gap-2 px-4 max-h-[90%] overflow-y-auto mb-auto">
      {messages.map((message) => {
        return (
          <div
            className={cn("flex", {
              "justify-end pl-10": message.role === "user",
              "justify-start pr-10": message.role === "assistant",
            })}
          >
            <div
              className={cn(
                "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
                {
                  "bg-sky-600 text-white": message.role === "user",
                  "bg-white text-black": message.role === "assistant",
                }
              )}
            >
              <p>{message.content}</p>
            </div>
          </div>
        );
      })}
      {completionLoading && <Loader width="50px" height="50px" />}
    </div>
  );
};

export default MessageList;
