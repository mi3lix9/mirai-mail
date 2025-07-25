import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/emails/")({
	component: RouteComponent,
});

function RouteComponent() {
	const emails = useQuery(orpc.emails.retrieveEmails.queryOptions());
	return (
		<div className="flex flex-col gap-4 p-4">
			<h2 className="font-bold text-2xl">Emails</h2>
			<div className="flex flex-col gap-4">
				{emails.data?.map((email) => (
					<Link key={email.id} to={"/emails/" + email.id}>
						<Card className="cursor-pointer select-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
							<CardHeader>
								<CardTitle>{email.subject}</CardTitle>
								<CardDescription>{email.from}</CardDescription>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
