import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/emails/$id/")({
	component: RouteComponent,
	ssr: "data-only",
	loader: async ({ params }) => {
		const email = await orpc.emails.retrieveEmail.call({ id: params.id });
		return email;
	},
});

function RouteComponent() {
	const email = Route.useLoaderData();

	return (
		<div className="p-4">
			<h1 className="font-bold text-2xl">{email.subject}</h1>
			<p className="text-muted-foreground">{email.from}</p>
			<article
				className="bg-white"
				/** biome-ignore lint/security/noDangerouslySetInnerHtml: email body */
				dangerouslySetInnerHTML={{ __html: email.body ?? "" }}
			/>
		</div>
	);
}
