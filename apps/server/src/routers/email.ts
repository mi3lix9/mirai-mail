import { ORPCError } from "@orpc/server";
import createDOMPurify from "dompurify";
import { eq } from "drizzle-orm";
import { google } from "googleapis";
import { JSDOM } from "jsdom";
import { type ParsedMail, simpleParser } from "mailparser";
import { z } from "zod";
import { accounts } from "@/db/auth";
import { o, protectedProcedure } from "@/lib/orpc";

const Email = z.object({
	id: z.string(),
	subject: z.string(),
	from: z.string(),
});

const EmailDetail = Email.extend({
	body: z.string(),
});

const retrieveEmails = protectedProcedure
	.output(z.array(Email))
	.handler(async ({ context }) => {
		const account = await context.db.query.accounts.findFirst({
			where: eq(accounts.userId, context.session?.user?.id),
		});

		if (!account) {
			throw new ORPCError("NOT_FOUND", { message: "Account not found" });
		}

		const gmail = google.gmail({ version: "v1" });

		const res = await gmail.users.messages.list({
			userId: "me",
			maxResults: 10,
			access_token: account.accessToken || "",
		});

		const detailedMessages: z.infer<typeof Email>[] = await Promise.all(
			(res.data.messages || []).map(async (msg) => {
				const email = await gmail.users.messages.get({
					userId: "me",
					id: msg.id || "",
					access_token: account.accessToken || "",
					fields: "id,payload/headers",
				});
				return Email.parse({
					id: msg.id || "",
					subject: email.data.payload?.headers?.find(
						(h) => h.name === "Subject"
					)?.value,
					from: email.data.payload?.headers?.find((h) => h.name === "From")
						?.value,
				});
			})
		);

		return detailedMessages;
	});

const retrieveEmail = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(EmailDetail)
	.handler(async ({ context, input }) => {
		const account = await context.db.query.accounts.findFirst({
			where: eq(accounts.userId, context.session?.user?.id),
		});

		if (!account) {
			throw new ORPCError("NOT_FOUND", { message: "Account not found" });
		}

		const gmail = google.gmail({ version: "v1" });

		// Prepare DOMPurify for server‑side HTML sanitisation
		const jsdomWindow = new JSDOM("").window;
		const DOMPurify = createDOMPurify(jsdomWindow);

		// Fetch the full raw message so MailParser can handle MIME, charsets, etc.
		const res = await gmail.users.messages.get({
			userId: "me",
			id: input.id,
			access_token: account.accessToken || "",
			format: "raw",
		});

		const rawEmail = Buffer.from(res.data.raw ?? "", "base64url").toString(
			"utf-8"
		);
		const parsed: ParsedMail = await simpleParser(rawEmail);

		const sanitisedHtml = DOMPurify.sanitize(
			parsed.html || parsed.textAsHtml || "",
			{
				WHOLE_DOCUMENT: true,
			}
		);

		const email = EmailDetail.parse({
			id: res.data.id || "",
			subject: parsed.subject || "(no subject)",
			from: parsed.from?.text || "",
			body: sanitisedHtml,
		});

		return email;
	});

export const emailRouter = o.router({
	retrieveEmails,
	retrieveEmail,
});
