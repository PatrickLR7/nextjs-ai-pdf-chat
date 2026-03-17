import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  customType,
} from "drizzle-orm/pg-core";

// Define a custom vector type for pgvector
// Titan Text Embeddings v2 defaults to 1024 dimensions
const vectorType = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1024)";
  },
  toDriver(val: number[]) {
    return `[${val.join(",")}]`;
  },
  fromDriver(val: string) {
    if (typeof val === "string") {
      return val.slice(1, -1).split(",").map(Number);
    }
    return val as any; // Depending on the driver, it might come back as an array already
  },
});

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vectors = pgTable("vectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  embedding: vectorType("embedding").notNull(),
  fileKey: text("file_key").notNull(),
});
