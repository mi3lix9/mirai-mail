import type { Context as ElysiaContext } from "elysia";
import { log } from "@/utils/log";
import { auth } from "./auth";
import { db } from "./db";

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});
	return {
		session,
		db,
		log,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
