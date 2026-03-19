"use client";

import React from "react";
import {
	Box,
	Text,
	Badge,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	toaster,
} from "@optiaxiom/react";
import {Button} from "./Button";
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
	IconUnlink,
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
} from "@tabler/icons-react";
import {PreviewSettings} from "./vb/PreviewSettings";
import {group} from "console";
import {sep} from "path";
import {IconCalendar, IconPaperPlaneTop, IconTrashCan} from "@optimizely/axiom-icons";
import Link from "next/link";
import usePersistentState from "@/app/usePersistentState";
import {OpalAction, availableAgents, opalActions as initialOpalActions} from "@/app/cms/settings/opal-actions/mockData";
import {useBrandTone} from "@/app/components/ai/BrandToneProvider";
import {useLayout} from "@/app/context/LayoutContext";
import {usePreflightContext} from "@/app/components/ai/PreflightContext";
import type {PageField} from "@/app/components/ai/PreflightAuditTypes";

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

	preview = {mode: "responsive", width: 1100, maxWidth: 1100},
	onPreviewChange = () => {},

	contentTypeIcon,
	pageElements,
	onUpdateElement,
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
		{label: "Desktop 1440", execute: () => onPreviewChange({mode: "fixed", width: 1440})},
		{label: "Desktop 1100", execute: () => onPreviewChange({mode: "fixed", width: 1100})},
		{label: "Tablet 768", execute: () => onPreviewChange({mode: "fixed", width: 768})},
		{label: "Mobile 390", execute: () => onPreviewChange({mode: "fixed", width: 390})},
		{
			label: "Scale to fit (1100)",
			execute: () => onPreviewChange({mode: "scale", width: 1100}),
		},
	];

	const isVariation = selectedVariation !== "original";

	// Get enabled Opal Actions for Improve button and context menu
	const [opalActions] = usePersistentState("opal-actions", initialOpalActions) as [OpalAction[], any];
	const {analyzePage} = useBrandTone();
	const {opalPanelControls} = useLayout();
	const {initializeContext} = usePreflightContext();

	const improveActions = opalActions.filter(
		(action) => action.enabled && action.locations.toolbar.improveButton
	);
	const contextMenuActions = opalActions.filter(
		(action) => action.enabled && action.locations.toolbar.contextMenu
	);

	// Extract text content from page elements
	const getPageFields = () => {
		if (!pageElements) {
			return [];
		}

		const fields: Array<{fieldId: string; fieldLabel: string; text: string; src?: string; alt?: string}> = [];

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
				label = element.type === "heading" ? "Heading" :
				        element.type === "text" ? "Text" :
				        element.type === "button" ? "Button" :
				        element.type;
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
			toaster.create("No text content found on the page", { intent: "warning" });
			return;
		}

		// Create field-to-element mapping (fieldId is already the elementId)
		const fieldToElementMap: Record<string, string> = {};
		fields.forEach(field => {
			fieldToElementMap[field.fieldId] = field.fieldId;
		});

		console.log("[CMSToolbar] Brand tone analysis:", {
			fieldsCount: fields.length,
			fields: fields.map(f => ({ id: f.fieldId, label: f.fieldLabel, textLength: f.text.length })),
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
					appearance="default"
					icon={<IconMessage size={16} />}
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
				{improveActions.length > 0 && (
					<Menu
						options={improveActions.flatMap((action) => {
							// If action has multiple agents, create submenu items
							if (action.agents.length > 1) {
								return action.agents.map((agentId, index) => {
									const agent = availableAgents.find((a) => a.id === agentId);
									return {
										label: agent?.name || agentId,
										group: {label: action.name, hidden: index > 0},
										execute: () => {
											if (agentId === "preflight-audit") {
												handlePreflightAudit();
											} else if (agentId === "brand-tone-audit") {
												handleBrandToneAnalysis();
											} else {
												console.log(
													"Execute Opal Action:",
													action.name,
													"- Agent:",
													agent?.name
												);
											}
										},
									};
								});
							}
							// Single agent, just show the action name
							const agentId = action.agents[0];
							return [
								{
									label: action.name,
									execute: () => {
										if (agentId === "preflight-audit") {
											handlePreflightAudit();
										} else if (agentId === "brand-tone-audit") {
											handleBrandToneAnalysis();
										} else {
											console.log("Execute Opal Action:", action.name);
										}
									},
								},
							];
						})}
					>
						<MenuTrigger asChild>
							<Button
								appearance="default"
								icon={<IconChevronDown size={12} />}
								iconPosition="end"
							>
								<Box display="flex" alignItems="center" gap="4">
									<IconSparkles size={16} />
									Improve
								</Box>
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				)}

				{/* Publish Button with Menu */}
				<Menu
					options={[
						...(onViewOnWebsite
							? [
									{
										label: "View on website",
										addon: <IconWorld size={16} />,
										execute: onViewOnWebsite,
										group: {label: "view", hidden: true, separator: true},
									},
								]
							: []),
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
						{
							label: "Publish settings",
							addon: <IconSettings size={16} />,
							execute: () => {},
						},
					]}
				>
					<MenuTrigger asChild>
						<Button
							appearance={pageStatus === "Published" ? "default" : "primary"}
							icon={<IconChevronDown size={12} />}
							iconPosition="end"
						>
							{pageStatus === "Published" ? "Published" : "Publish"}
						</Button>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Options */}
				<DropdownMenu>
					<DropdownMenuTrigger
						aria-label={"Status " + pageStatus}
						size="lg"
						icon={<IconDots size={16} />}
					/>
					<DropdownMenuContent>
						{/* Opal Actions Submenu */}
						{contextMenuActions.length > 0 && (
							<>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<Box display="flex" alignItems="center" gap="8">
											<IconSparkles size={16} />
											Opal Actions
										</Box>
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										{contextMenuActions.map((action) => {
											// If action has multiple agents, create nested submenu
											if (action.agents.length > 1) {
												return (
													<DropdownMenuSub key={action.id}>
														<DropdownMenuSubTrigger>
															{action.name}
														</DropdownMenuSubTrigger>
														<DropdownMenuSubContent>
															{action.agents.map((agentId) => {
																const agent = availableAgents.find(
																	(a) => a.id === agentId
																);
																return (
																	<DropdownMenuItem
																		key={agentId}
																		onSelect={() => {
																			if (agentId === "brand-tone-audit") {
																				handleBrandToneAnalysis();
																			} else {
																				console.log(
																					"Execute Opal Action:",
																					action.name,
																					"- Agent:",
																					agent?.name
																				);
																			}
																		}}
																	>
																		{agent?.name || agentId}
																	</DropdownMenuItem>
																);
															})}
														</DropdownMenuSubContent>
													</DropdownMenuSub>
												);
											}
											// Single agent, just show the action name
											const agentId = action.agents[0];
											return (
												<DropdownMenuItem
													key={action.id}
													onSelect={() => {
														if (agentId === "brand-tone-audit") {
															handleBrandToneAnalysis();
														} else {
															console.log("Execute Opal Action:", action.name);
														}
													}}
												>
													{action.name}
												</DropdownMenuItem>
											);
										})}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
								<DropdownMenuSeparator />
							</>
						)}

						{/* Page Actions */}
						<DropdownMenuLabel>Page</DropdownMenuLabel>
						<DropdownMenuItem onSelect={onRenamePage}>
							<Box display="flex" alignItems="center" gap="8">
								<IconPencil size={16} />
								Rename
							</Box>
						</DropdownMenuItem>
						<DropdownMenuItem intent="danger" onSelect={onTrash}>
							<Box display="flex" alignItems="center" gap="8">
								<IconTrash size={16} />
								Move to trash
							</Box>
						</DropdownMenuItem>

						{/* Variation Actions */}
						{isVariation && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Variation</DropdownMenuLabel>
								<DropdownMenuItem onSelect={onRenameVariation}>
									<Box display="flex" alignItems="center" gap="8">
										<IconStack2 size={16} />
										Rename Variation
									</Box>
								</DropdownMenuItem>
								<DropdownMenuItem intent="danger" onSelect={onDeleteVariationRequest}>
									<Box display="flex" alignItems="center" gap="8">
										<IconTrash size={16} />
										Delete Variation
									</Box>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</Box>
		</Box>
	);
}
