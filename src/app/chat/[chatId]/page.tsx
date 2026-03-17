import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  if (!_chats.length) {
    redirect("/");
  }
  
  const _chat = _chats.find((chat) => chat.id === chatId);
  if (!_chat) {
    redirect("/");
  }

  return (
    <div className="flex max-h-screen overflow-auto bg-gradient-to-tr from-orange-200 to-sky-200">
      <div className="flex w-full max-h-screen overflow-auto">
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={_chat.id} />
        </div>
        <div className="max-h-screen p-4 overflow-auto flex-[5]">
          {_chat && _chat.pdfUrl && (
            <PDFViewer pdf_url={_chat.pdfUrl.replaceAll(" ", "+")} />
          )}
        </div>
        <div className="flex-[3] border-l-4 border-l-slate-300">
          <ChatComponent chatId={_chat.id} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
