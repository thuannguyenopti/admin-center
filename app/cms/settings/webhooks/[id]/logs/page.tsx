"use client";

import {Box, Badge} from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "@/app/components/Table";
import {Heading} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {errorLogs, webhooks} from "../../mockData";
import {use} from "react";
import Property from "@/app/components/Property";

export default function WebhookLogs({params}: {params: Promise<{id: string}>}) {
	const {id} = use(params);
	const webhook = webhooks.find((w) => w.id === id);

	if (!webhook) return null;

	return (
		<Box>
			<Property
				title="Success Rate (72h)"
				description={`${webhook.successRate}%`}
				type="badge"
				data={{intent: webhook.successRate > 80 ? "success" : "danger"}}
			/>
			<Box>
				<Heading level="4" mb="16">
					Errors
				</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Listing all errors from the last 30 days.
				</Text>

				<Table>
					<thead>
						<Tr>
							<Th>Date</Th>
							<Th align="right">Result</Th>
						</Tr>
					</thead>
					<tbody>
						{errorLogs.map((log, i) => (
							<Tr key={i}>
								<Td>
									<Text>{log.date}</Text>
								</Td>
								<Td>
									<Box display="flex" justifyContent="flex-end">
										<Badge intent="danger">{log.result}</Badge>
									</Box>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>
		</Box>
	);
}
