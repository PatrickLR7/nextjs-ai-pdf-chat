# Migration Plan: Xata/OpenAI to Supabase/Amazon Bedrock

This plan outlines the refactoring steps to migrate the generic Next.js AI PDF Chat template from a potentially expensive stack (Xata + OpenAI) to an extremely cost-effective stack (Supabase for DB/pgvector + Amazon Bedrock for Claude 3 Haiku and Titan Embeddings).

## Cost-Effectiveness Evaluation
- **Database + Vectors (Supabase)**: Highly recommended. Supabase provides a very generous free tier (500MB DB space limit). Since it's built on PostgreSQL, it fully supports the `pgvector` extension. This completely eliminates the need for Xata and merges your relational data (`chats`, `messages`) and vector workloads (`vectors`) into a single, straightforward instance.
- **LLM + Embeddings (Amazon Bedrock)**: Very cost-effective. While not strictly "free", Amazon Bedrock allows you to pay per token. Claude 3 Haiku is incredibly fast and cheap ($\sim$0.25 per 1M input tokens), and Bedrock's Titan Text Embeddings v2 is virtually free ($\sim$0.02 per 1M tokens). *Alternative*: If you want a 100% free solution, we could use the generous free tiers of Google Gemini 1.5 Flash API or Groq API, but Amazon Bedrock is a very solid, professional pick for minimizing costs. We will proceed with Bedrock as suggested!

## Proposed Changes

### Database Migration (Supabase & Drizzle)
1. **Set up Supabase**: We'll define instructions for you to set up a new Supabase project and grab the standard Postgres connection string.
2. **Refactor Schema**:
   #### [MODIFY] schema.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/src/lib/db/schema.ts)
   - Remove Xata-specific metadata columns (`xataVersion`, `xataCreatedat`, `xataUpdatedat`, `xataId`).
   - Use standard `uuid` (or `serial`) for primary keys and `timestamp` for `createdAt`.
   - Update the `vectors` table embedding column to use `pgvector`'s `vector` type.
3. **Database Initialization**: 
   #### [NEW] index.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/src/lib/db/index.ts)
   - Initialize the Drizzle ORM client to point to the `DATABASE_URL`.
   #### [MODIFY] drizzle.config.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/drizzle.config.ts)
   - Update to use standard PostgreSQL driver pointing to the `DATABASE_URL`.

### Vector Store & AI Capabilities Migration
1. **Refactor Vector Ingestion**:
   #### [MODIFY] vector-store.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/src/lib/vector-store.ts)
   - Remove `XataVectorSearch` and `OpenAIEmbeddings`.
   - Use Amazon Bedrock Titan Text Embeddings to generate the vector embeddings.
   - Insert records directly into the Supabase Postgres `vectors` table via Drizzle.
2. **Refactor Context Retrieval**:
   #### [MODIFY] context.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/src/lib/context.ts)
   - Use Drizzle ORM's `cosineDistance` SQL operator against the Supabase `pgvector` index to find the 5 most relevant document chunks based on the user's query embedding.
3. **Refactor LLM Chat Endpoint**:
   #### [MODIFY] route.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/src/app/api/chat/route.ts)
   - Remove bare `OpenAI` client.
   - Adopt Next.js AI SDK Core (`streamText`) with the `@ai-sdk/amazon-bedrock` provider.
   - Update message history storage arrays to use the standard Drizzle DB client instead of the Xata client.

### Standard API Refactors
Swap the `getXataClient()` usage for standard DB queries:
#### [MODIFY] route.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/src/app/api/create-chat/route.ts)
- Replace `client.db.chats.create` with `db.insert(chats).values(...)`.
#### [MODIFY] route.ts(file:///f:/Documentos%20Actuales/Usuarios/Patrick/Documents/Desarrollo%20Web/nextjs-ai-pdf-chat/src/app/api/get-messages/route.ts)
- Replace `client.db.messages.filter` with `db.select().from(messages).where(eq(messages.chatId, ...))`.

## User Review Required
> [!CAUTION]
> This requires you to create two things:
> 1. A new Supabase Project. You will need the `DATABASE_URL` (direct connection string) to put into your `.env` file. Do you have a Supabase project created?
> 2. AWS Credentials. You need to enable Model Access in Bedrock (Claude 3 Haiku, Titan Embeddings v2) and obtain your `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`.

## Verification Plan
### Automated Tests
This API-heavy web application project doesn't appear to have automated tests set up via Pytest/Jest currently based on visible files. We will rely on TypeScript type checking during compilation to ensure route handlers correctly interface with the updated schemas and AI libraries.

### Manual Verification
1. Verify `npm run db:push` correctly applies the new pgvector schema to the Supabase instance.
2. Run the application `npm run dev` and navigate to `localhost:3000`.
3. Try uploading a PDF. Monitor the backend console to verify that the file goes into S3, splits the texts, creates Bedrock embeddings, and correctly saves them to the Supabase DB.
4. Open the PDF chat and test message retrieval and chat interaction using Claude 3 Haiku via Bedrock.
