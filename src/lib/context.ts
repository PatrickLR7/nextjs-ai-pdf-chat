import { XataVectorSearch } from "@langchain/community/vectorstores/xata";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getXataClient } from "./db/xata";

export async function getMatchesFromQuery(query: string, fileKey: string) {
  try {
    const client = getXataClient();
    const table = "vectors";
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPEN_AI_API_KEY,
    });

    /* Using Langchain XataVectorSearch Helper */
    const store = new XataVectorSearch(embeddings, { client, table });
    const queryResult = await store.similaritySearchWithScore(query, 5, {
      fileKey, // Important! The property you use for filtering here MUST be a string column type in Xata. It doesn't work properly with type text.
    });

    /* Alternative: Directly with Xata Client */
    // const queryEmbeddings = await embeddings.embedQuery(query);
    // const { records } = await client.db.vectors.vectorSearch(
    //   "embedding",
    //   queryEmbeddings,
    //   {
    //     size: 5,
    //     filter: {
    //       fileKey,
    //     },
    //   }
    // );

    return queryResult;
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const matches = await getMatchesFromQuery(query, fileKey);

  const qualifyingDocs = matches.filter(([_, score]) => score && score > 0.7);

  let docs = qualifyingDocs.map(([document]) => document.pageContent);
  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}
