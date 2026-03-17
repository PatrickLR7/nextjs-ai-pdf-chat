import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

export async function POST(req: Request, res: Response) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { chatId } = await req.json();
    const _messages = await db.select().from(messages).where(eq(messages.chatId, chatId));

    // Transform DB rows into UIMessage format that useChat / MessageList expect.
    // The DB stores a flat `content` string; UIMessage uses a `parts` array.
    const uiMessages = _messages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: msg.content }],
      content: msg.content,
    }));

    return NextResponse.json(uiMessages, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

