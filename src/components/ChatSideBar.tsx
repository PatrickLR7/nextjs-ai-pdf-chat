import { Button } from "./ui/button";
import Link from "next/link";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the shape that matches your Drizzle schema for 'chats'
type Chat = {
  id: string;
  pdfName: string;
  pdfUrl: string;
  userId: string;
  fileKey: string;
  createdAt: Date;
};

type Props = {
  chats: Chat[];
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
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-white-500 flex-wrap">
          <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Home
          </Link>
          {/* Stripe Button */}
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
