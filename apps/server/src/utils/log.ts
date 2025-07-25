import { createPinoLogger } from "@bogeychan/elysia-logger";

export const log = createPinoLogger({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			levelFirst: true,
			translateTime: "HH:MM:ss",
		},
	},
});
