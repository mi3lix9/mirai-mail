import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { emailRouter } from "./email";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	emails: emailRouter,
};
export type AppRouter = typeof appRouter;
