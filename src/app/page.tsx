import FileUpload from "@/components/FileUpload";
import GoToChats from "@/components/GoToChats";
import { Button } from "@/components/ui/button";
import { getXataClient } from "@/lib/db/xata";
import { UserButton, auth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = auth();
  const isAuthed = !!userId;
  const client = getXataClient();
  const firstChat = await client.db.chats.getFirst();

  return (
    <div className="w-screen min-h-screen bg-gradient-to-tr from-orange-300 to-sky-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
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
            Join millions of students, researches, and profesionals to instantly
            answer questions and understand research with AI
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
