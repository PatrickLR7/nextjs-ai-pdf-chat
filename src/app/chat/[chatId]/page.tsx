import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { getXataClient } from "@/lib/db/xata";
import { auth } from "@clerk/nextjs";
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
  const client = getXataClient();
  const _chats = await client.db.chats
    .filter({
      user_id: userId,
    })
    .getMany();
  if (!_chats.length) {
    redirect("/");
  }
  const _chat = _chats.find((chat) => chat.id === chatId);
  if (!_chat) {
    redirect("/");
  }

  const serializedChats = _chats.toSerializable();
  const serializedChat = _chat.toSerializable();

  return (
    <div className="flex max-h-screen overflow-auto bg-gradient-to-tr from-orange-200 to-sky-200">
      <div className="flex w-full max-h-screen overflow-auto">
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={serializedChats} chatId={serializedChat.id} />
        </div>
        <div className="max-h-screen p-4 overflow-auto flex-[5]">
          {serializedChat && serializedChat.pdf_url && (
            <PDFViewer pdf_url={serializedChat.pdf_url.replaceAll(" ", "+")} />
          )}
        </div>
        <div className="flex-[3] border-l-4 border-l-slate-300">
          <ChatComponent chatId={serializedChat.id} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
