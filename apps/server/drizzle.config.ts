import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/index.ts",
	out: "./drizzle",
	dialect: "turso",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
});
