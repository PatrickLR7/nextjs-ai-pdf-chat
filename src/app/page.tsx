import FileUpload from "@/components/FileUpload";
import GoToChats from "@/components/GoToChats";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { UserButton, auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = auth();
  const isAuthed = !!userId;
  
  let firstChat;
  if (isAuthed) {
    // Drizzle requires auth to be sure, grab only the user's first chat
    const _chats = await db.select().from(chats).where(eq(chats.userId, userId)).limit(1);
    firstChat = _chats[0] || null;
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-tr from-orange-300 to-sky-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {isAuthed && firstChat && (
              <GoToChats href={`/chat/${firstChat.id}`} />
            )}
          </div>
          <p>
            Leverage <a className="text-cyan-600 font-bold underline" href="https://aws.amazon.com/what-is/retrieval-augmented-generation/">RAG</a> to chat with your PDFs!
            Simply drag and drop a PDF and start asking questions about it.
          </p>

          <div className="w-full mt-4">
            {isAuthed ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button className="text-white bg-orange-500 hover:bg-orange-600">
                  Login to get Started!
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
