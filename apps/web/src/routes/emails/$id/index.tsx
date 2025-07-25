import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/emails/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	const email = useQuery(
		orpc.emails.retrieveEmail.queryOptions({ input: { id } })
	);

	if (email.isLoading) return <p>Loading…</p>;
	if (email.error) return <p>{(email.error as Error).message}</p>;

	return (
		<div className="p-4">
			<h1 className="font-bold text-2xl">{email.data?.subject}</h1>
			<p className="text-muted-foreground">{email.data?.from}</p>
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: email body */}
			<article dangerouslySetInnerHTML={{ __html: email.data?.body ?? "" }} />
		</div>
	);
}
