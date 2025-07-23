import "dotenv/config";
import { cors } from "@elysiajs/cors";
import { RPCHandler } from "@orpc/server/fetch";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { appRouter } from "./routers";

const handler = new RPCHandler(appRouter);

const _app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .all("/api/auth/*", (context) => {
    const { request } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    context.status(405);
  })
  .all("/rpc*", async (context) => {
    const { response } = await handler.handle(context.request, {
      prefix: "/rpc",
      context: await createContext({ context }),
    });
    return response ?? new Response("Not Found", { status: 404 });
  })
  .get("/", () => "OK")
  .listen(3000, () => {
    // Server is running
  });
