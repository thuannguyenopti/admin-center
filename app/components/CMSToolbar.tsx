"use client";

import React, {useState, useEffect} from "react";
import {
	Box,
	Text,
	Button,
	Badge,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Popover,
	PopoverTrigger,
	PopoverContent,
	Radio,
	RadioGroup,
	Checkbox,
	Separator,
	Field,
	Alert,
	toaster,
} from "@optiaxiom/react";
import type {MenuOption} from "@optiaxiom/react";
import {
	IconListTree,
	IconFile,
	IconCloud,
	IconMessage,
	IconLaptopMobile,
	IconChevronDown,
	IconEllipsisSolid,
	IconPlus,
	IconGlobe,
	IconGlobeFilled,
	IconCalendarBolt,
	IconGear,
	IconPaperPlaneTop as IconSend,
	IconSend2,
	IconSendOff,
	IconWorld,
	IconWorldOff,
	IconWorldBolt,
	IconWorldX,
	IconCalendarX,
	IconTrash,
	IconVersions,
	IconStack2,
	IconPen,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconClockRotateLeft,
	IconRestore,
	IconSparkles,
	IconArrowUpRightFromSquare,
	IconShieldPlus,
	IconEye,
	IconWorldCheck,
	IconCalendarCheck,
	IconClock,
} from "@/app/lib/axiom-icons";
import {PreviewSettings} from "./vb/PreviewSettings";
import {IconCalendar, IconPaperPlaneTop, IconTrashCan} from "@optimizely/axiom-icons";
import Link from "next/link";
import usePersistentState from "@/app/usePersistentState";
import {availableAgents, defaultOpalConfiguration} from "@/app/cms/settings/opal-actions/mockData";
import {OpalConfiguration} from "@/app/cms/settings/opal-actions/types";
import {getLocationMenu, getEnabledGroups} from "@/app/cms/settings/opal-actions/helpers";
import {useBrandTone} from "@/app/components/ai/BrandToneProvider";
import {DEFAULT_REVIEWERS} from "@/app/cms/data/approval-workflow";
import {useLayout} from "@/app/context/LayoutContext";
import {usePreflightContext} from "@/app/components/ai/PreflightContext";
import type {PageField} from "@/app/components/ai/PreflightAuditTypes";
import {contentConnectionMenuOptions} from "./ContentConnectionMenuItems";
import {taskAssignmentMenuOptions} from "./TaskAssignmentMenu";
import {initialCmpTasks, type CmpTask} from "@/app/db/cmpInitialData";
import {IconShip} from "@/vendor/axiom-icons/dist";

interface CMSToolbarProps {
	pageName?: string;
	pageId?: string;
	lastSaved?: Date | null;
	pageStatus?: string;
	onPublishConfirm?: (options: { scheduledAt: string | null; runPreflight: boolean }) => void;
	onUnpublish?: () => void;
	onViewOnWebsite?: () => void;
	preflightStatus?: "idle" | "running" | "done" | null;
	preflightRanRecently?: boolean;
	scheduledDate?: string;
	onCancelSchedule?: () => void;
	lastPublishedAt?: string | null;
	lastPublishedBy?: string | null;

	languageOptions?: Array<{label: string; value: string}>;
	variationOptions?: Array<{label: string; value: string}>;
	selectedLanguage?: string;
	selectedVariation?: string;
	onLanguageChange?: (value: string) => void;
	onVariationChange?: (value: string) => void;
	onAddVariation?: () => void;
	onDeleteVariationRequest?: () => void;
	onRenameVariation?: () => void;
	onTrash?: () => void;
	onRenamePage?: () => void;

	onUndo?: () => void;
	onRedo?: () => void;
	onRevert?: () => void;
	onShowVersionHistory?: () => void;

	// ✅ controlled preview state
	preview?: PreviewSettings;
	onPreviewChange?: (patch: Partial<PreviewSettings>) => void;

	contentTypeIcon?: React.ReactNode;

	// Page elements for Brand Tone analysis
	pageElements?: Record<string, {type: string; properties: any}>;
	onUpdateElement?: (elementId: string, propertyKey: string, newValue: string) => void;

	// Content Connection (CMP Integration)
	onConnectContent?: () => void;
	onDisconnectContent?: () => void;
	hasConnection?: boolean;
	compatibleInstancesCount?: number;

	// CMP Task association
	onAddToTask?: (taskId: string, taskName: string) => void;
	onRemoveFromTask?: () => void;
	currentTaskId?: string | null;
	onSyncContent?: () => void;
}

const getStatusIntent = (
	status: string
): "neutral" | "information" | "success" | "warning" | "danger" | "primary" => {
	switch (status) {
		case "Changed":
		case "Draft":
			return "warning";
		case "Scheduled":
		case "In Review":
			return "primary";
		case "Published":
			return "success";
		case "Expired":
		case "Scheduled to expire":
			return "danger";
		case "Archived":
		case "In Trash":
			return "neutral";
		default:
			return "neutral";
	}
};

function MenuRow({icon, label, onClick, intent}: {icon: React.ReactNode; label: string; onClick?: () => void; intent?: "danger"}) {
	const [hovered, setHovered] = useState(false);
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="8"
			px="8"
			py="6"
			rounded="md"
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				cursor: "pointer",
				background: hovered ? "var(--ax-colors-bg-secondary)" : "transparent",
				transition: "background 0.1s",
			}}
		>
			<Box style={{flexShrink: 0, color: intent === "danger" ? "var(--ax-colors-fg-error)" : "var(--ax-colors-fg-tertiary)"}}>
				{icon}
			</Box>
			<Text fontSize="sm" color={intent === "danger" ? "fg.error" : "fg.default"}>{label}</Text>
		</Box>
	);
}

function PublishDropdown({
	onConfirm,
	onViewOnWebsite,
	preflightRanRecently = false,
	preflightStatus,
	lastPublishedAt,
	lastPublishedBy,
}: {
	onConfirm?: (options: { scheduledAt: string | null; runPreflight: boolean }) => void;
	onViewOnWebsite?: () => void;
	preflightRanRecently?: boolean;
	preflightStatus?: "idle" | "running" | "done" | null;
	lastPublishedAt?: string | null;
	lastPublishedBy?: string | null;
}) {
	const [open, setOpen] = useState(false);
	const [timing, setTiming] = useState<"now" | "schedule">("now");
	const [scheduledAt, setScheduledAt] = useState("");
	const [runPreflight, setRunPreflight] = useState(!preflightRanRecently);

	useEffect(() => {
		if (open) {
			setRunPreflight(!preflightRanRecently);
			setTiming("now");
			setScheduledAt("");
		}
	}, [open, preflightRanRecently]);

	const handleConfirm = () => {
		onConfirm?.({
			scheduledAt: timing === "schedule" && scheduledAt ? scheduledAt : null,
			runPreflight,
		});
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				size="lg"
				appearance={preflightStatus === "running" ? "default" : "primary"}
				disabled={preflightStatus === "running"}
			>
				{preflightStatus === "running" ? "Preflight..." : "Publish"}
			</PopoverTrigger>
			<PopoverContent style={{width: 320}}>
				<Box display="flex" flexDirection="column" p="4">
					{/* Section 1: Info */}
					<Box display="flex" flexDirection="column" gap="4" py="8">
						<Text fontSize="md" fontWeight="600" color="fg.default">Publish</Text>
						{lastPublishedAt && (
							<Text fontSize="xs" color="fg.tertiary">
								Last published {lastPublishedAt}{lastPublishedBy ? ` by ${lastPublishedBy}` : ""}
							</Text>
						)}
						{onViewOnWebsite && lastPublishedAt && (
							<MenuRow icon={<IconArrowUpRightFromSquare size={16} />} label="View on website" onClick={onViewOnWebsite} />
						)}
					</Box>
					<Separator />

					{/* Section 2: Preflight & schedule */}
					<Box display="flex" flexDirection="column" gap="12" py="12">
						<Box display="flex" alignItems="start" gap="8">
							<Checkbox
								checked={runPreflight}
								onCheckedChange={(checked) => setRunPreflight(!!checked)}
							/>
							<Box
								display="flex"
								flexDirection="column"
								gap="2"
								style={{cursor: "pointer"}}
								onClick={() => setRunPreflight(!runPreflight)}
							>
								<Text fontSize="md" fontWeight="500" color="fg.default">
									Run preflight review
								</Text>
								<Text fontSize="sm" color="fg.tertiary">
									{preflightRanRecently
										? "Preflight completed recently."
										: "VTs will review SEO, brand, and legal compliance."}
								</Text>
							</Box>
						</Box>

						{runPreflight && (
							<Box display="flex" flexDirection="column" gap="4" ml="32">
								{DEFAULT_REVIEWERS.map((r) => (
									<Box key={r.vtId} display="flex" alignItems="center" gap="8">
										<Box
											style={{
												width: 20,
												height: 20,
												borderRadius: "50%",
												overflow: "hidden",
												background: r.vtAvatarBg,
												flexShrink: 0,
											}}
										>
											<img src={r.vtAvatar} alt={r.vtName} width={20} height={20} style={{display: "block"}} />
										</Box>
										<Text fontSize="sm" color="fg.secondary">{r.vtName}</Text>
										<IconSparkles style={{width: 10, height: 10, color: "var(--ax-colors-fg-tertiary)"}} />
										<Text fontSize="sm" color="fg.tertiary">{r.role}</Text>
									</Box>
								))}
							</Box>
						)}

						{!runPreflight && (
							<>
								<Separator />
								<RadioGroup
									value={timing}
									onValueChange={(v) => setTiming(v as "now" | "schedule")}
									name="publish-timing"
								>
									<Radio value="now">Now</Radio>
									<Radio value="schedule">Schedule</Radio>
								</RadioGroup>

								{timing === "schedule" && (
									<Field label="Date and time">
										<input
											type="datetime-local"
											value={scheduledAt}
											onChange={(e) => setScheduledAt(e.target.value)}
											style={{
												width: "100%",
												padding: "8px 12px",
												borderRadius: 8,
												border: "1px solid var(--ax-colors-border-default)",
												background: "var(--ax-colors-bg-default)",
												color: "var(--ax-colors-fg-default)",
												fontSize: 14,
											}}
										/>
									</Field>
								)}
							</>
						)}
					</Box>

					{/* Section 3: CTA */}
					<Separator />
					<Box display="flex" justifyContent="end" gap="8" pt="12">
						<Button appearance="subtle" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
						<Button appearance="primary" size="sm" onClick={handleConfirm}>
							{runPreflight ? "Confirm" : timing === "schedule" ? "Schedule Publish" : "Publish"}
						</Button>
					</Box>
				</Box>
			</PopoverContent>
		</Popover>
	);
}

function UnpublishDropdown({
	lastPublishedAt,
	lastPublishedBy,
	onViewOnWebsite,
	onUnpublish,
}: {
	lastPublishedAt?: string | null;
	lastPublishedBy?: string | null;
	onViewOnWebsite?: () => void;
	onUnpublish?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [timing, setTiming] = useState<"now" | "schedule">("now");
	const [scheduledAt, setScheduledAt] = useState("");

	useEffect(() => {
		if (open) {
			setTiming("now");
			setScheduledAt("");
		}
	}, [open]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger size="lg" appearance="default">
				Published
			</PopoverTrigger>
			<PopoverContent style={{width: 300}}>
				<Box display="flex" flexDirection="column" p="4">
					{/* Section 1: Info */}
					<Box display="flex" flexDirection="column" gap="4" py="8">
						<Text fontSize="md" fontWeight="600" color="fg.default">Unpublish</Text>
						{lastPublishedAt && (
							<Text fontSize="xs" color="fg.tertiary">
								Published {lastPublishedAt}{lastPublishedBy ? ` by ${lastPublishedBy}` : ""}
							</Text>
						)}
						{onViewOnWebsite && (
							<MenuRow icon={<IconArrowUpRightFromSquare size={16} />} label="View on website" onClick={onViewOnWebsite} />
						)}
					</Box>
					<Separator />

					{/* Section 2: Schedule */}
					<Box display="flex" flexDirection="column" gap="12" py="12">
						<RadioGroup
							value={timing}
							onValueChange={(v) => setTiming(v as "now" | "schedule")}
							name="unpublish-timing"
						>
							<Radio value="now">Now</Radio>
							<Radio value="schedule">Schedule</Radio>
						</RadioGroup>

						{timing === "schedule" && (
							<Field label="Date and time">
								<input
									type="datetime-local"
									value={scheduledAt}
									onChange={(e) => setScheduledAt(e.target.value)}
									style={{
										width: "100%",
										padding: "8px 12px",
										borderRadius: 8,
										border: "1px solid var(--ax-colors-border-default)",
										background: "var(--ax-colors-bg-default)",
										color: "var(--ax-colors-fg-default)",
										fontSize: 14,
									}}
								/>
							</Field>
						)}
					</Box>

					{/* Section 3: CTA */}
					<Separator />
					<Box display="flex" justifyContent="end" gap="8" pt="12">
						<Button appearance="subtle" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
						<Button appearance="danger" size="sm" onClick={() => { onUnpublish?.(); setOpen(false); }}>{timing === "schedule" ? "Schedule Unpublish" : "Unpublish"}</Button>
					</Box>
				</Box>
			</PopoverContent>
		</Popover>
	);
}

function ScheduledDropdown({
	scheduledDate,
	onCancelSchedule,
	onPublishNow,
	onReschedule,
}: {
	scheduledDate: string;
	onCancelSchedule?: () => void;
	onPublishNow?: () => void;
	onReschedule?: (date: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<"main" | "reschedule">("main");
	const [newDate, setNewDate] = useState(scheduledDate);

	useEffect(() => {
		if (open) {
			setMode("main");
			setNewDate(scheduledDate);
		}
	}, [open, scheduledDate]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger size="lg" appearance="default">
				Scheduled
			</PopoverTrigger>
			<PopoverContent style={{width: 300}}>
				<Box display="flex" flexDirection="column" p="4">
					{/* Section 1: Schedule info */}
					<Box display="flex" flexDirection="column" gap="4" py="8">
						<Text fontSize="md" fontWeight="600" color="fg.default">Scheduled</Text>
						<Text fontSize="xs" color="fg.tertiary">
							Publishing on {new Date(scheduledDate).toLocaleString()}
						</Text>
					</Box>
					<Separator />

					{mode === "main" ? (
						<>
							{/* Section 2: Options */}
							<Box display="flex" flexDirection="column" gap="2" py="8">
								<MenuRow icon={<IconWorldCheck size={16} />} label="Publish now" onClick={() => { onPublishNow?.(); setOpen(false); }} />
								<MenuRow icon={<IconClock size={16} />} label="Reschedule" onClick={() => setMode("reschedule")} />
							</Box>
							<Separator />

							{/* Section 3: CTA */}
							<Box py="8">
								<MenuRow icon={<IconCalendarX size={16} />} label="Cancel schedule" onClick={() => { onCancelSchedule?.(); setOpen(false); }} intent="danger" />
							</Box>
						</>
					) : (
						<>
							{/* Reschedule mode */}
							<Box display="flex" flexDirection="column" gap="12" py="12">
								<Field label="New date and time">
									<input
										type="datetime-local"
										value={newDate}
										onChange={(e) => setNewDate(e.target.value)}
										style={{
											width: "100%",
											padding: "8px 12px",
											borderRadius: 8,
											border: "1px solid var(--ax-colors-border-default)",
											background: "var(--ax-colors-bg-default)",
											color: "var(--ax-colors-fg-default)",
											fontSize: 14,
										}}
									/>
								</Field>
							</Box>
							<Separator />
							<Box display="flex" justifyContent="end" gap="8" pt="12">
								<Button appearance="subtle" size="sm" onClick={() => setMode("main")}>Back</Button>
								<Button
									appearance="primary"
									size="sm"
									onClick={() => { onReschedule?.(newDate); setOpen(false); }}
									disabled={!newDate}
								>
									Reschedule
								</Button>
							</Box>
						</>
					)}
				</Box>
			</PopoverContent>
		</Popover>
	);
}

export default function CMSToolbar({
	pageName = "New Page",
	pageId,
	lastSaved = null,
	pageStatus = "Draft",
	onPublishConfirm,
	onUnpublish,
	onViewOnWebsite,

	languageOptions = [
		{label: "English (Main)", value: "en"},
		{label: "Spanish", value: "es"},
		{label: "French", value: "fr"},
	],
	variationOptions = [
		{label: "Original", value: "original"},
		{label: "Variation A", value: "a"},
		{label: "Variation B", value: "b"},
	],
	selectedLanguage = "en",
	selectedVariation = "original",
	onLanguageChange = () => {},
	onVariationChange = () => {},
	onAddVariation,
	onDeleteVariationRequest,
	onRenameVariation,
	onTrash,
	onRenamePage,

	onUndo,
	onRedo,
	onRevert,
	onShowVersionHistory,

	preview = {mode: "scale", width: 1440},
	onPreviewChange = () => {},

	contentTypeIcon,
	pageElements,
	onUpdateElement,

	onConnectContent,
	onDisconnectContent,
	hasConnection = false,
	compatibleInstancesCount = 0,

	onAddToTask,
	onRemoveFromTask,
	currentTaskId = null,
	preflightStatus = null,
	preflightRanRecently = false,
	scheduledDate,
	onCancelSchedule,
	lastPublishedAt = null,
	lastPublishedBy = null,
}: CMSToolbarProps) {
	const currentLanguage = languageOptions.find((opt) => opt.value === selectedLanguage);
	const currentVariation = variationOptions.find((opt) => opt.value === selectedVariation);

	const previewLabel =
		preview.mode === "responsive"
			? "Responsive"
			: preview.mode === "scale"
				? `Scale (${preview.width}px)`
				: `${preview.width}px`;

	const previewOptions = [
		{
			label: "Responsive (reflow)",
			execute: () => onPreviewChange({mode: "responsive", maxWidth: 1100}),
			selected: preview.mode === "responsive",
		},
		{label: "Desktop 1440", execute: () => onPreviewChange({mode: "scale", width: 1440}), selected: preview.mode === "scale" && preview.width === 1440},
		{label: "Desktop 1100", execute: () => onPreviewChange({mode: "scale", width: 1100}), selected: preview.mode === "scale" && preview.width === 1100},
		{label: "Tablet 768", execute: () => onPreviewChange({mode: "scale", width: 768}), selected: preview.mode === "scale" && preview.width === 768},
		{label: "Mobile 390", execute: () => onPreviewChange({mode: "scale", width: 390}), selected: preview.mode === "scale" && preview.width === 390},
	];

	const isVariation = selectedVariation !== "original";

	// CMP Tasks for "Add to task" submenu
	const [cmpTasks] = usePersistentState("cmpTasks", initialCmpTasks) as [CmpTask[], any];

	// Get enabled Opal Actions for Improve button and context menu
	const [opalConfig] = usePersistentState("opal-config", defaultOpalConfiguration) as [
		OpalConfiguration,
		any,
	];
	const {analyzePage} = useBrandTone();
	const {opalPanelControls} = useLayout();
	const {initializeContext} = usePreflightContext();

	const improveMenu = getLocationMenu(opalConfig, "toolbar-improve");
	const improveGroups = getEnabledGroups(improveMenu);

	const contextMenu = getLocationMenu(opalConfig, "toolbar-context");
	const contextMenuGroups = getEnabledGroups(contextMenu);

	// Extract text content from page elements
	const getPageFields = () => {
		if (!pageElements) {
			return [];
		}

		const fields: Array<{
			fieldId: string;
			fieldLabel: string;
			text: string;
			src?: string;
			alt?: string;
		}> = [];

		Object.entries(pageElements).forEach(([elementId, element]) => {
			// Extract text from various property types
			let text = "";
			let label = element.type || "Element";
			let src: string | undefined;
			let alt: string | undefined;

			// Check for image elements
			if (element.type === "ct-image") {
				src = element.properties.src?.value || "";
				alt = element.properties.alt?.value || "";
				text = alt || src || "Image";
				label = "Image";
			}
			// Common text properties
			else if (element.properties.text?.value) {
				text = element.properties.text.value;
				label =
					element.type === "heading"
						? "Heading"
						: element.type === "text"
							? "Text"
							: element.type === "button"
								? "Button"
								: element.type;
			} else if (element.properties.content?.value) {
				text = element.properties.content.value;
			} else if (element.properties.label?.value) {
				text = element.properties.label.value;
				label = "Label";
			} else if (element.properties.title?.value) {
				text = element.properties.title.value;
				label = "Title";
			}

			// Include elements with text content or image elements
			if ((text && text.trim()) || src !== undefined) {
				fields.push({
					fieldId: elementId,
					fieldLabel: label,
					text: text.trim(),
					src,
					alt,
				});
			}
		});

		return fields;
	};

	// Handlers for applying brand tone suggestions
	const handleApplyField = (fieldId: string, suggestion: string) => {
		console.log(`[CMSToolbar] Apply to field ${fieldId}:`, suggestion);

		if (onUpdateElement && pageElements?.[fieldId]) {
			const element = pageElements[fieldId];

			// Find which property contains the text and update it
			if (element.properties.text?.value) {
				onUpdateElement(fieldId, "text", suggestion);
			} else if (element.properties.content?.value) {
				onUpdateElement(fieldId, "content", suggestion);
			} else if (element.properties.label?.value) {
				onUpdateElement(fieldId, "label", suggestion);
			} else if (element.properties.title?.value) {
				onUpdateElement(fieldId, "title", suggestion);
			}
		}
	};

	const handleApplyAll = (changes: Array<{fieldId: string; suggestion: string}>) => {
		console.log("[CMSToolbar] Apply all changes:", changes);

		changes.forEach(({fieldId, suggestion}) => {
			handleApplyField(fieldId, suggestion);
		});
	};

	const handleBrandToneAnalysis = () => {
		const fields = getPageFields();

		if (fields.length === 0) {
			toaster.create("No text content found on the page", {intent: "warning"});
			return;
		}

		// Create field-to-element mapping (fieldId is already the elementId)
		const fieldToElementMap: Record<string, string> = {};
		fields.forEach((field) => {
			fieldToElementMap[field.fieldId] = field.fieldId;
		});

		console.log("[CMSToolbar] Brand tone analysis:", {
			fieldsCount: fields.length,
			fields: fields.map((f) => ({
				id: f.fieldId,
				label: f.fieldLabel,
				textLength: f.text.length,
			})),
			mapping: fieldToElementMap,
		});

		analyzePage(fields, fieldToElementMap, handleApplyField, handleApplyAll);
	};

	const handlePreflightAudit = async () => {
		if (!opalPanelControls) {
			console.error("[CMSToolbar] Opal panel controls not available");
			toaster.create("Opal panel is not ready. Please try again.", {intent: "danger"});
			return;
		}

		const fields = getPageFields();

		if (fields.length === 0) {
			toaster.create("No text content found on the page", {intent: "warning"});
			return;
		}

		// Create field-to-element mapping (fieldId is already the elementId)
		const fieldToElementMap: Record<string, string> = {};
		fields.forEach((field) => {
			fieldToElementMap[field.fieldId] = field.fieldId;
		});

		// Get current page URL
		const pageUrl = window.location.href;

		console.log("[CMSToolbar] Starting preflight audit:", {
			fieldsCount: fields.length,
			pageUrl,
		});

		// 1. Initialize PreflightContext (makes data available to chat components)
		initializeContext({
			fields,
			pageUrl,
			fieldToElementMap,
			onApplyField: handleApplyField,
			onApplyAll: handleApplyAll,
		});

		// 2. Open Opal chat panel
		opalPanelControls.openPanel();

		// 3. Add user message showing @preflight workflow
		opalPanelControls.addMessage({
			role: "user",
			content: "@preflight workflow",
		});

		// 4. Add initial progress message (checklist with all pending)
		const progressMessage = opalPanelControls.addMessage({
			role: "assistant",
			content: "Running preflight audit...",
			messageType: "preflight-progress",
			metadata: {
				checklist: [
					{label: "Proofreading", status: "pending"},
					{label: "Brand Tone", status: "pending"},
					{label: "Required Fields", status: "pending"},
					{label: "Missing Alt-Text", status: "pending"},
					{label: "Broken Links", status: "pending"},
					{label: "Missing Images", status: "pending"},
					{label: "SEO Audit", status: "pending"},
					{label: "GEO Audit", status: "pending"},
					{label: "Content Freshness", status: "pending"},
				],
			},
		});

		// 5. Connect to SSE stream
		try {
			const response = await fetch("/api/preflight-audit/stream", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({fields, pageUrl}),
			});

			if (!response.ok) {
				throw new Error("Failed to start preflight audit");
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("No response body");
			}

			let buffer = "";

			while (true) {
				const {done, value} = await reader.read();

				if (done) break;

				buffer += decoder.decode(value, {stream: true});

				// Process complete SSE messages
				const lines = buffer.split("\n\n");
				buffer = lines.pop() || ""; // Keep incomplete message in buffer

				for (const line of lines) {
					if (!line.trim()) continue;

					const eventMatch = line.match(/^event: (.+)$/m);
					const dataMatch = line.match(/^data: (.+)$/m);

					if (eventMatch && dataMatch) {
						const eventType = eventMatch[1];
						const data = JSON.parse(dataMatch[1]);

						if (eventType === "checklist") {
							// Update progress message with new checklist state
							opalPanelControls.updateMessage(progressMessage.id, {
								metadata: {checklist: data},
							});
						} else if (eventType === "results") {
							// Remove progress message, add results message
							opalPanelControls.removeMessage(progressMessage.id);
							opalPanelControls.addMessage({
								role: "assistant",
								content: `Found ${data.totalIssues} issue${data.totalIssues !== 1 ? "s" : ""} (${data.criticalCount} critical, ${data.highCount} high).`,
								messageType: "preflight-results",
								metadata: {auditResult: data},
							});
						}
					}
				}
			}
		} catch (error) {
			console.error("[CMSToolbar] Preflight audit failed:", error);
			opalPanelControls.updateMessage(progressMessage.id, {
				content: "❌ Preflight audit failed. Please try again.",
				messageType: undefined,
				metadata: undefined,
			});
		}
	};

	return (
		<Box
			w="full"
			gridColumn="2"
			display="flex"
			flexDirection="column"
			borderB="1"
			borderColor="border.tertiary"
		>
		<Box
			w="full"
			pl="24"
			pr="12"
			py="12"
			display="flex"
			alignItems="center"
			gap="8"
			justifyContent="space-between"
			style={{minHeight: "64px"}}
			bg="bg.default"
		>
			{/* Left Section */}
			<Box display="flex" alignItems="center" gap="16">
				<Link href="/cms/edit/">
					<Button
						appearance="default"
						icon={<IconListTree size={16} />}
						aria-label="Toggle tree view"
					/>
				</Link>
				<Box gap="8" display="flex" alignItems="center" color="fg.default">
					{contentTypeIcon || <IconFile size={16} />}
					<Text
						fontSize="md"
						fontWeight="600"
						color="fg.default"
						onClick={onRenamePage}
						cursor="text"
					>
						{pageName}
					</Text>
				</Box>

				{/* Status Badge */}
				<Badge intent={getStatusIntent(pageStatus)} variant="subtle">
					{pageStatus}
				</Badge>

				{/* Save Status with Dropdown */}
				<Menu
					options={[
						{
							label: "Undo",
							addon: <IconArrowBackUp size={16} />,
							execute: onUndo || (() => {}),
						},
						{
							label: "Redo",
							addon: <IconArrowForwardUp size={16} />,
							execute: onRedo || (() => {}),
						},
						{
							label: "Revert to saved",
							addon: <IconRestore size={16} />,
							execute: onRevert || (() => {}),
							group: {label: "history", hidden: true, separator: true},
						},
						{
							label: "Version history",
							addon: <IconClockRotateLeft size={16} />,
							execute: onShowVersionHistory || (() => {}),
							group: {label: "history", hidden: true, separator: true},
						},
					]}
				>
					<MenuTrigger asChild>
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							cursor="pointer"
							rounded="sm"
							px="4"
							py="2"
							className="hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors"
						>
							<IconCloud size={14} style={{opacity: 0.5}} />
							<Text fontSize="sm" color="fg.tertiary">
								Saved
							</Text>
						</Box>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>

			{/* Right Section */}
			<Box display="flex" alignItems="center" gap="8">
				{/* Language Filter */}
				<Menu
					options={languageOptions.map((opt) => ({
						label: opt.label,
						execute: () => onLanguageChange(opt.value),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Language" h="40">
							{currentLanguage?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Variation Filter */}
				<Menu
					options={[
						...variationOptions.map((opt) => ({
							label: opt.label,
							execute: () => onVariationChange(opt.value),
						})),
						...(onAddVariation
							? [
									{
										group: {label: "end", hidden: true, separator: true},
										label: "Add Variation",
										addon: <IconStack2 size={16} />,
										execute: onAddVariation,
									},
								]
							: []),
					]}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Variation" h="40">
							{currentVariation?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Button
					size="lg"
					appearance="default"
					icon={<IconMessage />}
					aria-label="Comments"
				/>

				{/* Preview Button */}
				<Menu options={previewOptions}>
					<MenuTrigger
						appearance="default"
						icon={<IconEye />}
						size="lg"
						aria-label="Preview"
					/>
					<MenuContent />
				</Menu>

				{/* Improve Button with Opal Actions */}
				{improveGroups.length > 0 && (
					<Menu
						options={improveGroups.map((group): MenuOption => {
							if (group.agents.length > 1) {
								return {
									label: group.name,
									subOptions: group.agents.map((groupAgent) => {
										const agent = availableAgents.find(
											(a) => a.id === groupAgent.id
										);
										return {
											label: agent?.name || groupAgent.id,
											execute: () => {
												if (groupAgent.id === "preflight-audit") {
													handlePreflightAudit();
												} else if (groupAgent.id === "brand-tone-audit") {
													handleBrandToneAnalysis();
												} else {
													console.log(
														"Execute Opal Action:",
														group.name,
														"- Agent:",
														agent?.name
													);
												}
											},
										};
									}),
								};
							}
							const singleAgent = group.agents[0];
							return {
								label: group.name,
								execute: () => {
									if (singleAgent.id === "preflight-audit") {
										handlePreflightAudit();
									} else if (singleAgent.id === "brand-tone-audit") {
										handleBrandToneAnalysis();
									} else {
										console.log("Execute Opal Action:", group.name);
									}
								},
							};
						})}
					>
						<MenuTrigger
							appearance="default"
							icon={<IconSparkles />}
							size="lg"
							aria-label="Improve"
						/>
						<MenuContent />
					</Menu>
				)}

				{/* Publish / Unpublish / Scheduled */}
				{pageStatus === "Published" ? (
					<UnpublishDropdown
						lastPublishedAt={lastPublishedAt}
						lastPublishedBy={lastPublishedBy}
						onViewOnWebsite={onViewOnWebsite}
						onUnpublish={onUnpublish}
					/>
				) : pageStatus === "Scheduled" && scheduledDate ? (
					<ScheduledDropdown
						scheduledDate={scheduledDate}
						onCancelSchedule={onCancelSchedule}
						onPublishNow={onPublishConfirm ? () => onPublishConfirm({scheduledAt: null, runPreflight: false}) : undefined}
						onReschedule={onPublishConfirm ? (date) => onPublishConfirm({scheduledAt: date, runPreflight: false}) : undefined}
					/>
				) : (
					<PublishDropdown
						onConfirm={onPublishConfirm}
						onViewOnWebsite={onViewOnWebsite}
						preflightRanRecently={preflightRanRecently}
						preflightStatus={preflightStatus}
						lastPublishedAt={lastPublishedAt}
						lastPublishedBy={lastPublishedBy}
					/>
				)}

				{/* Options */}
				<Menu
					options={[
						...(contextMenuGroups.length > 0
							? [
									{
										label: "Opal",
										addon: <IconSparkles size={16} />,
										subOptions: contextMenuGroups.map((group): MenuOption => {
											if (group.agents.length > 1) {
												return {
													label: group.name,
													subOptions: group.agents.map((groupAgent) => {
														const agent = availableAgents.find(
															(a) => a.id === groupAgent.id
														);
														return {
															label: agent?.name || groupAgent.id,
															execute: () => {
																if (
																	groupAgent.id ===
																	"brand-tone-audit"
																) {
																	handleBrandToneAnalysis();
																} else {
																	console.log(
																		"Execute Opal Action:",
																		group.name,
																		"- Agent:",
																		agent?.name
																	);
																}
															},
														};
													}),
												};
											}
											const singleAgent = group.agents[0];
											return {
												label: group.name,
												execute: () => {
													if (singleAgent.id === "brand-tone-audit") {
														handleBrandToneAnalysis();
													} else {
														console.log(
															"Execute Opal Action:",
															group.name
														);
													}
												},
											};
										}),
									} satisfies MenuOption,
								]
							: []),
						...contentConnectionMenuOptions({
							onConnectContent,
							onDisconnectContent,
							hasConnection,
							compatibleInstancesCount,
						}),
						...(onViewOnWebsite
							? [
									{
										label: "View on website",
										addon: <IconWorld size={16} />,
										detail: <IconArrowUpRightFromSquare size={16} />,
										execute: onViewOnWebsite,
										group: {label: "Page", separator: true},
									} satisfies MenuOption,
								]
							: []),
						{
							label: "Rename",
							addon: <IconPen size={16} />,
							execute: onRenamePage,
							group: {label: "Page", separator: true},
						},
						...(onAddToTask
							? taskAssignmentMenuOptions({
									currentTaskId,
									tasks: cmpTasks,
									onAddToTask,
									onRemoveFromTask,
								})
							: []),
						{
							label: "Move to trash",
							addon: <IconTrash size={16} />,
							intent: "danger",
							execute: onTrash,
							group: {label: "Page", separator: true},
						},
						...(isVariation
							? [
									{
										label: "Rename Variation",
										addon: <IconStack2 size={16} />,
										execute: onRenameVariation,
										group: {label: "Variation", separator: true},
									} satisfies MenuOption,
									{
										label: "Delete Variation",
										addon: <IconTrash size={16} />,
										intent: "danger",
										execute: onDeleteVariationRequest,
										group: {label: "Variation", separator: true},
									} satisfies MenuOption,
								]
							: []),
					]}
				>
					<MenuTrigger
						aria-label={"Status " + pageStatus}
						size="lg"
						icon={<IconEllipsisSolid size={16} />}
					/>
					<MenuContent />
				</Menu>
			</Box>
		</Box>
		{pageStatus === "Scheduled" && scheduledDate && (
			<Alert intent="information" py="12" px="20">
				<Box display="flex" alignItems="center" gap="8" w="full">
					<Text fontSize="sm">
						Scheduled to publish on {new Date(scheduledDate).toLocaleString()}
					</Text>
					<Box flex="1" />
					{onCancelSchedule && (
						<Button appearance="subtle" size="sm" onClick={onCancelSchedule}>
							Cancel schedule
						</Button>
					)}
				</Box>
			</Alert>
		)}
		</Box>
	);
}
