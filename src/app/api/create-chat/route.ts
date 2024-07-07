import { getXataClient } from "@/lib/db/xata";
import { getS3Url } from "@/lib/s3";
import { loadS3IntoVectorTable } from "@/lib/vector-store";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    await loadS3IntoVectorTable(file_key);
    const client = getXataClient();
    const chat = await client.db.chats.create({
      file_key,
      pdf_name: file_name,
      pdf_url: getS3Url(file_key),
      user_id: userId,
    });
    return NextResponse.json({ chatId: chat.id }, { status: 200 });
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
