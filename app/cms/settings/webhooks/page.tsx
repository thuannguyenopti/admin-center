"use client";

import {useState, Dispatch, SetStateAction} from "react";
import {
	Box,
	SearchInput,
	Badge,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Field,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Table, Th, Tr, Td} from "@/app/components/Table";
import {webhooks as initialWebhooks} from "./mockData";
import {IconDots} from "@tabler/icons-react";
import {useRouter} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";

export default function WebhooksPage() {
	const router = useRouter();
	const [webhooks, setWebhooks] = usePersistentState("webhooks", initialWebhooks) as [
		typeof initialWebhooks,
		Dispatch<SetStateAction<typeof initialWebhooks>>
	];
	const [statusFilter, setStatusFilter] = useState("All");
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		url: "",
	});

	const handleCreate = () => {
		if (!formData.name) return;

		const newWebhook = {
			id: Date.now().toString(),
			name: formData.name,
			description: formData.description,
			status: "Active",
			successRate: 0,
			lastRun: "Never",
			url: formData.url,
		};

		setWebhooks([...webhooks, newWebhook]);
		setIsCreateOpen(false);
		setFormData({name: "", description: "", url: ""});
		router.push(`/cms/settings/webhooks/${newWebhook.id}/settings`);
	};

	const filteredWebhooks = webhooks.filter(
		(w) => statusFilter === "All" || w.status === statusFilter
	);

	return (
		<>
			<Box display="flex" justifyContent="space-between" pb="24">
				<Box display="flex" gap="8">
					<Box style={{width: "300px"}}>
						<SearchInput size="lg" placeholder="Filter by name" />
					</Box>
					<Menu
						options={[
							{label: "All", execute: () => setStatusFilter("All")},
							{label: "Active", execute: () => setStatusFilter("Active")},
							{label: "Inactive", execute: () => setStatusFilter("Inactive")},
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Status">{statusFilter}</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>
				<Button appearance="primary" onClick={() => setIsCreateOpen(true)}>
					Create Webhook
				</Button>
			</Box>
			<Table>
				<thead>
					<Tr>
						<Th>Name</Th>
						<Th>Status</Th>
						<Th>Success Rate</Th>
						<Th>Last Run</Th>
						<Th>URL</Th>
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{filteredWebhooks.map((webhook) => (
						<Tr key={webhook.id} url={`/cms/settings/webhooks/${webhook.id}/settings`}>
							<Td type="header" description={webhook.description}>
								{webhook.name}
							</Td>
							<Td>
								<Badge intent={webhook.status === "Active" ? "success" : "neutral"}>
									{webhook.status}
								</Badge>
							</Td>
							<Td>
								<Badge
									intent={
										webhook.successRate === 100
											? "success"
											: webhook.successRate === 0
											? "danger"
											: "warning"
									}
								>
									{webhook.successRate}%
								</Badge>
							</Td>
							<Td>{webhook.lastRun}</Td>
							<Td className="font-mono text-xs text-gray-500 truncate max-w-[200px]">
								{webhook.url}
							</Td>
							<Td type="button">
								<Box onClick={(e) => e.stopPropagation()}>
									<Menu
										options={[
											{
												label: "Edit",
												execute: () =>
													router.push(
														`/cms/settings/webhooks/${webhook.id}/settings`
													),
											},
											{
												label: "Delete",
												intent: "danger",
												execute: () => setDeleteId(webhook.id),
											},
										]}
									>
										<MenuTrigger
											icon={<IconDots />}
											size="sm"
											aria-label="Webhook Options"
											appearance="subtle"
										/>
										<MenuContent />
									</Menu>
								</Box>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>Delete Webhook</AlertDialogHeader>
					<AlertDialogBody>
						Are you sure you want to delete this webhook? This action cannot be undone.
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							appearance="danger"
							onClick={() => {
								if (deleteId) {
									setWebhooks((prev) => prev.filter((w) => w.id !== deleteId));
									setDeleteId(null);
								}
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent size="sm">
					<DialogHeader>Create Webhook</DialogHeader>
					<DialogBody>
						<Field label="Name" required>
							<Input
								placeholder="e.g. Deploy Production"
								value={formData.name}
								onChange={(e) => setFormData({...formData, name: e.target.value})}
							/>
						</Field>
						<Field label="Description" required>
							<Input
								placeholder="What does this webhook do?"
								value={formData.description}
								onChange={(e) =>
									setFormData({...formData, description: e.target.value})
								}
							/>
						</Field>
					</DialogBody>
					<DialogFooter>
						<DialogClose appearance="subtle">Cancel</DialogClose>
						<Button appearance="primary" onClick={handleCreate}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
