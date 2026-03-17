import { db } from "./db";
import { vectors } from "./db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { embed } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";

export async function getMatchesFromQuery(query: string, fileKey: string) {
  try {
    // Generate embedding for the search query
    const { embedding } = await embed({
      model: bedrock.embedding("amazon.titan-embed-text-v2:0"),
      value: query,
    });

    // Formatting embedding array so pgvector can parse it
    const embeddingString = `[${embedding.join(",")}]`;

    // Query Supabase using pgvector cosine distance `<=>` operator
    const similarityQuery = sql<number>`1 - (${vectors.embedding} <=> ${embeddingString}::vector)`;

    const matches = await db.select({
      content: vectors.content,
      similarity: similarityQuery,
    })
    .from(vectors)
    .where(eq(vectors.fileKey, fileKey))
    // we use `orderBy` on the distance itself to get the closest matches
    .orderBy((t) => desc(t.similarity))
    .limit(5);

    return matches;
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const matches = await getMatchesFromQuery(query, fileKey);

  // Filter out low scores (Titan distance scores will vary, 0.4 is a safe starting threshold)
  const qualifyingDocs = matches.filter((match) => match.similarity > 0.4);

  let docs = qualifyingDocs.map((match) => match.content);
  // Max 3000 chars for context window
  return docs.join("\n").substring(0, 3000);
}
