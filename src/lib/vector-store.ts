import { XataVectorSearch } from "@langchain/community/vectorstores/xata";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { getXataClient } from "./db/xata";
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
  pages;

  // 2. Split and segment the pdf.
  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page, fileKey))
  );
  const flatDocuments = documents.flat();

  // 3. Embed Documents and Upload to Xata
  const ids = await embedDocuments(flatDocuments);

  return ids[0];
}

async function embedDocuments(documents: Document[]) {
  const client = getXataClient();

  const table = "vectors";
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
  });
  const store = new XataVectorSearch(embeddings, { client, table });
  const ids = await store.addDocuments(documents);
  return ids;
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
