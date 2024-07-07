import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getXataClient } from "@/lib/db/xata";

export async function POST(req: Request, res: Response) {
  const { userId } = auth();
  const client = getXataClient();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { chatId } = await req.json();
    const _messages = await client.db.messages
      .filter({ chat_id: chatId })
      .getMany();

    return NextResponse.json(_messages, { status: 200 });
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
