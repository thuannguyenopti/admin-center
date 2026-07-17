"use client";

import {Fragment, useEffect, useRef, useState, useMemo} from "react";
import {Box, Text, Heading, Menu, MenuTrigger, MenuContent, Separator} from "@optiaxiom/react";
import {IconEllipsisSolid, IconPalette, IconTrash} from "@/app/lib/axiom-icons";
import {initialContentTypes, ContentType} from "@/app/db/initialData";
import {groupPropertiesByGroup} from "./utils/propertyGroups";
import {PropertyRenderer} from "@/app/components/property-renderers";
import usePersistentState from "@/app/usePersistentState";
import {getTemplatesByContentType} from "@/app/components/vb/blocks/displayTemplateUtils";
import {PreviewCard, toIsolatedStoryUrl, deriveVariantStoryUrl, iframeStyleForTileSize} from "@/app/components/PreviewCard";
import {STORY_SIZES} from "./storySizes";

// Import to register all property renderers
import "@/app/components/property-renderers";
import {Button} from "../Button";
import {IconArrowLeft} from "@optiaxiom/icons";

type Props = {
	currentEle: string;
	elementType: string;
	properties?: any;
	onBack: () => void;
	onInputChange: (value: any, keyOrIndex: string | number) => void;
	outlineTitle?: string;
	onOpenStyleEditor?: () => void;
	onRemove?: () => void;
};

export default function ElementEditor({
	currentEle,
	elementType,
	properties,
	onBack,
	onInputChange,
	outlineTitle,
	onOpenStyleEditor,
	onRemove,
}: Props) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);

	// Load runtime content types from localStorage (includes user-created properties)
	const [runtimeContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		any,
	];

	// Get content type definition and group properties
	const contentType = useMemo(() => {
		return (
			runtimeContentTypes?.find((ct) => ct.id === elementType) ||
			initialContentTypes.find((ct) => ct.id === elementType)
		);
	}, [elementType, runtimeContentTypes]);

	const propertyGroups = useMemo(() => {
		if (!contentType) return {};
		return groupPropertiesByGroup(contentType.properties, true);
	}, [contentType]);

	const displayTemplatesForType = useMemo(
		() => getTemplatesByContentType(elementType),
		[elementType]
	);

	const currentDisplayTemplateKey =
		properties?.displayTemplateKey ||
		displayTemplatesForType.find((t) => t.isDefault)?.key ||
		displayTemplatesForType[0]?.key ||
		"";

	const [generatedArtifacts] = usePersistentState("opal:artifacts:generated", []) as [any[]];

	const elementStorybookUrl = useMemo(() => {
		const artifact = Array.isArray(generatedArtifacts)
			? generatedArtifacts.find((a: any) => a?.id === "stride-cms-registry-artifact")
			: null;
		if (!artifact?.previewText) return null;
		try {
			const parsed = JSON.parse(artifact.previewText) as {
				registry?: Record<string, {"cms element type"?: string; "storybook url"?: string}>;
			};
			if (!parsed.registry) return null;
			const normalize = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
			const byName = new Map(
				Object.entries(parsed.registry)
					.filter(([, e]) => typeof e?.["storybook url"] === "string")
					.map(([name, e]) => [normalize(name), e["storybook url"] as string])
			);
			const candidates = [
				contentType?.displayName,
				contentType?.name,
				contentType?.displayName?.replace(/\s+Block$/i, ""),
			].filter(Boolean);
			for (const c of candidates) {
				const key = normalize(c!);
				const exact = byName.get(key);
				if (exact) return exact;
				// Prefix match (e.g. "heading" → "headingh1")
				const prefixMatches = [...byName.entries()].filter(([k]) => k.startsWith(key));
				if (prefixMatches.length > 0) {
					prefixMatches.sort(([a], [b]) =>
						a.endsWith("default") ? -1 : b.endsWith("default") ? 1 : a.localeCompare(b),
					);
					return prefixMatches[0][1];
				}
			}
			// Fallback: match by "cms element type" field
			for (const entry of Object.values(parsed.registry)) {
				if (entry["cms element type"] === elementType) return entry["storybook url"] ?? null;
			}
		} catch {}
		return null;
	}, [generatedArtifacts, elementType, contentType]);

	useEffect(() => {
		// Don't focus when "closed"
		if (!currentEle || currentEle === "none") return;

		// Match your slide duration (you use `duration-300`)
		const SLIDE_MS = 300;

		const t = window.setTimeout(() => {
			const root = rootRef.current;
			if (!root) return;

			const selector = [
				'input:not([type="hidden"]):not([disabled])',
				"textarea:not([disabled])",
				"select:not([disabled])",
				'[tabindex]:not([tabindex="-1"])',
			].join(",");

			const el = root.querySelector(selector) as any;
			if (!el) return;

			// Prevent scroll-jank during/after transform animations
			try {
				el.focus?.({preventScroll: true});
			} catch {
				el.focus?.();
			}

			// Optional: select text if it's a real input/textarea
			/*if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        try {
          el.select?.();
        } catch { }
      }*/
		}, SLIDE_MS);

		return () => window.clearTimeout(t);
	}, [currentEle]);

	return (
		<div ref={rootRef} className="pl-6 pr-6 flex-none w-full pt-4">
			<Button
				className="-translate-x-2"
				appearance="subtle"
				icon={<IconArrowLeft />}
				size="sm"
				onClick={onBack}
			>
				{outlineTitle || "Outline"}
			</Button>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="8"
				pr="8"
				py="4"
			>
				<Heading level="4">{contentType?.displayName || elementType}</Heading>

				<Box display="flex" alignItems="center" gap="8">
					{(onOpenStyleEditor || onRemove) && (
						<Menu
							onOpenChange={() => setMenuOpen(!menuOpen)}
							open={menuOpen}
							options={[
								...(onOpenStyleEditor
									? [
											{
												addon: <IconPalette size={16} />,
												label: "Style",
												execute: () => {
													onOpenStyleEditor();
													setMenuOpen(false);
												},
											},
										]
									: []),
								...(onRemove
									? [
											{
												addon: <IconTrash size={16} />,
												label: "Remove Element",
												intent: "danger" as const,
												execute: () => {
													onRemove();
													setMenuOpen(false);
												},
											},
										]
									: []),
							]}
						>
							<MenuTrigger
								onClick={(e) => {
									e.stopPropagation();
									setMenuOpen(true);
								}}
								icon={<IconEllipsisSolid />}
								aria-label="Element options"
								appearance="subtle"
								size="sm"
							/>
							<MenuContent />
						</Menu>
					)}
				</Box>
			</Box>
			{/* Render properties grouped by groupName */}
			<Box mt="16">
				{(() => {
					// Calculate groups with visible properties
					const groupsWithVisibleProps = Object.entries(propertyGroups).filter(
						([_, groupProps]) => {
							const visibleProps = groupProps.filter((prop) => {
								return !(prop.id === "template" || prop.type === "SelectOne");
							});
							return visibleProps.length > 0;
						}
					);

					// Only show headers if there are 2 or more groups with visible properties
					const shouldShowHeaders = groupsWithVisibleProps.length > 1;

					// Render properties grouped by groupName
					return Object.entries(propertyGroups).map(([groupName, groupProps]) => {
						// Filter out properties that should be hidden
						const visibleProps = groupProps.filter((prop) => {
							// Skip template property - it's accessed via context menu "Style" option
							return !(prop.id === "template" || prop.type === "SelectOne");
						});

						// Don't render the group at all if no visible properties
						if (visibleProps.length === 0) return null;

						return (
							<Fragment key={groupName}>
								{shouldShowHeaders && (
									<Box mb="12" mt="16">
										<Text
											fontSize="sm"
											fontFamily="mono"
											color="fg.tertiary"
											mb="8"
											mt="32"
											textTransform="uppercase"
										>
											{groupName}
										</Text>
										<Separator />
									</Box>
								)}
								<Box display="flex" flexDirection="column" gap="16">
									{visibleProps.map((prop) => {
										const propData = properties ? properties[prop.id] : null;
										const value =
											propData != null ? propData : (prop.defaultValue ?? "");

										return (
											<PropertyRenderer
												key={prop.id}
												property={prop}
												value={value}
												onChange={(newVal: any) =>
													onInputChange(newVal, prop.id)
												}
												enableAI={true}
												context={{runtimeContentTypes}}
											/>
										);
									})}
								</Box>
							</Fragment>
						);
					});
				})()}
			</Box>
			{displayTemplatesForType.length > 1 && (
				<Box mt="24" pb="16">
					<Box mb="8">
						<Text
							fontSize="sm"
							fontFamily="mono"
							color="fg.tertiary"
							mb="8"
							textTransform="uppercase"
						>
							Style
						</Text>
						<Separator />
					</Box>
					<Box
						mt="8"
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(2, 1fr)",
							gap: 8,
						}}
					>
						{displayTemplatesForType.map((template) => (
							<PreviewCard
								key={template.key}
								label={template.displayName}
								storybookUrl={
							elementStorybookUrl
								? toIsolatedStoryUrl(
										template.templateValue
											? deriveVariantStoryUrl(elementStorybookUrl, template.templateValue)
											: elementStorybookUrl
									)
								: null
						}
								isSelected={currentDisplayTemplateKey === template.key}
								onClick={() => onInputChange(template.key, "displayTemplateKey")}
								previewHeight={100}
								iframeStyle={iframeStyleForTileSize(130, 100, STORY_SIZES[elementType])}
							/>
						))}
					</Box>
				</Box>
			)}
		</div>
	);
}
