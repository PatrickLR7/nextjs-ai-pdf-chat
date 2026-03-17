import { Document } from "@langchain/core/documents";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { embedMany } from "ai";
import { db } from "./db";
import { vectors } from "./db/schema";
import { downloadFromS3 } from "./s3-server";

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
    };
  };
};

export async function loadS3IntoVectorTable(fileKey: string) {
  // 1. Obtain the PDF
  console.log("Downloading S3 into file system...");
  const file = await downloadFromS3(fileKey);
  if (!file || !file.blob) {
    throw new Error("Could not download from S3");
  }
  const loader = new PDFLoader(file.blob);
  const pages = (await loader.load()) as PDFPage[];

  // 2. Split and segment the pdf.
  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page, fileKey))
  );
  const flatDocuments = documents.flat();

  // 3. Embed Documents and Upload to Supabase DB via Drizzle
  await embedDocuments(flatDocuments, fileKey);

  return true;
}

async function embedDocuments(documents: Document[], fileKey: string) {
  const table = "vectors";
  
  // Extract text chunks to embed
  const valuesToEmbed = documents.map(doc => doc.pageContent.replace(/\n/g, " "));

  // We are using Titan Text Embeddings V2 with Bedrock
  // It returns 1024-dimension embeddings by default
  const { embeddings } = await embedMany({
    model: bedrock.embedding("amazon.titan-embed-text-v2:0"),
    values: valuesToEmbed,
  });

  // Prepare records to insert into Supabase
  const records = documents.map((doc, i) => ({
    fileKey,
    content: doc.pageContent,
    embedding: embeddings[i],
  }));

  // Batch insert into the vectors table
  await db.insert(vectors).values(records);
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage, fileKey: string) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  const chunkSize = 1000;
  const chunkOverlap = 200;
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        page_number: metadata.loc.pageNumber,
        fileKey,
      },
    }),
  ]);
  return docs;
}
