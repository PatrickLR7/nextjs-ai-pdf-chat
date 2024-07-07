import { drizzle } from "drizzle-orm/node-postgres";
import { getXataClient } from "./xata"; // Generated client
import { Client } from "pg";
const xata = getXataClient();
const client = new Client({ connectionString: xata.sql.connectionString });
export const db = drizzle(client);
