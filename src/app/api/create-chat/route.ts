import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
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
    
    // Process PDF and ingest to vector DB using Bedrock
    await loadS3IntoVectorTable(file_key);
    
    // Create new chat record in Supabase
    const chat = await db.insert(chats).values({
      fileKey: file_key,
      pdfName: file_name,
      pdfUrl: getS3Url(file_key),
      userId: userId,
    }).returning({
      insertedId: chats.id
    });
    
    return NextResponse.json({ chatId: chat[0].insertedId }, { status: 200 });
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
