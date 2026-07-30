"use client";

import {useState} from "react";
import {
	Box,
	Text,
	Button,
	Badge,
	Switch,
	Tooltip,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
} from "@optiaxiom/react";
import {IconCircleInfo, IconCircleUser, IconFile, IconCopy, IconFileZipper} from "@optiaxiom/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentExportData {
	name: string;
	handle: string;
	emoji?: string;
	description?: string;
	tags?: Array<{label: string; intent?: string; bg?: string; color?: string}>;
	[key: string]: unknown;
}

interface ExportAgentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: AgentExportData | null;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_FILES = [
	{name: "Brand-Voice-Guidelines-2026.pdf", size: "2.4 MB"},
	{name: "Approved-Terminology.csv", size: "148 KB"},
	{name: "Logo-Usage-Rules.docx", size: "512 KB"},
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportAgentDialog({open, onOpenChange, agent}: ExportAgentDialogProps) {
	const [includeEvalExamples, setIncludeEvalExamples] = useState(true);
	const [copied, setCopied] = useState(false);

	function buildExportPayload() {
		if (!agent) return {};
		// Strip any non-serialisable fields and include the options flag
		const {...rest} = agent;
		return {
			...rest,
			exportOptions: {
				includeEvalExamples,
			},
		};
	}

	function handleCopyJSON() {
		const payload = buildExportPayload();
		navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function handleDownloadZip() {
		if (!agent) return;
		const payload = buildExportPayload();
		const blob = new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${agent.handle || "agent"}.zip`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>Download Agent</DialogHeader>

				<DialogBody>
					{/* ── Section 1: Agents Included ── */}
					<Box display="flex" alignItems="center" gap="8" mb="12">
						<Text
							fontSize="xs"
							fontWeight="500"
							color="fg.tertiary"
							style={{letterSpacing: "0.06em"}}
						>
							AGENTS INCLUDED
						</Text>
						<Tooltip
							delayDuration={300}
							content="The agent configuration that will be exported"
						>
							<span style={{display: "inline-flex"}}>
								<IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
							</span>
						</Tooltip>
					</Box>

					{agent && (
						<Box
							display="flex"
							alignItems="center"
							gap="12"
							p="12"
							bg="bg.secondary"
							rounded="md"
						>
							{/* Avatar */}
							<Box
								rounded="md"
								style={{
									width: 32,
									height: 32,
									background: "var(--ax-colors-bg-information-subtle)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<IconCircleUser size={16} color="var(--ax-colors-fg-information-strong)" />
							</Box>
							{/* Agent meta */}
							<Box>
								<Text fontWeight="500">{agent.name}</Text>
								<Text fontSize="sm" color="fg.secondary">
									{agent.handle}
								</Text>
							</Box>
						</Box>
					)}

					{/* ── Divider ── */}
					<Box
						my="16"
						style={{height: 1, background: "var(--ax-colors-border-secondary)"}}
					/>

					{/* ── Section 2: Files Included ── */}
					{MOCK_FILES.length > 0 && (
						<>
							<Box display="flex" alignItems="center" gap="8" mb="8">
								<Text
									fontSize="xs"
									fontWeight="500"
									color="fg.tertiary"
									style={{letterSpacing: "0.06em"}}
								>
									FILES INCLUDED
								</Text>
								<Badge>{MOCK_FILES.length} files</Badge>
							</Box>

							<Box mt="8">
								{MOCK_FILES.map((file) => (
									<Box
										key={file.name}
										display="flex"
										justifyContent="space-between"
										alignItems="center"
										py="10"
										px="12"
										bg="bg.secondary"
										rounded="md"
										mb="4"
									>
										<Box display="flex" alignItems="center" gap="8">
											<IconFile
												size={16}
												color="var(--ax-colors-fg-secondary)"
											/>
											<Text fontSize="sm">{file.name}</Text>
										</Box>
										<Text fontSize="sm" color="fg.secondary">
											{file.size}
										</Text>
									</Box>
								))}
							</Box>

							{/* ── Divider ── */}
							<Box
								my="16"
								style={{height: 1, background: "var(--ax-colors-border-secondary)"}}
							/>
						</>
					)}

					{/* ── Section 3: Options ── */}
					<Text
						fontSize="xs"
						fontWeight="500"
						color="fg.tertiary"
						mb="12"
						style={{letterSpacing: "0.06em"}}
					>
						OPTIONS
					</Text>

					<Switch checked={includeEvalExamples} onCheckedChange={setIncludeEvalExamples}>
						Include output evaluation examples
					</Switch>

					<Box ml="40" mt="4">
						<Text fontSize="sm" color="fg.secondary">
							If output evaluation examples have been added to a specialized agent,
							they will be included in the export.
						</Text>
					</Box>

					{/* ── Divider ── */}
					<Box
						my="16"
						style={{height: 1, background: "var(--ax-colors-border-secondary)"}}
					/>

					{/* ── Info Banner ── */}
					<Box
						display="flex"
						alignItems="center"
						gap="8"
						p="12"
						rounded="md"
						style={{
							background: "var(--ax-colors-bg-information-subtle)",
							border: "1px solid var(--ax-colors-border-information-subtle)",
						}}
					>
						<IconCircleInfo
							size={16}
							color="var(--ax-colors-fg-information-default)"
							style={{flexShrink: 0}}
						/>
						<Text fontSize="sm">
							Files are only included in the ZIP download, not in the JSON copy.
						</Text>
					</Box>
				</DialogBody>

				<DialogFooter>
					<DialogClose asChild>
						<Button appearance="subtle">Cancel</Button>
					</DialogClose>
					<Button
						appearance="default"
						icon={<IconCopy />}
						iconPosition="start"
						onClick={handleCopyJSON}
					>
						{copied ? "Copied!" : "Copy as JSON (without files)"}
					</Button>
					<Button
						appearance="primary"
						icon={<IconFileZipper />}
						iconPosition="start"
						onClick={handleDownloadZip}
					>
						Download as ZIP
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
