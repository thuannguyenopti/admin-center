"use client";

import React, {useState, useCallback} from "react";
import {Box, Button, Checkbox, Field, Group, Input, Select, SelectContent, SelectTrigger, Text, Textarea} from "@optiaxiom/react";
import {IconCheck, IconLoader2} from "@tabler/icons-react";
import type {AdaptiveBlockComponentProps} from "../AdaptiveBlockRegistry";
import {AdaptiveBlock} from "../AdaptiveBlock";
import {CAMPAIGN_METRICS} from "@/app/cmp/types/metrics";
import {REAL_TIME_SEGMENTS} from "@/app/cmp/types/segments";
import {channelDefinitions} from "@/app/cmp/task/[id]/components/publishing/channelDefinitions";
import {useLayout} from "@/app/context/LayoutContext";

export type BriefWizardBlockMetadata = {
	blockType: "brief-wizard-step";
	taskId: string;
	taskTitle: string;
};

type WizardStep = "foundation" | "channels" | "generate" | "generating" | "done";

type ChecklistItem = {
	label: string;
	status: "pending" | "running" | "done";
};

const audienceOptions = [
	{label: "Select audience", value: ""},
	...REAL_TIME_SEGMENTS.map((s) => ({label: s.name, value: s.id})),
];

const metricOptions = [
	{label: "Select metric", value: ""},
	...CAMPAIGN_METRICS.map((m) => ({label: m.name, value: m.id})),
];

export const BriefWizardBlock: React.FC<AdaptiveBlockComponentProps> = ({metadata, messageId}) => {
	const wizard = metadata as BriefWizardBlockMetadata;
	const {opalPanelControls} = useLayout();

	const [step, setStep] = useState<WizardStep>("foundation");
	const [coreMessage, setCoreMessage] = useState("");
	const [valueProposition, setValueProposition] = useState("");
	const [audience, setAudience] = useState("");
	const [metric, setMetric] = useState("");
	const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
	const [imageGuidelines, setImageGuidelines] = useState("");
	const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
	const [resultSummary, setResultSummary] = useState("");

	const toggleChannel = useCallback((id: string) => {
		setSelectedChannels((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleGenerate = useCallback(async () => {
		setStep("generating");

		const items: ChecklistItem[] = [
			{label: "Generating brief", status: "running"},
			...Array.from(selectedChannels).map((id) => {
				const ch = channelDefinitions.find((c) => c.id === id);
				return {label: `Generating ${ch?.name || id} content`, status: "pending" as const};
			}),
		];
		setChecklist(items);

		try {
			const res = await fetch("/api/ai/generate-brief-content", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					briefMetadata: {
						coreMessage,
						valueProposition,
						targetAudience: audience,
						metric,
						selectedChannels: Array.from(selectedChannels),
						imageGuidelines: imageGuidelines || undefined,
					},
					taskId: wizard.taskId,
					taskName: wizard.taskTitle,
				}),
			});

			if (!res.ok) throw new Error("Generation failed");

			const data = await res.json();

			setChecklist((prev) => prev.map((item) => ({...item, status: "done" as const})));
			setResultSummary(`Generated brief and ${data.instances?.length || 0} content items.`);
			setStep("done");

			window.dispatchEvent(new CustomEvent("brief-content-generated", {
				detail: {taskId: wizard.taskId, instances: data.instances, brief: data.brief},
			}));
		} catch {
			setChecklist((prev) => prev.map((item) => ({...item, status: item.status === "running" ? "pending" : item.status})));
			setStep("generate");
			opalPanelControls?.addMessage({
				role: "assistant",
				content: "Brief generation failed. Please try again.",
			});
		}
	}, [coreMessage, valueProposition, audience, metric, selectedChannels, imageGuidelines, wizard, opalPanelControls]);

	const handleCancel = useCallback(() => {
		opalPanelControls?.removeMessage(messageId);
	}, [opalPanelControls, messageId]);

	if (step === "foundation") {
		const canNext = coreMessage.trim().length >= 10 && valueProposition.trim().length >= 10;
		return (
			<AdaptiveBlock
				title="Generate Brief"
				subtitle="Step 1 of 3 — Foundation"
				actions={[
					{label: "Cancel", onClick: handleCancel, appearance: "subtle"},
					{label: "Next", onClick: () => setStep("channels"), appearance: "primary", disabled: !canNext},
				]}
			>
				<Box display="flex" flexDirection="column" gap="12">
					<Field label="Core Message">
						<Textarea
							value={coreMessage}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoreMessage(e.target.value)}
							placeholder="What is the key message of this campaign?"
							rows={2}
						/>
					</Field>
					<Field label="Value Proposition">
						<Input
							value={valueProposition}
							onChange={(e) => setValueProposition(e.target.value)}
							placeholder="What value does this offer the audience?"
						/>
					</Field>
					<Field label="Target Audience">
						<Select value={audience} onValueChange={setAudience} options={audienceOptions}>
							<SelectTrigger placeholder="Select audience" />
							<SelectContent />
						</Select>
					</Field>
					<Field label="Campaign Metric">
						<Select value={metric} onValueChange={setMetric} options={metricOptions}>
							<SelectTrigger placeholder="Select metric" />
							<SelectContent />
						</Select>
					</Field>
				</Box>
			</AdaptiveBlock>
		);
	}

	if (step === "channels") {
		return (
			<AdaptiveBlock
				title="Generate Brief"
				subtitle="Step 2 of 3 — Channels"
				actions={[
					{label: "Cancel", onClick: handleCancel, appearance: "subtle"},
					{label: "Back", onClick: () => setStep("foundation"), appearance: "subtle"},
					{label: "Next", onClick: () => setStep("generate"), appearance: "primary", disabled: selectedChannels.size === 0},
				]}
			>
				<Box display="flex" flexDirection="column" gap="8">
					<Text fontSize="sm" color="fg.secondary" mb="4">Select channels to generate content for</Text>
					{channelDefinitions.map((ch) => (
						<Box
							key={ch.id}
							display="flex"
							alignItems="center"
							gap="8"
							p="8"
							rounded="md"
							style={{
								border: selectedChannels.has(ch.id) ? "1px solid var(--ax-colors-border-accent)" : "1px solid var(--ax-colors-border-default)",
								cursor: "pointer",
							}}
							onClick={() => toggleChannel(ch.id)}
						>
							<Checkbox checked={selectedChannels.has(ch.id)} onCheckedChange={() => toggleChannel(ch.id)} />
							<Box>
								<Text fontSize="sm" fontWeight="500">{ch.name}</Text>
								<Text fontSize="xs" color="fg.tertiary">{ch.group}</Text>
							</Box>
						</Box>
					))}
				</Box>
			</AdaptiveBlock>
		);
	}

	if (step === "generate") {
		return (
			<AdaptiveBlock
				title="Generate Brief"
				subtitle="Step 3 of 3 — Generate"
				actions={[
					{label: "Cancel", onClick: handleCancel, appearance: "subtle"},
					{label: "Back", onClick: () => setStep("channels"), appearance: "subtle"},
					{label: "Generate Brief & Content", onClick: handleGenerate, appearance: "primary"},
				]}
			>
				<Box display="flex" flexDirection="column" gap="12">
					<Text fontSize="sm" color="fg.secondary">
						Ready to generate a brief and content for {selectedChannels.size} channel{selectedChannels.size !== 1 ? "s" : ""}.
					</Text>
					<Field label="Image Guidelines (optional)">
						<Textarea
							value={imageGuidelines}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImageGuidelines(e.target.value)}
							placeholder="Any specific guidance for AI-generated images?"
							rows={2}
						/>
					</Field>
				</Box>
			</AdaptiveBlock>
		);
	}

	if (step === "generating") {
		return (
			<AdaptiveBlock title="Generating Brief & Content" subtitle="Please wait...">
				<Box display="flex" flexDirection="column" gap="8">
					{checklist.map((item, i) => (
						<Box key={i} display="flex" alignItems="center" gap="8">
							{item.status === "done" ? (
								<IconCheck size={16} style={{color: "var(--ax-colors-fg-success)"}} />
							) : item.status === "running" ? (
								<IconLoader2 size={16} className="animate-spin" style={{color: "var(--ax-colors-fg-accent)"}} />
							) : (
								<Box style={{width: 16, height: 16, borderRadius: "50%", border: "1px solid var(--ax-colors-border-default)"}} />
							)}
							<Text fontSize="sm" color={item.status === "done" ? "fg.success" : "fg.default"}>
								{item.label}
							</Text>
						</Box>
					))}
				</Box>
			</AdaptiveBlock>
		);
	}

	return (
		<AdaptiveBlock title="Brief Generated" subtitle={resultSummary}>
			<Text fontSize="sm" color="fg.success">
				Content has been generated and added to the task. Switch to the Brief and Content tabs to view.
			</Text>
		</AdaptiveBlock>
	);
};
