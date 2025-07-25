import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { redis } from "bun";
import * as schema from "../db/auth";
import { db } from "./db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		usePlural: true,
		schema,
	}),
	secondaryStorage: {
		get: async (key) => redis.get(key),
		set: async (key, value, ttl) => {
			await redis.set(key, value);
			if (ttl) {
				await redis.expire(key, ttl);
			}
		},
		delete: async (key) => {
			await redis.del(key);
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || "", "my-better-t-app://"],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			scope: [
				"https://www.googleapis.com/auth/gmail.addons.current.message.action",
				"https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
				"https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
			],
		},
		microsoft: {
			clientId: process.env.MICROSOFT_CLIENT_ID as string,
			clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
			// Optional
			// tenantId: "common",
			// prompt: "select_account", // Forces account selection
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	plugins: [expo()],
});
