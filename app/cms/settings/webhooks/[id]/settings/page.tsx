"use client";

import {Box, Field, Checkbox} from "@optiaxiom/react";
import {Input} from "@/app/components/Input";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {Heading} from "@optiaxiom/react";
import {webhooks as initialWebhooks} from "../../mockData";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";

export default function WebhookSettings({params}: {params: Promise<{id: string}>}) {
	const {id} = use(params);
	const [webhooks] = usePersistentState("webhooks", initialWebhooks) as [
		typeof initialWebhooks,
		any
	];
	const webhook = webhooks.find((w) => w.id === id);

	if (!webhook) return null;

	return (
		<Box maxW="lg">
			<Box display="flex" flexDirection="column" gap="24">
				<Field label="Name">
					<Input defaultValue={webhook.name} />
				</Field>

				<Field label="Description">
					<Input defaultValue={webhook.description} />
				</Field>

				<Field>
					<Checkbox
						defaultChecked={webhook.status === "Active"}
						description="Webhook calls will be performed for the configured events."
					>
						Active
					</Checkbox>
				</Field>

				<Box>
					<Heading level="4" mb="16" color="fg.tertiary">
						URL & Authentication
					</Heading>
					<Box display="flex" flexDirection="column" gap="16">
						<Field label="URL">
							<Input defaultValue={webhook.url} readOnly />
						</Field>

						<Field label="Authentication token">
							<Input defaultValue="************************" readOnly />
						</Field>

						<Text fontSize="sm" color="fg.secondary">
							Changing URL requires a new authentication token.
						</Text>
						<Box>
							<Button>Edit</Button>
						</Box>
					</Box>
				</Box>

				<Box>
					<Heading level="4" mb="16" color="fg.tertiary">
						Events
					</Heading>
					<Text mb="16">Select which events to subscribe to.</Text>

					<Box className="grid grid-cols-3 gap-8">
						<Box display="flex" flexDirection="column" gap="8">
							<Text mb="4">Content</Text>
							<Checkbox description="A content item was saved">Save</Checkbox>
							<Checkbox description="A content item was published">Publish</Checkbox>
							<Checkbox description="A content item was unpublished">
								Unpublish
							</Checkbox>
							<Checkbox description="A content item was archived">Archived</Checkbox>
						</Box>

						<Box display="flex" flexDirection="column" gap="8">
							<Text mb="4">Content Types</Text>
							<Checkbox description="A content type was created">Created</Checkbox>
							<Checkbox description="A content type was updated">Updated</Checkbox>
							<Checkbox description="A content type was deleted">Deleted</Checkbox>
						</Box>

						<Box display="flex" flexDirection="column" gap="8">
							<Text mb="4">Workflow</Text>
							<Checkbox description="Content was approved">Approved</Checkbox>
							<Checkbox description="Content is ready for review">
								Ready for Review
							</Checkbox>
							<Checkbox description="Content was rejected">Rejected</Checkbox>
						</Box>
					</Box>
				</Box>

				<Box>
					<Heading level="4" mb="16" color="fg.tertiary">
						Delete Webhook
					</Heading>
					<Text mb="16">
						This will permanently remove this Webhook and cannot be undone.
					</Text>
					<Button appearance="danger-outline">Delete Webhook</Button>
				</Box>
			</Box>
			<Box
				borderT="1"
				borderColor="border.tertiary"
				p="16"
				display="flex"
				justifyContent="flex-end"
				gap="16"
				style={{zIndex: 100}}
			>
				<Button appearance="subtle">Cancel</Button>
				<Button appearance="primary">Save</Button>
			</Box>
		</Box>
	);
}
