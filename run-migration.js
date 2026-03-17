const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    const migrationFile = path.join(__dirname, 'src', 'lib', 'db', 'migrations', '0000_talented_bloodstrike.sql');
    let content = fs.readFileSync(migrationFile, 'utf8');
    
    // Fix Drizzle's literal quoting of custom types with arguments
    content = content.replace(/"vector\(1024\)"/g, 'vector(1024)');

    const statements = content.split('--> statement-breakpoint').map(stmt => stmt.trim()).filter(Boolean);
    
    console.log(`Found ${statements.length} migration statements. Running...`);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await sql.unsafe(statement);
    }
    
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await sql.end();
  }
}

main();
