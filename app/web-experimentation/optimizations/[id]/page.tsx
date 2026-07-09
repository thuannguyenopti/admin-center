"use client";

import type {ReactNode} from "react";
import {useEffect, useMemo, useState} from "react";
import {useOpalVariationBuild} from "@/app/context/OpalVariationBuildContext";
import {
	consumePendingVariationBuild,
	getDynamicOptimizationById,
} from "@/app/web-experimentation/optimizations/dynamicOptimizationStorage";
import {
	appendStoredExtraVariation,
	getRemovedVariationKeys,
	getStoredExtraVariations,
} from "@/app/web-experimentation/optimizations/optimizationVariationsStorage";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {
	Box,
	Heading,
	Text as AxiomText,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import {
	IconChevronDown,
	IconEllipsisSolid,
	IconLayout,
	IconUsers,
	IconAdjustmentsHorizontal,
	IconCode,
	IconGitFork,
	IconChartLine,
	IconLayoutGrid,
	IconFlask,
	IconCalendar,
	IconList,
	IconTag,
	IconClockRotateLeft,
	IconPlus,
} from "@/app/lib/axiom-icons";
import {IconEye, IconChartColumn} from "@optimizely/axiom-icons";
import {getOptimizationById} from "../mockData";
import type {OptimizationStatus} from "../mockData";
import {
	evenTrafficPercents,
	resolveExperimentVariations,
	type VariationRow,
} from "../variationSets";
import {VariationPreviewThumb} from "../VariationPreviewThumb";

const ICON_STROKE = 1.5;
const ICON_NAV = 18;

function SidebarNavItem({
	icon,
	label,
	active,
	disabled,
	indicator,
	onClick,
}: {
	icon: ReactNode;
	label: string;
	active?: boolean;
	disabled?: boolean;
	indicator?: "attention";
	onClick?: () => void;
}) {
	const accent = "var(--ax-colors-fg-default)";
	const muted = "var(--ax-colors-fg-secondary)";
	return (
		<Button
			appearance="subtle"
			size="md"
			disabled={disabled}
			onClick={onClick}
			style={{
				width: "100%",
				justifyContent: "flex-start",
				minHeight: "36px",
				padding: "6px 8px",
				borderRadius: "6px",
				fontWeight: active ? 600 : 400,
				backgroundColor: active ? "var(--ax-colors-bg-default-pressed)" : undefined,
				color: active ? accent : "var(--ax-colors-fg-default)",
			}}
		>
			<Box display="flex" alignItems="center" gap="10" w="full" style={{minWidth: 0}}>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{
						flexShrink: 0,
						color: active ? accent : muted,
					}}
				>
					{icon}
				</Box>
				<AxiomText
					fontSize="sm"
					style={{
						flex: 1,
						textAlign: "left",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						color: active ? accent : undefined,
					}}
				>
					{label}
				</AxiomText>
				{indicator === "attention" ? (
					<Box
						style={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							backgroundColor: "#f97316",
							flexShrink: 0,
							boxShadow: "0 0 0 1px rgba(255,255,255,0.6)",
						}}
						aria-label="Attention"
					/>
				) : null}
			</Box>
		</Button>
	);
}

function SidebarAccordionSection({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<Box borderT="1" borderColor="border.tertiary" pt="12" mt="12" w="full">
			<Disclosure defaultOpen>
				<DisclosureTrigger chevronPosition="start">
					<Box
						display="flex"
						alignItems="center"
						w="full"
						py="4"
						style={{paddingLeft: 2}}
					>
						<AxiomText fontSize="sm" fontWeight="600" color="fg.default">
							{title}
						</AxiomText>
					</Box>
				</DisclosureTrigger>
				<DisclosureContent asChild>
					<Box
						display="flex"
						flexDirection="column"
						gap="2"
						mt="4"
						w="full"
						style={{paddingLeft: "20px"}}
					>
						{children}
					</Box>
				</DisclosureContent>
			</Disclosure>
		</Box>
	);
}

export default function OptimizationExperimentPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string | undefined;
	const optimization = useMemo(() => {
		if (!id) return undefined;
		return getOptimizationById(id) ?? getDynamicOptimizationById(id);
	}, [id]);
	const [status, setStatus] = useState<OptimizationStatus | null>(null);
	const [persistedExtraVariations, setPersistedExtraVariations] = useState<VariationRow[]>([]);
	const [removedVariationKeys, setRemovedVariationKeys] = useState<string[]>([]);
	const [variationBuilding, setVariationBuilding] = useState(false);
	const {runVariationBuild} = useOpalVariationBuild();

	useEffect(() => {
		setStatus(null);
	}, [id]);

	useEffect(() => {
		if (!id) {
			setPersistedExtraVariations([]);
			setRemovedVariationKeys([]);
			return;
		}
		setPersistedExtraVariations(getStoredExtraVariations(id));
		setRemovedVariationKeys(getRemovedVariationKeys(id));
	}, [id]);

	useEffect(() => {
		if (!id) return;
		const pending = consumePendingVariationBuild();
		if (!pending || pending.optimizationId !== id) return;
		setVariationBuilding(true);
		runVariationBuild(pending)
			.then((row) => {
				appendStoredExtraVariation(id, row);
				setPersistedExtraVariations(getStoredExtraVariations(id));
				setVariationBuilding(false);
			})
			.catch(() => {
				setVariationBuilding(false);
			});
	}, [id, runVariationBuild]);

	const effectiveStatus = status ?? optimization?.status ?? "Not Started";
	const variations = useMemo(
		() => resolveExperimentVariations(id ?? "", persistedExtraVariations, removedVariationKeys),
		[id, persistedExtraVariations, removedVariationKeys]
	);
	const trafficPercents = useMemo(
		() => evenTrafficPercents(variations.length),
		[variations.length]
	);

	if (!id || !optimization) {
		return (
			<Box display="flex" flexDirection="column" gap="16" p="24" style={{maxWidth: "480px"}}>
				<Heading level="3">Experiment not found</Heading>
				<AxiomText color="fg.secondary">No optimization matches this link.</AxiomText>
				<Link
					href="/web-experimentation/optimizations"
					style={{color: "var(--ax-colors-fg-default)"}}
				>
					← Back to Optimizations
				</Link>
			</Box>
		);
	}

	const resultsHref = `/web-experimentation/optimizations/${optimization.id}/results`;
	const visualEditorHrefForKey = (variationKey: string) =>
		`/web-experimentation/optimizations/${optimization.id}/visual-editor?variation=${encodeURIComponent(variationKey)}`;
	const canStart = effectiveStatus === "Not Started" || effectiveStatus === "Paused";

	return (
		<Box
			display="flex"
			flexDirection="row"
			w="full"
			flex="1"
			h="full"
			style={{minHeight: 0, alignSelf: "stretch"}}
		>
			{/* Experiment context sidebar — flush to primary nav (left) and below GlobalBar (top); padding is internal only */}
			<Box
				className="scrollbar-hide"
				style={{flex: "0 0 288px", width: "288px", minHeight: 0}}
				borderR="1"
				borderColor="border.tertiary"
				bg="bg.default"
				display="flex"
				flexDirection="column"
				overflow="auto"
				pl="12"
				pr="12"
				pb="24"
				pt="16"
			>
				<Box mb="16">
					<Link
						href="/web-experimentation/optimizations"
						style={{
							color: "var(--ax-colors-fg-default)",
							textDecoration: "none",
							fontSize: "14px",
							fontWeight: 500,
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
						}}
					>
						← Overview
					</Link>
				</Box>

				<AxiomText
					fontSize="xs"
					color="fg.secondary"
					mb="8"
					style={{letterSpacing: "0.02em"}}
				>
					{optimization.type}
				</AxiomText>

				<Heading
					level="2"
					style={{
						fontSize: "1.125rem",
						lineHeight: 1.35,
						marginBottom: "10px",
						fontWeight: 600,
					}}
				>
					{optimization.name}
				</Heading>
				<AxiomText fontSize="sm" color="fg.secondary" style={{lineHeight: 1.5}}>
					{optimization.description}
				</AxiomText>

				<Box mt="20">
					<Box display="flex" flexDirection="column" gap="10">
						<Box style={{maxWidth: "100%"}}>
							<Menu
								options={[
									{label: "Not Started", execute: () => setStatus("Not Started")},
									{label: "Running", execute: () => setStatus("Running")},
									{label: "Paused", execute: () => setStatus("Paused")},
									{label: "Concluded", execute: () => setStatus("Concluded")},
									{label: "Archived", execute: () => setStatus("Archived")},
								]}
							>
								<MenuTrigger asChild>
									<LabelMenuButton label="Status" style={{width: "100%"}}>
										{effectiveStatus}
									</LabelMenuButton>
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</Box>
						<Box
							display="flex"
							gap="8"
							alignItems="center"
							w="full"
							style={{minWidth: 0}}
						>
							<Box flex="1" style={{minWidth: 0}}>
								<Button
									appearance="primary"
									size="lg"
									disabled={!canStart}
									style={{width: "100%", justifyContent: "center"}}
								>
									Start Experiment
								</Button>
							</Box>
							<Button
								appearance="subtle"
								size="lg"
								icon={<IconEye size={20} />}
								aria-label="Preview experiment"
								style={{
									border: "1px solid var(--ax-colors-border-secondary)",
									borderRadius: "8px",
									minWidth: "40px",
									minHeight: "40px",
									flexShrink: 0,
									padding: 0,
								}}
							/>
							<Link
								href={resultsHref}
								style={{display: "inline-flex", flexShrink: 0}}
								title="View results"
							>
								<Button
									appearance="subtle"
									size="lg"
									icon={<IconChartColumn size={20} />}
									aria-label="View results"
									style={{
										border: "1px solid var(--ax-colors-border-secondary)",
										borderRadius: "8px",
										minWidth: "40px",
										minHeight: "40px",
										padding: 0,
									}}
								/>
							</Link>
						</Box>
					</Box>
				</Box>

				<SidebarAccordionSection title="Target">
					<SidebarNavItem
						icon={<IconLayout size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Activations"
						disabled
					/>
					<SidebarNavItem
						icon={<IconUsers size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Audiences"
						disabled
					/>
				</SidebarAccordionSection>

				<SidebarAccordionSection title="Design">
					<SidebarNavItem
						icon={<IconAdjustmentsHorizontal size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Variations"
						active
					/>
					<SidebarNavItem
						icon={<IconCode size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Shared Code"
						disabled
					/>
					<SidebarNavItem
						icon={<IconGitFork size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Traffic Allocation"
						disabled
					/>
				</SidebarAccordionSection>

				<SidebarAccordionSection title="Track">
					<SidebarNavItem
						icon={<IconChartLine size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Metrics"
						disabled
						indicator="attention"
					/>
					<SidebarNavItem
						icon={<IconLayoutGrid size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Integrations"
						disabled
					/>
				</SidebarAccordionSection>

				<SidebarAccordionSection title="Plan">
					<SidebarNavItem
						icon={<IconFlask size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Hypothesis"
						disabled
					/>
					<SidebarNavItem
						icon={<IconCalendar size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Schedule"
						disabled
					/>
					<SidebarNavItem
						icon={<IconList size={ICON_NAV} stroke={ICON_STROKE} />}
						label="Summary"
						disabled
					/>
				</SidebarAccordionSection>

				<SidebarAccordionSection title="Settings">
					<SidebarNavItem
						icon={<IconTag size={ICON_NAV} stroke={ICON_STROKE} />}
						label="API Names"
						disabled
					/>
					<SidebarNavItem
						icon={<IconClockRotateLeft size={ICON_NAV} stroke={ICON_STROKE} />}
						label="History"
						disabled
					/>
				</SidebarAccordionSection>
			</Box>

			{/* Variations workspace */}
			<Box
				className="scrollbar-hide"
				flex="1"
				display="flex"
				flexDirection="column"
				pl="32"
				pr="32"
				pt="24"
				pb="32"
				overflow="auto"
				style={{minHeight: 0, minWidth: 0}}
			>
				<Heading level="3" mb="16">
					Variations
				</Heading>

				<Table style={{width: "100%"}}>
					<thead>
						<Tr>
							<Th style={{width: "32%"}}>Name</Th>
							<Th style={{width: "12%"}}>Traffic</Th>
							<Th style={{width: "26%"}}>Preview</Th>
							<Th style={{width: "30%"}}>Actions</Th>
						</Tr>
					</thead>
					<tbody>
						{variations.map((row, rowIndex) => (
							<Tr
								key={row.key}
								url={visualEditorHrefForKey(row.key)}
								suppressActiveStyle
							>
								<Td style={{borderRight: "none"}}>
									<Box
										display="flex"
										flexDirection="row"
										gap="8"
										alignItems="start"
									>
										<AxiomText
											fontSize="sm"
											fontWeight="600"
											color="fg.default"
											style={{
												flexShrink: 0,
												minWidth: "1.25rem",
												textAlign: "center",
											}}
										>
											{row.letter}
										</AxiomText>
										<Box
											display="flex"
											flexDirection="column"
											gap="6"
											style={{flex: 1, minWidth: 0}}
										>
											<AxiomText
												fontSize="sm"
												fontWeight="600"
												color="fg.default"
											>
												{row.title}
											</AxiomText>
											<AxiomText
												fontSize="xs"
												color="fg.secondary"
												style={{lineHeight: 1.45}}
											>
												{row.description}
											</AxiomText>
										</Box>
									</Box>
								</Td>
								<Td>
									<AxiomText fontSize="sm" color="fg.secondary">
										{trafficPercents[rowIndex] ?? "—"}
									</AxiomText>
								</Td>
								<Td>
									<Box
										className="group relative inline-flex shrink-0"
										style={{
											width: 160,
											height: 88,
											borderRadius: 6,
											verticalAlign: "top",
										}}
									>
										<VariationPreviewThumb variant={row.preview} />
										<Box
											className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
											style={{
												borderRadius: 6,
												backgroundColor: "rgba(15, 23, 42, 0.42)",
											}}
											aria-hidden
										>
											<Button
												type="button"
												appearance="default"
												size="sm"
												icon={<IconEye size={20} />}
												aria-label={`Preview ${row.title}`}
												tabIndex={-1}
												style={{
													pointerEvents: "none",
													boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
												}}
											/>
										</Box>
									</Box>
								</Td>
								<Td style={{borderLeft: "none"}}>
									<Box
										display="flex"
										gap="8"
										alignItems="center"
										onClick={(e) => e.stopPropagation()}
									>
										<Menu
											options={[
												{
													label: "Edit with New Editor",
													execute: () =>
														router.push(
															visualEditorHrefForKey(row.key)
														),
												},
												{
													label: "Edit with Legacy Editor",
													execute: () => {},
												},
											]}
										>
											<MenuTrigger asChild>
												<Button
													appearance="default"
													size="md"
													icon={<IconChevronDown size={16} />}
													iconPosition="end"
												>
													Edit
												</Button>
											</MenuTrigger>
											<MenuContent />
										</Menu>
										<Menu
											options={[
												{label: "Rename", execute: () => {}},
												{label: "Duplicate", execute: () => {}},
												{label: "Delete", execute: () => {}},
											]}
										>
											<MenuTrigger asChild>
												<Button
													appearance="subtle"
													size="md"
													icon={<IconEllipsisSolid size={16} />}
													aria-label="More actions"
												/>
											</MenuTrigger>
											<MenuContent />
										</Menu>
									</Box>
								</Td>
							</Tr>
						))}
						{variationBuilding ? (
							<Tr key="opal-variation-building" suppressActiveStyle>
								<td
									colSpan={4}
									className="p-4 border-t align-top"
									style={{
										borderColor: "var(--ax-colors-border-tertiary)",
										borderRight: "none",
										borderLeft: "none",
									}}
								>
									<Box display="flex" alignItems="center" gap="10">
										<Box
											className="opal-loading-spinner"
											style={{
												width: "18px",
												height: "18px",
												flexShrink: 0,
												border: "2px solid var(--opal-spinner-border, var(--ax-colors-border-secondary))",
												borderTopColor:
													"var(--opal-spinner-top, var(--ax-colors-fg-default))",
												borderRadius: "50%",
											}}
										/>
										<AxiomText fontSize="sm" color="fg.secondary">
											Opal is creating your variation…
										</AxiomText>
									</Box>
								</td>
							</Tr>
						) : null}
					</tbody>
				</Table>

				<Box mt="16">
					<Button
						appearance="default"
						size="md"
						icon={<IconPlus size={20} stroke={2} />}
						iconPosition="start"
					>
						Add Variation
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
