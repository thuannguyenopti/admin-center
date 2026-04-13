"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
	Box,
	Text as AxiomText,
	Heading,
	Menu,
	MenuTrigger,
	MenuContent,
	Tooltip,
} from "@optiaxiom/react";
import {
	IconArrowLeft,
	IconChevronDown,
	IconCode,
	IconCopy,
	IconDeviceDesktop,
	IconHandFinger,
	IconLayoutNavbar,
	IconLink,
	IconList,
	IconMinus,
	IconPencil,
	IconPlus,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import { IconAgent, IconEllipsisSolid } from "@optimizely/axiom-icons";
import { Button } from "@/app/components/Button";
import { getDynamicOptimizationById } from "@/app/web-experimentation/optimizations/dynamicOptimizationStorage";
import {
	addRemovedVariationKey,
	appendStoredExtraVariation,
	getRemovedVariationKeys,
	getStoredExtraVariations,
	removeStoredExtraVariation,
} from "@/app/web-experimentation/optimizations/optimizationVariationsStorage";
import { getOptimizationById } from "@/app/web-experimentation/optimizations/mockData";
import { resolveExperimentVariations, type VariationRow } from "@/app/web-experimentation/optimizations/variationSets";

const STROKE = 1.5;
const MENU_ICON_SIZE = 16;
/** Toolbar icons (Tabler + IconAgent). */
const TOOLBAR_ICON_SIZE = 20;
/** Same surface token for active tab + toolbar (avoids mismatched whites / hairlines) */
const CHROME_PANEL_SURFACE = "var(--ax-colors-bg-default)";
/** Row 2: same box for every glyph so Tabler + Axiom read at one size (avoids mixed icon/children slots). */
const row2TablerIconStyle = {
	display: "block",
	flexShrink: 0,
	width: TOOLBAR_ICON_SIZE,
	height: TOOLBAR_ICON_SIZE,
} as const;

/** Static sample site loaded in the preview iframe (full page, scrollable). */
const SAMPLE_PAGE_SRC = "/web-experimentation/visual-editor/sample-stride.html";

export default function VisualEditorPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = params?.id as string | undefined;

	const optimization = useMemo(() => {
		if (!id) return undefined;
		return getOptimizationById(id) ?? getDynamicOptimizationById(id);
	}, [id]);

	const [persistedExtras, setPersistedExtras] = useState<VariationRow[]>([]);
	const [removedKeys, setRemovedKeys] = useState<string[]>([]);
	const [openVariationMenuKey, setOpenVariationMenuKey] = useState<string | null>(null);
	const [addVariationMenuOpen, setAddVariationMenuOpen] = useState(false);

	useEffect(() => {
		if (!id) {
			setPersistedExtras([]);
			setRemovedKeys([]);
			return;
		}
		setPersistedExtras(getStoredExtraVariations(id));
		setRemovedKeys(getRemovedVariationKeys(id));
	}, [id]);

	/** Close menus when clicking the preview iframe (clicks don’t reach document otherwise). */
	useEffect(() => {
		if (openVariationMenuKey == null && !addVariationMenuOpen) return;
		const onPointerDownCapture = (e: PointerEvent) => {
			const el = e.target as HTMLElement | null;
			if (el?.tagName === "IFRAME") {
				setOpenVariationMenuKey(null);
				setAddVariationMenuOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDownCapture, true);
		return () => document.removeEventListener("pointerdown", onPointerDownCapture, true);
	}, [openVariationMenuKey, addVariationMenuOpen]);

	const variations = useMemo(
		() => (id ? resolveExperimentVariations(id, persistedExtras, removedKeys) : []),
		[id, persistedExtras, removedKeys],
	);

	const variationParam = searchParams.get("variation");
	const activeKey = useMemo(() => {
		if (variations.length === 0) return null;
		if (variationParam && variations.some((v) => v.key === variationParam)) {
			return variationParam;
		}
		return variations[0].key;
	}, [variations, variationParam]);

	const setVariationInUrl = (key: string) => {
		if (!id) return;
		router.replace(
			`/web-experimentation/optimizations/${id}/visual-editor?variation=${encodeURIComponent(key)}`,
		);
	};

	/** Next variation letter: A + current count (e.g. 2 variations A,B → next C). */
	const nextVariationLetter = useMemo(() => {
		const n = variations.length;
		if (n >= 26) return "Z";
		return String.fromCharCode(65 + n);
	}, [variations.length]);

	const createNewVariation = () => {
		if (!id) return;
		setAddVariationMenuOpen(false);
		const letter = nextVariationLetter;
		const activePreview = variations.find((v) => v.key === activeKey)?.preview ?? "original";
		const row: VariationRow = {
			key: `extra-${crypto.randomUUID()}`,
			letter,
			title: `Variation ${letter}`,
			description: "New variation. Customize the experience in the editor.",
			preview: activePreview,
		};
		appendStoredExtraVariation(id, row);
		setPersistedExtras(getStoredExtraVariations(id));
		setVariationInUrl(row.key);
	};

	const deleteVariation = (keyToDelete: string) => {
		if (!id) return;
		const list = resolveExperimentVariations(id, persistedExtras, removedKeys);
		if (list.length <= 1) return;

		const isExtra = persistedExtras.some((r) => r.key === keyToDelete);
		if (isExtra) {
			removeStoredExtraVariation(id, keyToDelete);
			setPersistedExtras(getStoredExtraVariations(id));
		} else {
			addRemovedVariationKey(id, keyToDelete);
			setRemovedKeys(getRemovedVariationKeys(id));
		}

		setOpenVariationMenuKey(null);

		const after = resolveExperimentVariations(
			id,
			getStoredExtraVariations(id),
			getRemovedVariationKeys(id),
		);
		if (activeKey === keyToDelete && after[0]) {
			setVariationInUrl(after[0].key);
		}
	};

	const variationsHref = id ? `/web-experimentation/optimizations/${id}` : "/web-experimentation/optimizations";

	if (!id || !optimization) {
		return (
			<Box display="flex" flexDirection="column" gap="16" p="24" style={{ maxWidth: "480px" }}>
				<Heading level="3">Experiment not found</Heading>
				<AxiomText color="fg.secondary">No optimization matches this link.</AxiomText>
				<Link href="/web-experimentation/optimizations" style={{ color: "var(--ax-colors-fg-accent)" }}>
					← Back to Optimizations
				</Link>
			</Box>
		);
	}

	return (
		<Box
			w="full"
			flex="1"
			h="full"
			style={{
				position: "relative",
				minHeight: 0,
				flex: 1,
				overflow: "hidden",
				background: "#0a0a0a",
			}}
		>
			{/* Full-viewport site preview */}
			<iframe
				title="Stride Triathlon sample — visual editor preview"
				src={SAMPLE_PAGE_SRC}
				sandbox="allow-same-origin"
				style={{
					position: "absolute",
					inset: 0,
					width: "100%",
					height: "100%",
					border: "none",
					display: "block",
				}}
			/>

			{/* Bottom chrome — overlaid on the page */}
			<Box
				borderT="1"
				borderColor="border.tertiary"
				bg="bg.default"
				display="flex"
				flexDirection="column"
				gap="0"
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 20,
					boxShadow: "0 -10px 40px rgba(15, 23, 42, 0.14)",
				}}
			>
				{/* Row 1: variation tabs — tabs + add share one strip */}
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					gap="8"
					pt="8"
					px="12"
					pb="0"
					style={{
						background: "#EDEDED",
					}}
				>
					<Box
						className="scrollbar-hide"
						display="flex"
						flexDirection="row"
						alignItems="center"
						gap="8"
						flex="1"
						alignSelf="end"
						style={{ minWidth: 0, overflowX: "auto" }}
					>
						{variations.map((row) => {
							const selected = row.key === activeKey;
							return (
								<Box
									key={row.key}
									role="tab"
									tabIndex={selected ? 0 : -1}
									aria-selected={selected}
									display="flex"
									flexDirection="row"
									alignItems="center"
									onClick={() => setVariationInUrl(row.key)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											setVariationInUrl(row.key);
										}
									}}
									style={{
										borderRadius: "8px 8px 0 0",
										backgroundColor: selected ? CHROME_PANEL_SURFACE : "transparent",
										/* Selected: no borders (they cause a hairline vs toolbar); overlap toolbar 1px */
										...(selected
											? {
													border: "none",
													marginBottom: "-1px",
													paddingBottom: "1px",
													boxShadow: "none",
												}
											: {
													border: "1px solid transparent",
												}),
										position: "relative",
										zIndex: selected ? 1 : 0,
										color: "var(--ax-colors-fg-default)",
										cursor: "pointer",
										outline: "none",
										flexShrink: 0,
									}}
								>
									<Box
										display="flex"
										flexDirection="row"
										alignItems="center"
										flex="1"
										style={{
											minWidth: 0,
											gap: "8px",
											padding: "10px 6px 10px 12px",
										}}
									>
										<AxiomText
											fontSize="sm"
											fontWeight="600"
											style={{ flexShrink: 0, margin: 0, lineHeight: 1.2 }}
										>
											{row.letter}
										</AxiomText>
										<AxiomText
											fontSize="sm"
											fontWeight="400"
											style={{
												margin: 0,
												lineHeight: 1.2,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												minWidth: 0,
											}}
										>
											{row.title}
										</AxiomText>
									</Box>
									<Box
										display="flex"
										alignItems="center"
										style={{ paddingRight: "6px", flexShrink: 0 }}
										onClick={(e) => e.stopPropagation()}
									>
										<Menu
											open={openVariationMenuKey === row.key}
											onOpenChange={(open) => {
												setOpenVariationMenuKey(open ? row.key : null);
												if (open) setAddVariationMenuOpen(false);
											}}
											options={[
												{
													label: "Rename",
													addon: (
														<IconPencil size={MENU_ICON_SIZE} stroke={STROKE} color="var(--ax-colors-fg-secondary)" />
													),
													execute: () => {},
												},
												{
													label: "Duplicate",
													addon: (
														<IconCopy size={MENU_ICON_SIZE} stroke={STROKE} color="var(--ax-colors-fg-secondary)" />
													),
													execute: () => {},
												},
												{
													label: "Delete",
													addon: (
														<IconTrash size={MENU_ICON_SIZE} stroke={STROKE} color="var(--ax-colors-fg-secondary)" />
													),
													execute: () => deleteVariation(row.key),
												},
												{
													group: { label: "", hidden: true, separator: true },
													label: "Generate Variation",
													addon: (
														<IconAgent size={TOOLBAR_ICON_SIZE} style={row2TablerIconStyle} />
													),
													execute: () => {},
												},
											]}
										>
											<Tooltip content={`More options for variation ${row.letter}`} side="bottom">
												<MenuTrigger asChild>
													<Button
														type="button"
														appearance="subtle"
														size="sm"
														icon={<IconEllipsisSolid size="sm" />}
														aria-label={`More options for variation ${row.letter}`}
														style={{
															minWidth: "28px",
															minHeight: "28px",
															padding: "2px",
															color: "var(--ax-colors-fg-accent)",
														}}
													/>
												</MenuTrigger>
											</Tooltip>
											<MenuContent />
										</Menu>
									</Box>
								</Box>
							);
						})}
						<Menu
							open={addVariationMenuOpen}
							onOpenChange={(open) => {
								setAddVariationMenuOpen(open);
								if (open) setOpenVariationMenuKey(null);
							}}
							options={[
								{
									label: "New Variation",
									addon: (
										<AxiomText
											fontSize="sm"
											fontWeight="700"
											color="fg.default"
											style={{ minWidth: "1em", textAlign: "center" }}
										>
											{nextVariationLetter}
										</AxiomText>
									),
									execute: createNewVariation,
								},
								{
									label: "Generate Variation",
									addon: (
										<IconAgent size={TOOLBAR_ICON_SIZE} style={row2TablerIconStyle} />
									),
									execute: () => {
										setAddVariationMenuOpen(false);
									},
								},
							]}
						>
							<Tooltip content="Add variation" side="bottom">
								<MenuTrigger asChild>
									<Button
										type="button"
										appearance="subtle"
										size="sm"
										icon={<IconPlus size={16} stroke={STROKE} />}
										aria-label="Add variation"
										style={{
											minWidth: "28px",
											minHeight: "28px",
											padding: "2px",
											color: "var(--ax-colors-fg-secondary)",
										}}
									/>
								</MenuTrigger>
							</Tooltip>
							<MenuContent />
						</Menu>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						gap="8"
						alignSelf="center"
						style={{ flexShrink: 0 }}
					>
						<Tooltip content="Minimize editor" side="bottom">
							<Button
								type="button"
								appearance="default"
								size="sm"
								icon={<IconMinus size={TOOLBAR_ICON_SIZE} stroke={STROKE} />}
								aria-label="Minimize editor"
								onClick={() => {}}
							/>
						</Tooltip>
						<Tooltip content="Close visual editor" side="bottom">
							<Link
								href={variationsHref}
								style={{
									display: "inline-flex",
									alignItems: "center",
									lineHeight: 0,
								}}
							>
								<Button
									type="button"
									appearance="default"
									size="sm"
									icon={<IconX size={TOOLBAR_ICON_SIZE} stroke={STROKE} />}
									aria-label="Close visual editor"
								/>
							</Link>
						</Tooltip>
					</Box>
				</Box>

				{/* Row 2: tools — same white as active tab (single continuous surface) */}
				<Box
					display="flex"
					flexDirection="row"
					alignItems="stretch"
					gap="8"
					flexWrap="wrap"
					px="12"
					py="10"
					style={{
						backgroundColor: CHROME_PANEL_SURFACE,
						marginTop: 0,
					}}
				>
					<Tooltip content="Back to Variations" side="bottom">
						<Link
							href={variationsHref}
							style={{ display: "inline-flex", flexShrink: 0, alignItems: "stretch" }}
						>
							<Button
								type="button"
								appearance="default"
								size="lg"
								icon={
									<IconArrowLeft size={TOOLBAR_ICON_SIZE} stroke={STROKE} style={row2TablerIconStyle} />
								}
								aria-label="Back to Variations"
								style={{ height: "100%" }}
							/>
						</Link>
					</Tooltip>

					<Tooltip content="Page and URL" side="bottom">
						<Button
							type="button"
							appearance="default"
							size="lg"
							icon={
								<IconChevronDown
									size={TOOLBAR_ICON_SIZE}
									stroke={STROKE}
									style={{ ...row2TablerIconStyle, opacity: 0.65 }}
								/>
							}
							iconPosition="end"
							style={{
								minWidth: "320px",
								maxWidth: "100%",
								flex: "1 1 320px",
								display: "inline-flex",
								flexDirection: "row",
								flexWrap: "nowrap",
								alignItems: "center",
								justifyContent: "space-between",
								alignSelf: "stretch",
							}}
						>
						<Box
							display="flex"
							flexDirection="row"
							flexWrap="nowrap"
							alignItems="center"
							gap="12"
							style={{ minWidth: 0, flex: 1, textAlign: "left", overflow: "hidden" }}
						>
							<AxiomText
								fontSize="md"
								fontWeight="600"
								style={{
									color: "var(--ax-colors-fg-accent)",
									margin: 0,
									lineHeight: 1.15,
									flexShrink: 0,
								}}
							>
								Stride Homepage
							</AxiomText>
							<AxiomText
								fontSize="sm"
								color="fg.secondary"
								style={{
									margin: 0,
									lineHeight: 1.2,
									flex: 1,
									minWidth: 0,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								https://www.stridefitness.com
							</AxiomText>
						</Box>
						</Button>
					</Tooltip>

					<Tooltip content="Viewport size" side="bottom">
						<Button
							type="button"
							appearance="default"
							size="lg"
							aria-label="Viewport size"
							icon={
								<IconChevronDown
									size={TOOLBAR_ICON_SIZE}
									stroke={STROKE}
									style={{ ...row2TablerIconStyle, opacity: 0.65 }}
								/>
							}
							iconPosition="end"
							style={{
								display: "inline-flex",
								flexDirection: "row",
								flexWrap: "nowrap",
								alignItems: "center",
								justifyContent: "space-between",
								alignSelf: "stretch",
								/* Match page selector: end chevron shares the same icon-end slot and padding. */
								minWidth: `${TOOLBAR_ICON_SIZE * 2 + 4 + 32}px`,
							}}
						>
							<IconDeviceDesktop
								size={TOOLBAR_ICON_SIZE}
								stroke={STROKE}
								style={row2TablerIconStyle}
							/>
						</Button>
					</Tooltip>

					<Tooltip content="Interaction mode" side="bottom">
						<Button
							type="button"
							appearance="default"
							size="lg"
							icon={
								<IconHandFinger size={TOOLBAR_ICON_SIZE} stroke={STROKE} style={row2TablerIconStyle} />
							}
							aria-label="Interaction mode"
							style={{ alignSelf: "stretch" }}
						/>
					</Tooltip>

					<Box flex="1" style={{ minWidth: "8px" }} />

					<Box
						display="flex"
						flexDirection="row"
						alignItems="stretch"
						gap="8"
						flexWrap="wrap"
						style={{ justifyContent: "flex-end" }}
					>
						<Tooltip content="Changes" side="bottom">
							<Button
								type="button"
								appearance="default"
								size="lg"
								icon={<IconList size={TOOLBAR_ICON_SIZE} stroke={STROKE} style={row2TablerIconStyle} />}
								iconPosition="start"
							>
								Changes
							</Button>
						</Tooltip>
						<Tooltip content="Code Editor" side="bottom">
							<Button
								type="button"
								appearance="default"
								size="lg"
								icon={<IconCode size={TOOLBAR_ICON_SIZE} stroke={STROKE} style={row2TablerIconStyle} />}
								iconPosition="start"
							>
								Code Editor
							</Button>
						</Tooltip>
						<Tooltip content="Activation" side="bottom">
							<Button
								type="button"
								appearance="default"
								size="lg"
								icon={
									<IconLayoutNavbar size={TOOLBAR_ICON_SIZE} stroke={STROKE} style={row2TablerIconStyle} />
								}
								iconPosition="start"
							>
								Activation
							</Button>
						</Tooltip>
						<Tooltip content="Redirect" side="bottom">
							<Button
								type="button"
								appearance="default"
								size="lg"
								icon={<IconLink size={TOOLBAR_ICON_SIZE} stroke={STROKE} style={row2TablerIconStyle} />}
								iconPosition="start"
							>
								Redirect
							</Button>
						</Tooltip>
						<Tooltip content="Build Variation" side="bottom">
							<Button
								type="button"
								appearance="default-opal"
								size="lg"
								icon={<IconAgent size={TOOLBAR_ICON_SIZE} style={row2TablerIconStyle} />}
								iconPosition="start"
							>
								Build Variation
							</Button>
						</Tooltip>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
