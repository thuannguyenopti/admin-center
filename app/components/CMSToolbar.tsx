"use client";

import React from "react";
import {
	Box,
	Text,
	Button,
	Badge,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	toaster,
} from "@optiaxiom/react";
import type {MenuOption} from "@optiaxiom/react";
import {
	IconListTree,
	IconFile,
	IconCloud,
	IconMessage,
	IconDevices,
	IconChevronDown,
	IconDots,
	IconPlus,
	IconGlobe,
	IconGlobeFilled,
	IconCalendarBolt,
	IconSettings,
	IconSend,
	IconSend2,
	IconSendOff,
	IconWorld,
	IconWorldOff,
	IconWorldBolt,
	IconWorldCheck,
	IconCalendarCheck,
	IconWorldX,
	IconCalendarX,
	IconTrash,
	IconVersions,
	IconStack2,
	IconPencil,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconHistory,
	IconRestore,
	IconSparkles,
	IconExternalLink,
	IconShieldPlus,
} from "@tabler/icons-react";
import {PreviewSettings} from "./vb/PreviewSettings";
import {group} from "console";
import {sep} from "path";
import {IconCalendar, IconPaperPlaneTop, IconTrashCan} from "@optimizely/axiom-icons";
import Link from "next/link";
import usePersistentState from "@/app/usePersistentState";
import {availableAgents, defaultOpalConfiguration} from "@/app/cms/settings/opal-actions/mockData";
import {OpalConfiguration} from "@/app/cms/settings/opal-actions/types";
import {getLocationMenu, getEnabledGroups} from "@/app/cms/settings/opal-actions/helpers";
import {useBrandTone} from "@/app/components/ai/BrandToneProvider";
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
	onPublish?: () => void;
	onViewOnWebsite?: () => void;

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

export default function CMSToolbar({
	pageName = "New Page",
	pageId,
	lastSaved = null,
	pageStatus = "Draft",
	onPublish = () => {},
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
		},
		{label: "Desktop 1440", execute: () => onPreviewChange({mode: "scale", width: 1440})},
		{label: "Desktop 1100", execute: () => onPreviewChange({mode: "scale", width: 1100})},
		{label: "Tablet 768", execute: () => onPreviewChange({mode: "scale", width: 768})},
		{label: "Mobile 390", execute: () => onPreviewChange({mode: "scale", width: 390})},
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
			pl="24"
			pr="12"
			py="12"
			display="flex"
			alignItems="center"
			gap="8"
			justifyContent="space-between"
			style={{minHeight: "64px"}}
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
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
							addon: <IconHistory size={16} />,
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
							className="hover:bg-[var(--ax-bg-default-hover)] transition-colors"
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

				{/* ✅ Preview Button -> Menu */}
				<Menu options={previewOptions}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Preview">{previewLabel}</LabelMenuButton>
					</MenuTrigger>
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
							iconPosition="start"
							addonAfter={<IconChevronDown size={20} />}
							size="lg"
						>
							Improve
						</MenuTrigger>
						<MenuContent />
					</Menu>
				)}

				{/* Publish Button with Menu */}
				<Menu
					options={[
						...(pageStatus === "Changed" || pageStatus === "Draft"
							? [
									{
										label: "Publish now",
										addon: <IconWorldCheck size={16} />,
										execute: onPublish,
										group: {label: "publish", hidden: true, separator: true},
									},
									{
										label: "Schedule publish",
										addon: <IconCalendarCheck size={16} />,
										execute: () => {},
										group: {label: "publish", hidden: true, separator: true},
									},
								]
							: []),
						{
							label: "Unpublish",
							addon: <IconWorldX size={16} />,
							execute: () => {},
						},
						{
							label: "Schedule Unpublish",
							addon: <IconCalendarX size={16} />,
							execute: () => {},
						},
					]}
				>
					<MenuTrigger
						size="lg"
						appearance={pageStatus === "Published" ? "default" : "primary"}
						icon={<IconWorld />}
						iconPosition="start"
						addonAfter={<IconChevronDown size={20} />}
					>
						{pageStatus === "Published" ? "Published" : "Publish"}
					</MenuTrigger>
					<MenuContent />
				</Menu>

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
										detail: <IconExternalLink size={16} />,
										execute: onViewOnWebsite,
										group: {label: "Page", separator: true},
									} satisfies MenuOption,
								]
							: []),
						{
							label: "Rename",
							addon: <IconPencil size={16} />,
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
						icon={<IconDots size={16} />}
					/>
					<MenuContent />
				</Menu>
			</Box>
		</Box>
	);
}
