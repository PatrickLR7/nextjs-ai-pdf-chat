const postgres = require('postgres');
require('dotenv').config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log("Creating pgvector extension in public schema...");
    await sql`CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;`;
    
    // Sometimes it's already in extensions schema, so let's also make sure public can use it.
    await sql`ALTER EXTENSION vector SET SCHEMA public;`.catch(e => console.log("Already in public or could not move"));
    
    console.log("Successfully prepared vector extension.");
  } catch (err) {
    console.error("Error creating extension:", err);
  } finally {
    await sql.end();
  }
}

main();
