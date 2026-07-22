"use client";

import {
	Badge,
	Box,
	Breadcrumb,
	Button,
	Field,
	Heading,
	Input,
	Tooltip,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	IconArrowLeft,
	IconArrowRight,
	IconArrowRightArrowLeft,
	IconMessageLines,
	IconPen,
} from "@optimizely/axiom-icons";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_VAU_EXAMPLES, VAUS, type VAU, type VAUExample, type VAUTag } from "@/app/opal/data/vaus";
import { Aside } from "@/app/context/LayoutContext";
import { IMChatPanel } from "@/app/opal/im/components/IMChatPanel";

// ─── Variant data ─────────────────────────────────────────────────────────────

type Variant = {
	name: string;
	avatar: string;
	avatarBg: string;
	tags: VAUTag[];
	traits: string[];
};

type VariantPersonality = { bg: string; traits: string[] };

const VARIANT_LABELS = ["Strategic", "Empathetic", "Data-led"];

const VARIANT_TRAITS: VariantPersonality[] = [
	{ bg: "",        traits: ["Strategic", "Direct", "Outcome-focused"] },
	{ bg: "#FAF6E8", traits: ["Empathetic", "Story-first", "Warm"] },
	{ bg: "#FAF6E8", traits: ["Analytical", "Precise", "Data-led"] },
];

// Per-VAU variant avatar overrides (variants B and C)
const VAU_VARIANT_AVATARS: Record<string, [string, string]> = {
	"chief-of-staff": ["/avatars/im-bullseye-b.png",     "/avatars/im-bullseye-c.png"],
	frank: ["/avatars/im-telescope-b.png",    "/avatars/im-telescope-c.png"],
	henry: ["/avatars/im-chess-knight-b.png", "/avatars/im-chess-knight-c.png"],
};

function getVariants(vau: VAU): Variant[] {
	const overrides = VAU_VARIANT_AVATARS[vau.id];
	return VARIANT_TRAITS.map((p, i) => ({
		name: vau.name,
		avatar: i === 0 ? vau.avatar : (overrides?.[i - 1] ?? vau.avatar),
		avatarBg: i === 0 ? vau.avatarBg : p.bg,
		tags: vau.tags,
		traits: p.traits,
	}));
}

// ─── Static pitch stats ───────────────────────────────────────────────────────

type PitchStat = { headline: string; sub: string };

function getPitchStats(vau: VAU): PitchStat[] {
	return [
		{ headline: "Runs 24/7", sub: "No days off, no OOO" },
		{ headline: `${vau.tools.length} tools`, sub: "Connected on day one" },
		{ headline: "8+ hrs back", sub: "Every single week" },
		{ headline: "Day one", sub: "No ramp up needed" },
	];
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
	return (
		<Text
			style={{
				fontSize: 20,
				fontWeight: 600,
				letterSpacing: "0.4px",
				lineHeight: 1.1,
				color: "var(--ax-colors-fg-default)",
			}}
		>
			{label}
		</Text>
	);
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: PitchStat }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.secondary"
			rounded="xl"
			style={{
				padding: 20,
				minWidth: 180,
				flex: 1,
				display: "flex",
				flexDirection: "column",
				gap: 4,
				minHeight: 88,
				justifyContent: "flex-start",
			}}
		>
			<Text
				style={{
					fontSize: 26,
					fontWeight: 800,
					color: "var(--ax-colors-fg-default)",
					lineHeight: 1.04,
					letterSpacing: "0.56px",
				}}
			>
				{stat.headline}
			</Text>
			<Text color="fg.secondary" style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: "0.28px" }}>
				{stat.sub}
			</Text>
		</Box>
	);
}

// ─── Action card ──────────────────────────────────────────────────────────────

function ActionCard({ example, vau }: { example: VAUExample; vau: VAU }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.secondary"
			rounded="xl"
			style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
		>
			<Box display="flex" gap="12" alignItems="start">
				<Box
					rounded="lg"
					style={{
						width: 56,
						height: 56,
						minWidth: 56,
						background: "radial-gradient(circle, rgba(245,243,255,1) 0%, rgba(229,239,255,1) 50%, rgba(221,214,254,1) 100%)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 28,
						lineHeight: 1,
						flexShrink: 0,
					}}
				>
					{example.emoji}
				</Box>
				<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0, justifyContent: "center", height: 56 }}>
					<Text
						style={{
							fontSize: 18,
							fontWeight: 600,
							color: "var(--ax-colors-fg-default)",
							lineHeight: 1.1,
							letterSpacing: "0.2px",
						}}
					>
						{example.title}
					</Text>
					<Text
						style={{
							fontSize: 11,
							color: "var(--ax-colors-fg-secondary)",
							letterSpacing: "0.36px",
							textTransform: "uppercase",
							lineHeight: 1.25,
						}}
					>
						{example.frequency}
					</Text>
				</Box>
			</Box>
			<Box rounded="md" style={{ background: "var(--ax-colors-bg-secondary)", padding: "12px 16px" }}>
				<Text color="fg.secondary" fontSize="md" lineClamp="3" style={{ lineHeight: 1.5 }}>
					{example.description ?? vau.description}
				</Text>
			</Box>
		</Box>
	);
}

// ─── Trait pill ───────────────────────────────────────────────────────────────

const TRAIT_STYLE: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	height: 24,
	padding: "0 10px",
	borderRadius: 999,
	background: "var(--ax-colors-bg-tertiary)",
	fontSize: 11,
	fontWeight: 500,
	letterSpacing: "0.3px",
	textTransform: "uppercase",
	color: "var(--ax-colors-fg-default)",
	whiteSpace: "nowrap",
	border: "1px solid var(--ax-colors-border-secondary)",
};

// ─── Name suggestions per VAU id ─────────────────────────────────────────────

const NAME_SUGGESTIONS: Record<string, [string, string, string]> = {
	"chief-of-staff":  ["Sam", "Robin", "Bergdorf"],
	henry:  ["Miles", "Petra", "Quinn"],
	poppy:  ["Poppy", "Fern", "Cleo"],
	jonas:  ["Lex", "Nadia", "Remy"],
	kerby:  ["Kai", "Sloane", "Dario"],
	frank:  ["Frankie", "Sable", "Cruz"],
	mayling: ["Vera", "Lena", "Clio"],
	tony:   ["Rex", "Mira", "Dash"],
};

const DEFAULT_SUGGESTIONS: [string, string, string] = ["Alex", "Jordan", "Sasha"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DirectoryDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const vau = useMemo(() => VAUS.find((v) => v.id === params?.id), [params?.id]);
	const [selectedVariant, setSelectedVariant] = useState(0);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [showKeyHandoff, setShowKeyHandoff] = useState(false);
	const [showIMPanel, setShowIMPanel] = useState(false);
	const [vauName, setVauName] = useState("");

	const variants = useMemo(() => (vau ? getVariants(vau) : []), [vau]);

	useEffect(() => {
		if (!showKeyHandoff) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Enter") router.push(`/opal/virtual-teammates/${vau?.id}?setup=1&name=${encodeURIComponent(displayName)}&variant=${selectedVariant}&avatar=${encodeURIComponent(activeVariant.avatar)}`);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [showKeyHandoff, router, vau?.id]);

	if (!vau) {
		return (
			<Box px="32" py="24">
				<Text color="fg.tertiary">No teammate found for &ldquo;{params?.id}&rdquo;.</Text>
			</Box>
		);
	}

	const examples: VAUExample[] = vau.examples ?? DEFAULT_VAU_EXAMPLES;
	const pitchStats = getPitchStats(vau);
	const activeVariant = variants[selectedVariant];
	const suggestions = NAME_SUGGESTIONS[vau.id] ?? DEFAULT_SUGGESTIONS;

	const displayName = vauName.trim() || vau.name;

	// ─── Key handoff overlay (fixed, appears on top of onboarding) ──────────────
	const KeyHandoffOverlay = showKeyHandoff ? (
		<Box style={{
			position: "fixed", inset: 0, zIndex: 50,
			display: "flex", alignItems: "center", justifyContent: "center",
			backgroundColor: "rgba(0,0,0,0.45)",
		}}>
			<Box
				bg="bg.default"
				rounded="xl"
				style={{
					display: "flex",
					overflow: "hidden",
					width: 900,
					maxWidth: "calc(100vw - 64px)",
					minHeight: 480,
				}}
			>
				{/* Left — copy + actions */}
				<Box style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
					<Box style={{ flex: 1, display: "flex", flexDirection: "column", gap: 40, justifyContent: "center", padding: 48 }}>
						<Box display="flex" flexDirection="column" gap="24">
							<Heading
								level="1"
								style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.04, letterSpacing: "0.5px", color: "var(--ax-colors-fg-default)" }}
							>
								Time to hand {displayName} the keys
							</Heading>
							<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: 1.5, letterSpacing: "0.32px" }}>
								Every new teammate gets their own account — {displayName}&apos;s no different. Sign in as {displayName} to connect the tools they&apos;ll use every day.
							</Text>
						</Box>
						<Button
							appearance="primary"
							size="lg"
							icon={<IconArrowRightArrowLeft size={16} />}
							iconPosition="start"
							onClick={() => router.push(`/opal/virtual-teammates/${vau.id}?setup=1&name=${encodeURIComponent(displayName)}&avatar=${encodeURIComponent(activeVariant.avatar)}`)}
						>
							Sign in as {displayName}
						</Button>
					</Box>
					<Box style={{ padding: 24, display: "flex", justifyContent: "center", borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
						<Button size="lg" icon={<IconArrowLeft size={16} />} iconPosition="start" onClick={() => setShowKeyHandoff(false)}>
							Back
						</Button>
					</Box>
				</Box>
				{/* Right — illustration */}
				<Box style={{ width: 420, flexShrink: 0, backgroundColor: "#EEEFFE", overflow: "hidden" }}>
					<Image src="/avatars/im-keys.png" alt="" width={420} height={480} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
				</Box>
			</Box>
		</Box>
	) : null;

	if (showOnboarding) {
		return (
			<>
				{KeyHandoffOverlay}
				<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="full" style={{ flex: 1 }}>
					<Box display="flex" flexDirection="column" alignItems="center" gap="32" style={{ width: 440 }}>
						{/* Avatar with edit button */}
						<Box display="flex" flexDirection="column" alignItems="center" gap="32">
							<Box style={{ position: "relative", display: "inline-block" }}>
								<Box border="1" borderColor="border.default" rounded="xl" style={{ width: 139, height: 153, overflow: "hidden", backgroundColor: activeVariant.avatarBg }}>
									<Image src={activeVariant.avatar} alt={activeVariant.name} width={139} height={153} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
								</Box>
								<Box bg="bg.default" border="1" borderColor="border.default" rounded="full" style={{ position: "absolute", top: 8, right: -12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
									<IconPen size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
								</Box>
							</Box>
							<Box display="flex" flexDirection="column" alignItems="center" gap="12" style={{ textAlign: "center" }}>
								<Heading level="1" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.04, letterSpacing: "0.56px", color: "var(--ax-colors-fg-default)" }}>
									First day on the job
								</Heading>
								<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: 1.5, letterSpacing: "0.32px", maxWidth: 420 }}>
									Choose a name for your {vau.templateName.toLowerCase()}. Go with whatever feels right — you can update it anytime down the road.
								</Text>
							</Box>
						</Box>
						{/* Name input + actions wrapped in form so Enter submits */}
						<form
							style={{ width: "100%", display: "flex", flexDirection: "column", gap: 32 }}
							onSubmit={(e) => { e.preventDefault(); if (vauName.trim()) setShowKeyHandoff(true); }}
						>
							<Field description={`Suggestions: ${suggestions.join(", ")}`}>
								<Input
									size="lg"
									placeholder={`Eg. ${vau.name}`}
									value={vauName}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVauName(e.target.value.replace(/\\/g, ""))}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
										if (e.key === "ArrowRight" && !vauName) setVauName(vau.name);
									}}
									style={{ width: "100%" }}
								/>
							</Field>
							{/* Actions */}
							<Box display="flex" gap="8" alignItems="center">
								<Button type="button" appearance="subtle" size="lg" onClick={() => router.push("/opal/directory")}>
									Work with a different teammate
								</Button>
								<Button type="submit" appearance="primary" size="lg" icon={<IconArrowRight size={16} />} iconPosition="end" disabled={!vauName.trim()}>
									Next
								</Button>
							</Box>
						</form>
					</Box>
				</Box>
			</>
		);
	}

	return (
		<>
		<Box display="flex" flexDirection="column" gap="0" h="full" overflow="auto">
			{/* Breadcrumb */}
			<Box px="32" py="16">
				<Breadcrumb
					items={[
						{ label: "Directory", href: "/opal/directory" },
						{ label: vau.templateName },
					]}
				/>
			</Box>

			{/* Main content */}
			<Box
				display="flex"
				gap="48"
				px="32"
				py="32"
				style={{ alignItems: "flex-start", flex: 1, minWidth: 0 }}
			>
				{/* Left column — large avatar + variant thumbnails */}
				<Box display="flex" flexDirection="column" gap="20" style={{ flexShrink: 0, width: "clamp(160px, 28%, 300px)" }}>
					{/* Large avatar with personality badge overlay */}
					<Box style={{ position: "relative", width: "100%" }}>
						<Box
							border="1"
							borderColor="border.secondary"
							rounded="xl"
							style={{
								width: "100%",
								aspectRatio: "300 / 280",
								overflow: "hidden",
								backgroundColor: activeVariant.avatarBg,
								transition: "background-color 0.2s ease",
							}}
						>
							<Image
								src={activeVariant.avatar}
								alt={activeVariant.name}
								width={300}
								height={280}
								unoptimized
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						</Box>
						{activeVariant.traits.length > 0 && (
							<Box style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}>
								<Tooltip content={activeVariant.traits.join(" · ")}>
									<Badge intent="information">{VARIANT_LABELS[selectedVariant]}</Badge>
								</Tooltip>
							</Box>
						)}
					</Box>

					{/* Variant thumbnails with selection ring */}
					<Box display="flex" flexDirection="column" gap="10">
						<Text
							style={{
								fontSize: 11,
								color: "var(--ax-colors-fg-secondary)",
								letterSpacing: "0.36px",
								textTransform: "uppercase",
								lineHeight: 1.25,
							}}
						>
							Explore other candidates
						</Text>
						<Box display="flex" gap="12">
							{variants.map((variant, i) => {
								const isSelected = i === selectedVariant;
								return (
									<button
										key={i}
										onClick={() => setSelectedVariant(i)}
										style={{
											flex: "1 1 0",
											minWidth: 48,
											maxWidth: 88,
											aspectRatio: "1 / 1",
											borderRadius: 12,
											border: "1px solid var(--ax-colors-border-secondary)",
											outline: isSelected
												? "2px solid var(--ax-colors-border-focus)"
												: "none",
											outlineOffset: isSelected ? 2 : 0,
											overflow: "hidden",
											backgroundColor: variant.avatarBg,
											cursor: "pointer",
											padding: 0,
											transition: "outline 0.1s",
										}}
									>
										<Tooltip content={VARIANT_LABELS[i] ?? `${vau.templateName}, ${variant.name}`}>
											<Image
												src={variant.avatar}
												alt={variant.name}
												width={88}
												height={88}
												unoptimized
												style={{ width: "100%", height: "100%", objectFit: "cover" }}
											/>
										</Tooltip>
									</button>
								);
							})}
						</Box>
					</Box>
				</Box>

				{/* Right column — hero + sections */}
				<Box display="flex" flexDirection="column" gap="40" style={{ flex: 1, minWidth: 0 }}>
					{/* Hero */}
					<Box display="flex" flexDirection="column" gap="20">
						<Box display="flex" flexDirection="column" gap="12">
							<Heading
								level="1"
								style={{
									fontSize: 44,
									fontWeight: 800,
									lineHeight: 1.04,
									letterSpacing: "-0.5px",
									color: "var(--ax-colors-fg-default)",
								}}
							>
								{vau.templateName}
							</Heading>
							{/* Template skill tags — same for all candidates */}
							<Box display="flex" gap="8" alignItems="center" style={{ flexWrap: "wrap" }}>
								{activeVariant.tags.map((tag) => (
									<span key={tag.label} style={TRAIT_STYLE}>{tag.label}</span>
								))}
							</Box>
						</Box>

						<Text
							color="fg.secondary"
							style={{ fontSize: 16, lineHeight: 1.5, letterSpacing: "0.32px", maxWidth: 580 }}
						>
							{vau.description}
						</Text>

						<Box display="flex" gap="12" alignItems="center">
							<Button
								appearance="primary"
								size="lg"
								icon={<IconArrowRight size={16} />}
								iconPosition="end"
								onClick={() => setShowOnboarding(true)}
							>
								Work together
							</Button>
							<Button
								size="lg"
								icon={<IconMessageLines size={16} />}
								iconPosition="start"
								onClick={() => {
									setShowIMPanel(true);
								}}
							>
								Ask me anything
							</Button>
						</Box>
					</Box>

					{/* My pitch */}
					<Box display="flex" flexDirection="column" gap="16">
						<SectionHeader label="My pitch" />
						<Box display="flex" gap="16" style={{ flexWrap: "wrap" }}>
							{pitchStats.map((stat) => (
								<StatCard key={stat.headline} stat={stat} />
							))}
						</Box>
					</Box>

					{/* What I do */}
					<Box display="flex" flexDirection="column" gap="16">
						<SectionHeader label="What I do" />
						<Box style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
							{examples.map((ex) => (
								<ActionCard key={ex.title} example={ex} vau={vau} />
							))}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
		{showIMPanel && vau && (
			<Aside>
				{(() => {
					const cosConvId = vau.id === "chief-of-staff"
						? selectedVariant === 2
							? "conv-vau-cos-analytic"
							: selectedVariant === 1
							? "conv-vau-cos-empathetic"
							: "conv-vau-chief-of-staff"
						: `conv-vau-${vau.templateName.toLowerCase().replace(/\s+/g, "-")}`;
					return (
						<IMChatPanel
							key={cosConvId}
							convId={cosConvId}
							vauName={vau.id === "chief-of-staff" ? vau.templateName : vau.name}
							vauRole={vau.templateName}
							vauAvatar={activeVariant.avatar}
							onClose={() => setShowIMPanel(false)}
						/>
					);
				})()}
			</Aside>
		)}
		</>
	);
}
