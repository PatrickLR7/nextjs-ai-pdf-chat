import { JSONData } from "@xata.io/client";
import { ChatsRecord } from "@/lib/db/xata";
import { Button } from "./ui/button";
import Link from "next/link";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: JSONData<ChatsRecord>[];
  chatId?: string;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-sky-950">
      <Link href="/">
        <Button className="bg-orange-600 hover:bg-orange-700 w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>
      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded lg p-3 text-slate-300 flex items-center", {
                "bg-sky-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdf_name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/">Home</Link>
          {/* Stripe Button */}
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
