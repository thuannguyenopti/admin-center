import React, {useState, useMemo} from "react";
import {ReactNode} from "react";
import {Box, Button, Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {
	IconTrash,
	IconDots,
	IconPlus,
	IconHeading,
	IconPilcrow,
	IconForms,
	IconRectangle,
	IconPhoto,
	IconBrackets,
	IconLayoutGrid,
} from "@tabler/icons-react";
import ColElementGridPicker from "./ColElementGridPicker";
import {initialContentTypes, ContentType} from "@/app/db/initialData";
import {BLOCK_SCHEMAS} from "./blocks/schemas";
import usePersistentState from "@/app/usePersistentState";
import {toIsolatedStoryUrl, deriveVariantStoryUrl} from "@/app/components/PreviewCard";

const indentDistance = 8;

const Col: React.FC<{
	setOpen: any;
	col: any;
	children: ReactNode;
	addElement: any;
	removeCol: any;
	onDragStart: any;
	elementOptions: {type: string; label: string}[];
	isSelected?: boolean;
	onHoverChange?: (colId: string | null) => void;
	onScrollToPreview?: (colId: string) => void;
}> = ({
	setOpen,
	col,
	children,
	addElement,
	removeCol,
	onDragStart,
	elementOptions,
	isSelected,
	onHoverChange,
	onScrollToPreview,
}) => {
	const iconForType = (type: string) => {
		switch (type) {
			case "ct-heading":
				return <IconHeading size={16} />;
			case "ct-text":
			case "ct-rich-text":
				return <IconPilcrow size={16} />;
			case "ct-product":
				return <IconRectangle size={16} />;
			case "ct-input":
				return <IconForms size={16} />;
			case "ct-button":
				return <IconRectangle size={16} />;
			case "ct-image":
			case "ct-image-block":
				return <IconPhoto size={16} />;
			default:
				return <IconBrackets size={16} />;
		}
	};

	const fallbackOptions = [
		{type: "ct-heading", label: "Heading"},
		{type: "ct-text", label: "Text"},
		{type: "ct-input", label: "Input"},
		{type: "ct-button", label: "Button"},
		{type: "ct-image-block", label: "Image"},
	];

	const optionsSource =
		elementOptions && elementOptions.length > 0 ? elementOptions : fallbackOptions;

	const [gridOpen, setGridOpen] = useState(false);
	const [addMenuOpen, setAddMenuOpen] = useState(false);
	const [removeMenuOpen, setRemoveMenuOpen] = useState(false);
	const menuOpen = gridOpen || addMenuOpen || removeMenuOpen;

	// Load runtime content types and build storybook URLs dynamically
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		unknown,
	];
	const [generatedArtifacts] = usePersistentState("opal:artifacts:generated", []) as [any[]];

	const {storybookUrls, attemptedUrls, templateOptionsByType, storybookUrlsByTemplate} = useMemo(() => {
		const urls: Record<string, string> = {};
		const attempted: Record<string, string> = {};
		const templateOpts: Record<string, {label: string; value: string}[]> = {};
		const templateUrls: Record<string, Record<string, string>> = {};

		// Build name→URL map from registry artifact
		const normalize = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
		let registryByName = new Map<string, string>();
		try {
			const artifact = Array.isArray(generatedArtifacts)
				? generatedArtifacts.find((a: any) => a?.id === "stride-cms-registry-artifact")
				: null;
			if (artifact?.previewText) {
				const parsed = JSON.parse(artifact.previewText) as {
					registry?: Record<string, {"storybook url"?: string}>;
				};
				if (parsed.registry) {
					registryByName = new Map(
						Object.entries(parsed.registry)
							.filter(([, e]) => typeof e?.["storybook url"] === "string")
							.map(([name, e]) => [normalize(name), e["storybook url"] as string])
					);
				}
			}
		} catch {}

		const getRegistryUrl = (ct: ContentType): string | null => {
			const candidates = [
				ct.displayName,
				ct.name,
				ct.displayName?.replace(/\s+Block$/i, ""),
				ct.name?.replace(/_?block$/i, ""),
			].filter(Boolean);
			for (const c of candidates) {
				const key = normalize(c!);
				// Exact match
				const exact = registryByName.get(key);
				if (exact) return toIsolatedStoryUrl(exact);
				// Prefix match: "hero" → "herodefault", "heading" → "headingh1", etc.
				// Prefer entries ending in "default", then alphabetical first.
				const prefixMatches = [...registryByName.entries()].filter(([k]) => k.startsWith(key));
				if (prefixMatches.length > 0) {
					prefixMatches.sort(([a], [b]) =>
						a.endsWith("default") ? -1 : b.endsWith("default") ? 1 : a.localeCompare(b)
					);
					return toIsolatedStoryUrl(prefixMatches[0][1]);
				}
			}
			return null;
		};

		contentTypes.forEach((ct) => {
			const iframeUrl = getRegistryUrl(ct);
			if (!iframeUrl) {
				attempted[ct.id] = `(not in registry: ${ct.displayName})`;
				return;
			}
			urls[ct.id] = iframeUrl;
			attempted[ct.id] = iframeUrl;

			// Template variants — find "template" SelectOne property with >1 option
			const templateProp = ct.properties?.find(
				(p) =>
					p.id === "template" &&
					p.type === "SelectOne" &&
					Array.isArray(p.options) &&
					(p.options?.length ?? 0) > 1,
			);
			if (templateProp?.options) {
				templateOpts[ct.id] = templateProp.options;
				templateUrls[ct.id] = {};
				templateProp.options.forEach((opt) => {
					templateUrls[ct.id][opt.value] = deriveVariantStoryUrl(iframeUrl, opt.value);
				});
			}
		});

		// Derive URLs for BLOCK_SCHEMA variants (ct-heading-h2, ct-button-outline, etc.)
		Object.entries(BLOCK_SCHEMAS).forEach(([id, schema]) => {
			if (!schema.variantOf || !schema.templateValue) return;
			const parentUrl = urls[schema.variantOf];
			if (parentUrl) {
				urls[id] = deriveVariantStoryUrl(parentUrl, schema.templateValue);
			}
		});

		// For content types whose "template" property isn't a SelectOne (e.g. hero),
		// populate templateOptionsByType from BLOCK_SCHEMA variants so the paint roller appears.
		const schemaParentsSeen = new Set<string>();
		Object.entries(BLOCK_SCHEMAS).forEach(([variantId, schema]) => {
			if (!schema.variantOf || !schema.templateValue) return;
			const parentId = schema.variantOf;
			if (templateOpts[parentId]) return; // already built from SelectOne
			if (!urls[parentId]) return; // no URL for parent

			if (!schemaParentsSeen.has(parentId)) {
				schemaParentsSeen.add(parentId);
				const baseLabel = BLOCK_SCHEMAS[parentId]?.displayLabel ?? "Default";
				templateOpts[parentId] = [{label: baseLabel, value: "default"}];
				templateUrls[parentId] = {default: urls[parentId]};
			}
			const variantLabel = schema.displayLabel ?? schema.displayName ?? schema.templateValue;
			templateOpts[parentId].push({label: variantLabel, value: schema.templateValue});
			templateUrls[parentId][schema.templateValue] =
				urls[variantId] ?? deriveVariantStoryUrl(urls[parentId], schema.templateValue);
		});

		return {
			storybookUrls: urls,
			attemptedUrls: attempted,
			templateOptionsByType: templateOpts,
			storybookUrlsByTemplate: templateUrls,
		};
	}, [contentTypes, generatedArtifacts]);

	return (
		<Box
			style={{
				transition: "background-color 0.2s",
			}}
		>
			<div
				className="newsection group p-1 cursor-pointer rounded-[4px] hover:bg-[var(--ax-colors-bg-default-hovered)]  active:bg-[var(--ax-colors-bg-default-pressed)] flex gap-1 items-center w-full justify-between pr-5"
				draggable
				style={{
					paddingLeft: `${4 + indentDistance * 2}px`,
					backgroundColor: isSelected
						? "var(--ax-colors-bg-accent-subtle)"
						: menuOpen
							? "var(--ax-colors-bg-default-hovered)"
							: undefined,
				}}
				onClick={() => {
					setOpen(col.id, !col.open);
					onScrollToPreview?.(col.id);
				}}
				onDragStart={onDragStart}
				onMouseEnter={() => onHoverChange?.(col.id)}
				onMouseLeave={() => onHoverChange?.(null)}
			>
				<div className="flex gap-1 items-center">
					<svg
						className="chevron"
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{
							transform: col.open ? "rotate(0deg)" : "rotate(-90deg)",
						}}
					>
						<path
							d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
							fill="var(--ax-colors-fg-tertiary)"
						/>
					</svg>
					<div>Column</div>
				</div>
				<div
					className="group-hover:visible invisible gap-0.5 flex"
					style={{visibility: menuOpen ? "visible" : undefined}}
				>
					<ColElementGridPicker
						elementOptions={optionsSource}
						addElement={addElement}
						iconForType={iconForType}
						onOpenChange={setGridOpen}
						storybookUrls={storybookUrls}
						attemptedUrls={attemptedUrls}
						templateOptionsByType={templateOptionsByType}
						storybookUrlsByTemplate={storybookUrlsByTemplate}
						trigger={
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconPlus />}
								aria-label="add element (grid)"
								onClick={(e: any) => e.stopPropagation()}
							/>
						}
					/>
					<Menu
						onOpenChange={setRemoveMenuOpen}
						options={[
							{
								addon: <IconTrash size={16} />,
								label: "Remove Column",
								intent: "danger",
								execute: () => {
									removeCol();
								},
							},
						]}
					>
						<MenuTrigger
							icon={<IconDots />}
							aria-label="add ele"
							appearance="subtle"
							size="sm"
							onClick={(e: any) => {
								e.stopPropagation();
							}}
							iconPosition="start"
						/>
						<MenuContent />
					</Menu>
				</div>
			</div>
			<div
				style={{
					display: col.open ? "block" : "none",
					backgroundColor: isSelected ? "var(--ax-colors-bg-accent-subtle)" : undefined,
				}}
			>
				{children}
			</div>
		</Box>
	);
};

export default Col;
