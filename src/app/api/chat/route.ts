import OpenAI from "openai";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { ChatsRecord, getXataClient } from "@/lib/db/xata";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env["OPEN_AI_API_KEY"],
});

export async function POST(req: Request) {
  try {
    const client = getXataClient();
    const { messages, chatId } = await req.json();
    const _chat: ChatsRecord | null = await client.db.chats
      .filter({ id: chatId })
      .getFirst();
    if (!_chat) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }
    const fileKey = _chat.file_key;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    console.log("CONTEXT: ", context);

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
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
      `,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      stream: true,
    });

    const stream = OpenAIStream(response, {
      onStart: async () => {
        // Save user message into db.
        try {
          await client.db.messages.create({
            chat_id: chatId,
            content: lastMessage.content,
            role: "user",
          });
        } catch (error) {
          console.log("User message insert error: ", error);
        }
      },
      onCompletion: async (completion) => {
        // Save AI message into db.
        try {
          await client.db.messages.create({
            chat_id: chatId,
            content: completion,
            role: "system",
          });
        } catch (error) {
          console.log("System message insert error: ", error);
        }
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("[chat route.ts error]: ", error);
  }
}
