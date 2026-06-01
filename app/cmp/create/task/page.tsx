"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {
	Box,
	Button,
	Field,
	Heading,
	Input,
	Select,
	SelectContent,
	SelectTrigger,
	Separator,
	Text,
	toaster,
} from "@optiaxiom/react";
import {IconChevronDown} from "@tabler/icons-react";
import usePersistentState from "@/app/usePersistentState";
import {initialCmpTasks, initialCmpCampaigns, avatarImages} from "@/app/db/cmpInitialData";
import type {CmpTask} from "@/app/db/cmpInitialData";
import {workflowTemplates} from "@/app/cmp/task/[id]/mockData";
import {createTaskWorkflowFromTemplate} from "@/app/cmp/task/[id]/utils/workflowState";
import type {TaskWorkflowState} from "@/app/cmp/task/[id]/workflowTypes";

const taskTemplateOptions = [
	{label: "Select a task template", value: ""},
	{label: "Stride Blog Post", value: "stride-blog-post"},
	{label: "Social Media", value: "social-media"},
	{label: "Email Campaign", value: "email-campaign"},
	{label: "Landing Page", value: "landing-page"},
	{label: "Press Release", value: "press-release"},
];

const campaignOptions = [
	{label: "Select a campaign", value: ""},
	...initialCmpCampaigns.map((c) => ({label: c.title, value: c.id})),
];

const workflowOptions = [
	{label: "Select a workflow", value: ""},
	...workflowTemplates
		.filter((w) => w.id !== "starter")
		.map((w) => ({label: w.name, value: w.id})),
];

function getToday() {
	return new Date().toISOString().split("T")[0];
}

export default function CreateTaskPage() {
	const router = useRouter();
	const [tasks, setTasks] = usePersistentState("cmpTasks", initialCmpTasks) as [
		CmpTask[],
		(val: CmpTask[]) => void,
		boolean,
	];
	const [taskWorkflows, setTaskWorkflows] = usePersistentState("cmpTaskWorkflows", {} as Record<string, TaskWorkflowState>) as [
		Record<string, TaskWorkflowState>,
		(val: Record<string, TaskWorkflowState>) => void,
		boolean,
	];

	const [title, setTitle] = useState("");
	const [template, setTemplate] = useState("");
	const [campaign, setCampaign] = useState("");
	const [startDate, setStartDate] = useState(getToday());
	const [dueDate, setDueDate] = useState("");
	const [workflow, setWorkflow] = useState("");
	const [fieldsOpen, setFieldsOpen] = useState(false);

	const canCreate = title.trim().length > 0;

	const handleCreate = () => {
		if (!canCreate) return;

		const newId = Date.now().toString();
		const maxRef = tasks.reduce((max, t) => {
			const num = parseInt(t.reference.replace("TSK-", ""), 10);
			return isNaN(num) ? max : Math.max(max, num);
		}, 2702);

		const newTask: CmpTask = {
			id: newId,
			title: title.trim(),
			reference: `TSK-${maxRef + 1}`,
			status: "Not Started",
			owner: {name: "Current User", src: avatarImages[0]},
			creationDate: new Date().toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}),
			startDate: startDate || "No start date",
			endDate: dueDate || "No end date",
			lastModified: new Date().toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}),
			parentCampaignId: campaign || undefined,
		};

		setTasks([...tasks, newTask]);

		if (workflow) {
			const template = workflowTemplates.find((w) => w.id === workflow);
			if (template) {
				setTaskWorkflows({...taskWorkflows, [newId]: createTaskWorkflowFromTemplate(template)});
			}
		}

		toaster.create("Task created successfully", {intent: "success"});
		router.push(`/cmp/task/${newId}`);
	};

	return (
		<Box display="flex" justifyContent="center" py="32">
			<Box w="full" style={{maxWidth: 720}}>
				<Heading level="2" mb="32" style={{textAlign: "center"}}>
					Create New Task
				</Heading>

				<Box display="flex" flexDirection="column" gap="24">
					<Field label="Title" required>
						<Input
							placeholder="Enter task title here"
							value={title}
							onChange={(e) => setTitle(e.target.value.slice(0, 80))}
						/>
						<Text fontSize="xs" color="fg.tertiary" mt="4">
							{title.length}/80
						</Text>
					</Field>

					<Field label="Task Template">
						<Select
							value={template}
							onValueChange={setTemplate}
							options={taskTemplateOptions}
						>
							<SelectTrigger placeholder="Select a task template" />
							<SelectContent />
						</Select>
					</Field>

					<Field label="Campaign">
						<Select
							value={campaign}
							onValueChange={setCampaign}
							options={campaignOptions}
						>
							<SelectTrigger placeholder="Select a campaign" />
							<SelectContent />
						</Select>
					</Field>

					<Box display="flex" gap="16">
						<Box flex="1">
							<Field label="Start Date">
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									style={{
										width: "100%",
										padding: "8px 12px",
										borderRadius: "6px",
										border: "1px solid var(--ax-colors-border-default)",
										background: "var(--ax-colors-bg-default)",
										color: "var(--ax-colors-fg-default)",
										fontSize: "14px",
										height: "40px",
									}}
								/>
							</Field>
						</Box>
						<Box flex="1">
							<Field label="Due Date" required>
								<input
									type="date"
									value={dueDate}
									onChange={(e) => setDueDate(e.target.value)}
									placeholder="yyyy-mm-dd"
									style={{
										width: "100%",
										padding: "8px 12px",
										borderRadius: "6px",
										border: "1px solid var(--ax-colors-border-default)",
										background: "var(--ax-colors-bg-default)",
										color: "var(--ax-colors-fg-default)",
										fontSize: "14px",
										height: "40px",
									}}
								/>
							</Field>
						</Box>
					</Box>

					<Field label="Workflow" required>
						<Select
							value={workflow}
							onValueChange={setWorkflow}
							options={workflowOptions}
						>
							<SelectTrigger placeholder="Select a workflow" />
							<SelectContent />
						</Select>
					</Field>

					<Separator />

					<Box
						display="flex"
						alignItems="center"
						gap="8"
						onClick={() => setFieldsOpen(!fieldsOpen)}
						style={{cursor: "pointer"}}
					>
						<IconChevronDown
							size={16}
							style={{
								transform: fieldsOpen ? "rotate(0deg)" : "rotate(-90deg)",
								transition: "transform 0.2s",
							}}
						/>
						<Text fontWeight="500">Fields</Text>
					</Box>

					{fieldsOpen && (
						<Box p="16" bg="bg.secondary" rounded="md">
							<Text fontSize="sm" color="fg.tertiary">
								No custom fields configured for this task template.
							</Text>
						</Box>
					)}

					<Box display="flex" justifyContent="flex-end" gap="8" mt="16">
						<Button appearance="default" onClick={() => router.back()}>
							Cancel
						</Button>
						<Button
							appearance="primary"
							onClick={handleCreate}
							disabled={!canCreate}
						>
							Create
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
