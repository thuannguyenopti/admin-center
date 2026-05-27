"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconGrid2, IconListUl, IconCopy, IconBolt } from "@optimizely/axiom-icons";
import { useLayout } from "@/app/context/LayoutContext";
import type { BrandPack, BrandTemplate } from "../../types";
// Register the template_card adaptive block so Opal can render it
import "@/app/opal/brand-packs/components/TemplateCardBlock";

type TemplatesTabProps = {
	pack: BrandPack;
};

type ViewMode = "grid" | "list";

/** Convert a ratio string like "16:9" to a CSS padding-top % for aspect-ratio boxes */
function ratioPaddingTop(ratio: string): string {
	const map: Record<string, string> = {
		"1:1":   "100%",
		"4:5":   "125%",
		"4:3":   "75%",
		"16:9":  "56.25%",
		"9:16":  "177.78%",
		"Story": "177.78%",
	};
	return map[ratio] ?? "100%";
}


function TemplateGridCard({
	template,
	onUseTemplate,
}: {
	template: BrandTemplate;
	onUseTemplate: (template: BrandTemplate) => void;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			style={{
				boxShadow: hovered ? "var(--ax-boxShadow-md)" : "var(--ax-boxShadow-sm)",
				cursor: "pointer",
				transform: hovered ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Thumbnail – natural aspect ratio */}
			<Box
				overflow="hidden"
				style={{ position: "relative", paddingTop: ratioPaddingTop(template.ratio) }}
			>
				<img
					alt={template.name}
					src={template.thumb}
					style={{
						bottom: 0,
						height: "100%",
						left: 0,
						objectFit: "cover",
						position: "absolute",
						right: 0,
						top: 0,
						width: "100%",
					}}
				/>
				{hovered && (
					<Box
						alignItems="center"
						display="flex"
						flexDirection="column"
						gap="8"
						justifyContent="center"
						style={{
							background: "rgba(0,0,0,0.52)",
							bottom: 0,
							left: 0,
							position: "absolute",
							right: 0,
							top: 0,
						}}
					>
						{/* Primary CTA */}
						<Button
							appearance="default"
							size="sm"
							icon={<IconBolt size={14} />}
							iconPosition="start"
							onClick={(e) => { e.stopPropagation(); onUseTemplate(template); }}
							style={{ color: "#202320", fontWeight: 600 }}
						>
							Use template
						</Button>
						{/* Secondary: duplicate */}
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconCopy size={14} />}
							aria-label="Duplicate"
							onClick={(e) => e.stopPropagation()}
							style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
						/>
					</Box>
				)}
			</Box>

			{/* Info — minimal: name + format/ratio only */}
			<Box display="flex" flexDirection="column" gap="2" p="12">
				<Text fontWeight="500" style={{ fontSize: 13 }}>
					{template.name}
				</Text>
				<Text color="fg.tertiary" fontSize="xs">
					{template.format === "Email Hero" || template.format === "Email Banner"
						? template.format
						: template.ratio}
				</Text>
			</Box>
		</Box>
	);
}

function TemplateListRow({
	template,
	onUseTemplate,
}: {
	template: BrandTemplate;
	onUseTemplate: (template: BrandTemplate) => void;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			alignItems="center"
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			gap="16"
			p="12"
			rounded="lg"
			style={{
				boxShadow: hovered ? "var(--ax-boxShadow-sm)" : "none",
				cursor: "pointer",
				transition: "box-shadow 0.15s ease",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={() => onUseTemplate(template)}
		>
			{/* Thumb */}
			<Box
				overflow="hidden"
				rounded="md"
				style={{ flexShrink: 0, height: 48, width: 72 }}
			>
				<img
					alt={template.name}
					src={template.thumb}
					style={{ height: "100%", objectFit: "cover", width: "100%" }}
				/>
			</Box>

			{/* Info */}
			<Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
				<Text fontWeight="500" style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
					{template.name}
				</Text>
				<Text color="fg.tertiary" fontSize="xs">{template.format} · {template.ratio}</Text>
			</Box>

			{/* Actions */}
			{hovered && (
				<Box alignItems="center" display="flex" gap="4" style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
					<Button appearance="subtle" size="sm" icon={<IconCopy size={15} />} aria-label="Duplicate" />
					<Button
						appearance="default"
						size="sm"
						icon={<IconBolt size={14} />}
						iconPosition="start"
						onClick={() => onUseTemplate(template)}
						style={{ color: "#202320", fontWeight: 600 }}
					>
						Use template
					</Button>
				</Box>
			)}
		</Box>
	);
}

export function TemplatesTab({ pack }: TemplatesTabProps) {
	const [view, setView] = useState<ViewMode>("grid");
	const [filterChannel, setFilterChannel] = useState<string>("All");
	const { opalPanelControls } = useLayout();

	const handleUseTemplate = (template: BrandTemplate) => {
		if (!opalPanelControls) return;

		opalPanelControls.createNewChat();
		opalPanelControls.openPanel();

		// Add the template as a user "card" message
		opalPanelControls.addMessage({
			role: "user",
			content: `Use template: ${template.name}`,
			messageType: "template_card",
			metadata: { template },
		});

		// Opal responds with the hook after a brief pause
		setTimeout(() => {
			opalPanelControls.addMessage({
				role: "assistant",
				content: `I've got **${template.name}** ready — a ${template.format} (${template.ratio}) built for ${template.channel}.\n\n**What do you want to create?** Tell me about your campaign, audience, or message and I'll draft the content to match your brand.`,
			});
		}, 350);
	};

	// Unique channels for filter tabs
	const channels = ["All", ...Array.from(new Set(pack.templates.map((t) => t.channel))).sort()];

	const visible = filterChannel === "All"
		? pack.templates
		: pack.templates.filter((t) => t.channel === filterChannel);

	return (
		<Box display="flex" flexDirection="column" gap="20">
			{/* Toolbar */}
			<Box alignItems="center" display="flex" gap="16" justifyContent="space-between" style={{ flexWrap: "wrap" }}>
				{/* Channel filter tabs */}
				<Box alignItems="center" display="flex" gap="0" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
					{channels.map((ch) => (
						<button
							key={ch}
							type="button"
							onClick={() => setFilterChannel(ch)}
							style={{
								background: "transparent",
								border: 0,
								borderBottom: `2px solid ${filterChannel === ch ? "var(--ax-colors-fg-default)" : "transparent"}`,
								color: filterChannel === ch ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: filterChannel === ch ? 600 : 400,
								marginBottom: -1,
								padding: "6px 14px",
								transition: "color 0.15s ease, border-color 0.15s ease",
								whiteSpace: "nowrap",
							}}
						>
							{ch}
							{ch !== "All" && (
								<span style={{
									background: "var(--ax-colors-bg-secondary)",
									borderRadius: 999,
									color: "var(--ax-colors-fg-tertiary)",
									fontSize: 11,
									fontWeight: 600,
									marginLeft: 5,
									padding: "1px 5px",
								}}>
									{pack.templates.filter((t) => t.channel === ch).length}
								</span>
							)}
						</button>
					))}
				</Box>

				{/* View toggle + count */}
				<Box alignItems="center" display="flex" gap="12">
					<Text color="fg.tertiary" fontSize="xs">
						{visible.length} template{visible.length !== 1 ? "s" : ""}
					</Text>
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="inline-flex"
						gap="2"
						p="2"
						rounded="full"
					>
						{(["grid", "list"] as ViewMode[]).map((v) => (
							<button
								key={v}
								type="button"
								onClick={() => setView(v)}
								style={{
									alignItems: "center",
									background: view === v ? "var(--ax-colors-bg-default)" : "transparent",
									border: 0,
									borderRadius: 999,
									color: view === v ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
									cursor: "pointer",
									display: "flex",
									gap: 6,
									padding: "4px 10px",
									transition: "all 0.15s ease",
								}}
							>
								{v === "grid" ? <IconGrid2 size={14} /> : <IconListUl size={14} />}
								<span style={{ fontSize: 13 }}>{v === "grid" ? "Grid" : "List"}</span>
							</button>
						))}
					</Box>
				</Box>
			</Box>

			{/* Template grid – flat, aspect-ratio-aware */}
			{view === "grid" ? (
				<Box
					display="grid"
					gap="12"
					style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", alignItems: "start" }}
				>
					{visible.map((t) => (
						<TemplateGridCard key={t.id} template={t} onUseTemplate={handleUseTemplate} />
					))}
				</Box>
			) : (
				<Box display="flex" flexDirection="column" gap="6">
					{visible.map((t) => (
						<TemplateListRow key={t.id} template={t} onUseTemplate={handleUseTemplate} />
					))}
				</Box>
			)}

			{pack.templates.length === 0 && (
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					flexDirection="column"
					gap="8"
					justifyContent="center"
					py="48"
					rounded="xl"
				>
					<Text fontWeight="500">No templates yet</Text>
					<Text color="fg.secondary" fontSize="sm">Add templates to this brand pack to get started</Text>
				</Box>
			)}
		</Box>
	);
}
