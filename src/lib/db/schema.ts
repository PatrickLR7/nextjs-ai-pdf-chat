import {
  pgTable,
  uniqueIndex,
  unique,
  text,
  varchar,
  integer,
  timestamp,
  real,
} from "drizzle-orm/pg-core";

export const chats = pgTable(
  "chats",
  {
    pdfName: text("pdf_name").notNull(),
    pdfUrl: text("pdf_url").notNull(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    fileKey: text("file_key").notNull(),
    xataVersion: integer("xata_version").default(0).notNull(),
    xataCreatedat: timestamp("xata_createdat", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    xataUpdatedat: timestamp("xata_updatedat", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    xataId: text("xata_id")
      .default(`'rec_'::text || (xata_private.xid())::text`)
      .notNull(),
  },
  (table) => {
    return {
      pgrollNewXataIdKey: uniqueIndex("chats__pgroll_new_xata_id_key").on(
        table.xataId
      ),
      chatsPgrollNewXataIdKey: unique("chats__pgroll_new_xata_id_key").on(
        table.xataId
      ),
    };
  }
);

export const messages = pgTable(
  "messages",
  {
    content: text("content").notNull(),
    role: text("role").notNull(),
    xataCreatedat: timestamp("xata_createdat", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    xataUpdatedat: timestamp("xata_updatedat", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    xataId: text("xata_id")
      .default(`'rec_'::text || (xata_private.xid())::text`)
      .notNull(),
    xataVersion: integer("xata_version").default(0).notNull(),
    chatId: text("chat_id").references(() => chats.xataId, {
      onDelete: "cascade",
    }),
  },
  (table) => {
    return {
      pgrollNewXataIdKey: uniqueIndex("messages__pgroll_new_xata_id_key").on(
        table.xataId
      ),
      messagesPgrollNewXataIdKey: unique("messages__pgroll_new_xata_id_key").on(
        table.xataId
      ),
    };
  }
);

export const vectors = pgTable(
  "vectors",
  {
    xataId: text("xata_id")
      .default(`'rec_'::text || (xata_private.xid())::text`)
      .notNull(),
    xataVersion: integer("xata_version").default(0).notNull(),
    xataCreatedat: timestamp("xata_createdat", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    xataUpdatedat: timestamp("xata_updatedat", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    content: text("content").notNull(),
    embedding: real("embedding").array(),
    fileKey: text("file_key"),
  },
  (table) => {
    return {
      pgrollNewXataIdKey: uniqueIndex("_pgroll_new_vectors_xata_id_key").on(
        table.xataId
      ),
      vectorsPgrollNewXataIdKey: unique("_pgroll_new_vectors_xata_id_key").on(
        table.xataId
      ),
    };
  }
);
