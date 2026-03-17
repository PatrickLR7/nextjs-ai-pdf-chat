import { streamText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as messagesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    
    // Fetch chat from new Supabase schema
    const _chat = await db.select().from(chats).where(eq(chats.id, chatId));
    
    if (_chat.length === 0) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }
    const currentChat = _chat[0];
    const fileKey = currentChat.fileKey;
    const lastMessage = messages[messages.length - 1];
    
    // Extract text content from UIMessage parts (AI SDK v4 format)
    const lastMessageText = lastMessage.parts
      ?.filter((p: { type: string }) => p.type === "text")
      .map((p: { type: string; text?: string }) => p.text ?? "")
      .join("") ?? lastMessage.content ?? "";
    
    // Get context from pgvector
    const context = await getContext(lastMessageText, fileKey);

    console.log("CONTEXT: ", context);

    const systemPrompt = `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
    `;

    // Save user message
    try {
      await db.insert(messagesTable).values({
        chatId: currentChat.id,
        content: lastMessageText,
        role: "user",
      });
    } catch (error) {
      console.log("User message insert error: ", error);
    }

    // Convert UIMessages to CoreMessages for streamText
    const coreMessages = messages.map((msg: { role: string; parts?: Array<{ type: string; text?: string }>; content?: string }) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("") ?? msg.content ?? "",
    }));

    // Call Bedrock Claude 3 Haiku
    const result = await streamText({
      model: bedrock("anthropic.claude-3-haiku-20240307-v1:0"),
      system: systemPrompt,
      messages: coreMessages,
      onFinish: async ({ text }) => {
        // Save AI response
        try {
          await db.insert(messagesTable).values({
            chatId: currentChat.id,
            content: text,
            role: "assistant", 
          });
        } catch (error) {
          console.log("System message insert error: ", error);
        }
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat route.ts error]: ", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
