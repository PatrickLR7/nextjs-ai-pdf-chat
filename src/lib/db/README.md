The drizzle schema was introspected from xata using `npx drizzle-kit introspect:pg`
When using drizzle-kit with introspections for Xata, as of 4/13/2024 there's a bug
with the defaul value for Xata's primary keys (xata_id), see: https://xata.io/docs/integrations/drizzle
so you must manually wrap the default value in backticks for the schema to work.

The main reason this was introspected is to have the ability to easily move to another Postgres database
(with only minor adjustments) in case there's an issue with Xata.
But the project will mainly use the `xata client` for database operations.

Generate the Xata client with `xata init --schema xata-schema.json`
