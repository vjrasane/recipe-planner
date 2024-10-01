CREATE TABLE IF NOT EXISTS "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"instructions" text NOT NULL,
	"ingredients" json DEFAULT '[]'::json,
	"tags" json DEFAULT '[]'::json
);
