"use client";

import React, { useState } from "react";
import { Box, Button, Field, Input } from "@optiaxiom/react";
import type { AdaptiveBlockComponentProps } from "../AdaptiveBlockRegistry";
import { useFormBuilderActions } from "@/app/cmp/settings/templates/form/context/FormBuilderActionsContext";
import { useLayout } from "@/app/context/LayoutContext";

export type FormBuildQuestionsBlockMetadata = {
	blockType: "form-build-questions";
};

const PURPOSES = ["Work request", "Campaign brief", "Creative review", "Approval workflow", "Other"];
const AUDIENCES = ["Marketing team", "External agency", "Internal teams", "Anyone in the org"];
const REQUIREMENTS = [
	"Project details (name, description, dates)",
	"Budget & costs",
	"Approvals & sign-offs",
	"File uploads & assets",
	"Team & ownership",
	"Priority & urgency",
];

const STEP_LABELS = ["About your form", "Who fills it out?", "What to collect?"];

export const FormBuildQuestionsBlock: React.FC<AdaptiveBlockComponentProps> = () => {
	const actions = useFormBuilderActions();
	const { opalPanelControls } = useLayout();

	const [step, setStep] = useState(0);
	const [purpose, setPurpose] = useState("");
	const [purposeOther, setPurposeOther] = useState("");
	const [audience, setAudience] = useState("");
	const [requirements, setRequirements] = useState<string[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [done, setDone] = useState(false);

	const toggleRequirement = (r: string) => {
		setRequirements((prev) =>
			prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
		);
	};

	const handleGenerate = async () => {
		setIsGenerating(true);
		const description = [
			`Form purpose: ${purpose === "Other" ? purposeOther : purpose}`,
			`Filled out by: ${audience}`,
			requirements.length > 0 ? `Must collect: ${requirements.join(", ")}` : null,
		]
			.filter(Boolean)
			.join(". ");

		const loadingMsg = opalPanelControls?.addMessage({
			role: "assistant",
			content: "Generating your form…",
		});

		try {
			const res = await fetch("/api/generate-form", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ description }),
			});
			const data = await res.json();
			if (loadingMsg) {
				opalPanelControls?.updateMessage(loadingMsg.id, {
					content: `Here's your form. Click "Apply to canvas" to add it.`,
					messageType: "form-generated",
					metadata: {
						fieldCount: data.fieldCount ?? (data.nodes?.length ?? 0),
						sectionCount: 0,
						nodes: data.nodes ?? [],
						edges: data.edges ?? [],
					},
				});
			}
		} catch {
			if (loadingMsg) {
				opalPanelControls?.updateMessage(loadingMsg.id, {
					content: "Sorry, I couldn't generate the form. Try dragging fields manually.",
				});
			}
		}
		setIsGenerating(false);
		setDone(true);
	};

	if (done) {
		return (
			<Box
				p="12"
				rounded="md"
				style={{
					border: "1px solid var(--ax-colors-border-default)",
					fontSize: "13px",
					color: "var(--ax-colors-fg-secondary)",
				}}
			>
				Form generation started — see the result above.
			</Box>
		);
	}

	return (
		<Box
			bg="bg.default"
			rounded="lg"
			style={{ border: "1px solid var(--ax-colors-border-tertiary)" }}
			overflow="hidden"
		>
			{/* Block header */}
			<Box
				px="16"
				py="8"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", minHeight: 40 }}
			>
				<Box display="flex" alignItems="center" gap="8">
					<Box style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 12 }}>›</Box>
					<Box style={{ fontWeight: 600, fontSize: 16, color: "var(--ax-colors-fg-default)" }}>
						{STEP_LABELS[step]}
					</Box>
				</Box>
				<Box style={{ fontSize: 12, color: "var(--ax-colors-fg-secondary)" }}>
					({step + 1} of 3)
				</Box>
			</Box>

			{/* Step content */}
			<Box p="16" display="flex" flexDirection="column" gap="16">
				{step === 0 && (
					<>
						<Box>
							<Box style={{ fontWeight: 600, fontSize: 14, color: "var(--ax-colors-fg-default)", marginBottom: 4 }}>
								What is this form for?
							</Box>
							<Box style={{ fontSize: 14, color: "var(--ax-colors-fg-secondary)", marginBottom: 12 }}>
								Select the best description of this form's purpose.
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								{PURPOSES.map((p) => (
									<button
										key={p}
										onClick={() => setPurpose(p)}
										style={{
											padding: "7px 12px",
											borderRadius: 6,
											border: `1px solid ${purpose === p ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
											background: purpose === p ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
											fontSize: 13,
											color: "var(--ax-colors-fg-default)",
											cursor: "pointer",
											textAlign: "left",
										}}
									>
										{p}
									</button>
								))}
							</Box>
							{purpose === "Other" && (
								<Box mt="8">
									<Field label="Describe the purpose">
										<Input
											placeholder="e.g. Onboarding checklist for new clients"
											value={purposeOther}
											onChange={(e) => setPurposeOther(e.target.value)}
										/>
									</Field>
								</Box>
							)}
						</Box>
					</>
				)}

				{step === 1 && (
					<Box>
						<Box style={{ fontWeight: 600, fontSize: 14, color: "var(--ax-colors-fg-default)", marginBottom: 4 }}>
							Who fills this form out?
						</Box>
						<Box style={{ fontSize: 14, color: "var(--ax-colors-fg-secondary)", marginBottom: 12 }}>
							This helps Opal tailor the fields and language.
						</Box>
						<Box display="flex" flexDirection="column" gap="6">
							{AUDIENCES.map((a) => (
								<button
									key={a}
									onClick={() => setAudience(a)}
									style={{
										padding: "7px 12px",
										borderRadius: 6,
										border: `1px solid ${audience === a ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
										background: audience === a ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
										fontSize: 13,
										color: "var(--ax-colors-fg-default)",
										cursor: "pointer",
										textAlign: "left",
									}}
								>
									{a}
								</button>
							))}
						</Box>
					</Box>
				)}

				{step === 2 && (
					<Box>
						<Box style={{ fontWeight: 600, fontSize: 14, color: "var(--ax-colors-fg-default)", marginBottom: 4 }}>
							What do you need to collect?
						</Box>
						<Box style={{ fontSize: 14, color: "var(--ax-colors-fg-secondary)", marginBottom: 12 }}>
							Select all that apply — Opal will include these fields.
						</Box>
						<Box display="flex" flexDirection="column" gap="6">
							{REQUIREMENTS.map((r) => {
								const checked = requirements.includes(r);
								return (
									<button
										key={r}
										onClick={() => toggleRequirement(r)}
										style={{
											padding: "7px 12px",
											borderRadius: 6,
											border: `1px solid ${checked ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
											background: checked ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
											fontSize: 13,
											color: "var(--ax-colors-fg-default)",
											cursor: "pointer",
											textAlign: "left",
											display: "flex",
											alignItems: "center",
											gap: 8,
										}}
									>
										<span style={{
											width: 14,
											height: 14,
											borderRadius: 3,
											border: `1.5px solid ${checked ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
											background: checked ? "var(--ax-colors-bg-accent)" : "transparent",
											flexShrink: 0,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}>
											{checked && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
										</span>
										{r}
									</button>
								);
							})}
						</Box>
					</Box>
				)}

				{/* Navigation */}
				<Box display="flex" justifyContent="end" gap="8" pt="4">
					{step > 0 && (
						<Button size="sm" appearance="subtle" onClick={() => setStep((s) => s - 1)}>
							Back
						</Button>
					)}
					{step < 2 ? (
						<Button
							size="sm"
							onClick={() => setStep((s) => s + 1)}
							disabled={
								(step === 0 && !purpose) ||
								(step === 0 && purpose === "Other" && !purposeOther.trim()) ||
								(step === 1 && !audience)
							}
						>
							Next
						</Button>
					) : (
						<Button
							size="sm"
							onClick={handleGenerate}
							disabled={isGenerating}
							style={{
								background: isGenerating ? undefined : "linear-gradient(164deg, #392ecf 16%, #7740ec 85%)",
								border: "none",
								borderRadius: "999px",
								color: "#fff",
							}}
						>
							{isGenerating ? "Generating…" : "Generate form"}
						</Button>
					)}
				</Box>
			</Box>
		</Box>
	);
};
