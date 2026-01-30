"use client";

import {Box, Field, Checkbox, Select, SelectTrigger, SelectContent, Grid} from "@optiaxiom/react";
import {Input} from "@/app/components/Input";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {Heading} from "@optiaxiom/react";
import {webhooks as initialWebhooks} from "../../mockData";
import {use, useState, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Flex} from "@/app/components/Flex";
import Flow from "@/app/components/Flow";

const eventTypes = [
	{
		label: "Content",
		value: "content",
		events: [
			{label: "Save", value: "save", description: "A content item was saved"},
			{label: "Publish", value: "publish", description: "A content item was published"},
			{label: "Unpublish", value: "unpublish", description: "A content item was unpublished"},
			{label: "Archived", value: "archived", description: "A content item was archived"},
		],
	},
	{
		label: "Content Types",
		value: "content-types",
		events: [
			{label: "Created", value: "created", description: "A content type was created"},
			{label: "Updated", value: "updated", description: "A content type was updated"},
			{label: "Deleted", value: "deleted", description: "A content type was deleted"},
		],
	},
	{
		label: "Workflow",
		value: "workflow",
		events: [
			{label: "Approved", value: "approved", description: "Content was approved"},
			{
				label: "Ready for Review",
				value: "ready-for-review",
				description: "Content is ready for review",
			},
			{label: "Rejected", value: "rejected", description: "Content was rejected"},
		],
	},
];

const selectOptions = eventTypes.map((type) => ({label: type.label, value: type.value}));

export default function WebhookSettings({params}: {params: Promise<{id: string}>}) {
	const {id} = use(params);
	const [webhooks, setWebhooks] = usePersistentState("webhooks", initialWebhooks) as [
		typeof initialWebhooks,
		any,
	];
	const webhook = webhooks.find((w) => w.id === id);
	const [selectedType, setSelectedType] = useState(eventTypes[0].value);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		status: "Inactive",
		eventType: eventTypes[0].value,
		events: [] as string[],
	});

	// Initialize form data when webhook loads
	useEffect(() => {
		if (webhook) {
			const savedEventType = (webhook as any).eventType || eventTypes[0].value;
			setSelectedType(savedEventType);
			setFormData({
				name: webhook.name,
				description: webhook.description || "",
				status: webhook.status || "Inactive",
				eventType: savedEventType,
				events: (webhook as any).events || [],
			});
		}
	}, [webhook]);

	if (!webhook) return null;

	const handleSave = () => {
		const updatedWebhooks = webhooks.map((w) => (w.id === id ? {...w, ...formData} : w));
		setWebhooks(updatedWebhooks);
	};

	const handleTypeChange = (newType: string) => {
		setSelectedType(newType);
		setFormData({
			...formData,
			eventType: newType,
			events: [], // Uncheck all hidden options by clearing events when switching type
		});
	};

	const toggleEvent = (eventValue: string) => {
		const currentEvents = formData.events;
		if (currentEvents.includes(eventValue)) {
			setFormData({
				...formData,
				events: currentEvents.filter((e) => e !== eventValue),
			});
		} else {
			setFormData({
				...formData,
				events: [...currentEvents, eventValue],
			});
		}
	};

	const hasChanges = webhook
		? formData.name !== webhook.name ||
			(formData.description || "") !== (webhook.description || "") ||
			formData.status !== (webhook.status || "Inactive") ||
			formData.eventType !== ((webhook as any).eventType || eventTypes[0].value) ||
			JSON.stringify(formData.events.sort()) !==
				JSON.stringify(((webhook as any).events || []).sort())
		: false;

	return (
		<>
			<Flow>
				<Field label="Name">
					<Input
						value={formData.name}
						onChange={(e) => setFormData({...formData, name: e.target.value})}
					/>
				</Field>
				<Field label="Description">
					<Input
						value={formData.description}
						onChange={(e) => setFormData({...formData, description: e.target.value})}
					/>
				</Field>
				<Field>
					<Checkbox
						checked={formData.status === "Active"}
						onCheckedChange={(checked) =>
							setFormData({...formData, status: checked ? "Active" : "Inactive"})
						}
						description="Webhook calls will be performed for the configured events."
					>
						Active
					</Checkbox>
				</Field>
				<Heading level="4">URL & Authentication</Heading>
				<Field label="URL">
					<Input defaultValue={webhook.url} readOnly />
				</Field>

				<Field
					label="Authentication token"
					description="Changing URL requires a new authentication token."
				>
					<Input defaultValue="************************" readOnly />
				</Field>
				<Button>Edit</Button>
				<Heading level="4">Events</Heading>
				<Text>Select which events to subscribe to.</Text>

				<Field label="Event Type" fontWeight="400">
					<Select
						options={selectOptions}
						value={selectedType}
						onChange={(e: any) => handleTypeChange(e.target.value)}
					>
						<SelectTrigger size="lg" />
						<SelectContent />
					</Select>
				</Field>

				{eventTypes
					.find((t) => t.value === selectedType)
					?.events.map((event) => (
						<Box key={event.value}>
							<Checkbox
								checked={formData.events.includes(event.value)}
								onCheckedChange={() => toggleEvent(event.value)}
								description={event.description}
							>
								{event.label}
							</Checkbox>
						</Box>
					))}
				<Heading level="4" fontWeight="400">
					Filter
				</Heading>
				<Text>Optionally filter events to trigger the webhook.</Text>
				<Heading level="4" fontWeight="400">
					Payload
				</Heading>
				<Text>Optionally filter events to trigger the webhook.</Text>
				<Heading level="4">Delete Webhook</Heading>
				<Text>This will permanently remove this Webhook and cannot be undone.</Text>
				<Button appearance="danger-outline">Delete Webhook</Button>
			</Flow>

			<Flex
				borderT="1"
				borderColor="border.tertiary"
				py="16"
				mt="32"
				justifyContent="flex-end"
				gap="16"
				maxW="lg"
			>
				<Button appearance="subtle">Cancel</Button>
				<Button appearance="primary" onClick={handleSave} disabled={!hasChanges}>
					Save
				</Button>
			</Flex>
		</>
	);
}
