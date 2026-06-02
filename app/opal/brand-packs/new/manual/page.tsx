"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconArrowLeft,
	IconArrowRight,
	IconCheck,
	IconPlus,
	IconXmark,
} from "@optimizely/axiom-icons";
import { BrandPackPageHeader } from "../../components/BrandPackPageHeader";

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "basics" | "colors" | "typography" | "tone" | "channels";

const STEPS: Array<{ id: Step; label: string; description: string }> = [
	{ id: "basics", label: "Basics", description: "Name and purpose" },
	{ id: "colors", label: "Colors", description: "Brand palette" },
	{ id: "typography", label: "Typography", description: "Fonts & scale" },
	{ id: "tone", label: "Tone of Voice", description: "Writing style" },
	{ id: "channels", label: "Channels", description: "Where you publish" },
];

const TONE_KEYWORDS = [
	"Bold", "Playful", "Professional", "Approachable", "Authoritative",
	"Warm", "Innovative", "Trustworthy", "Energetic", "Minimal",
	"Friendly", "Sophisticated", "Direct", "Empathetic", "Witty",
];

const CHANNEL_OPTIONS = [
	"Email", "Social", "Paid", "Blog", "Video", "Print", "Events", "Web",
];

const COLOR_ROLES = [
	{ role: "primary", label: "Primary" },
	{ role: "secondary", label: "Secondary" },
	{ role: "accent", label: "Accent" },
	{ role: "neutral", label: "Neutral" },
	{ role: "background", label: "Background" },
	{ role: "text", label: "Text" },
] as const;

const BRAND_PACKS_HOME = "/opal/context?tab=brand-packs";

// ── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current, steps }: { current: Step; steps: typeof STEPS }) {
	const currentIdx = steps.findIndex((s) => s.id === current);
	return (
		<Box
			alignItems="center"
			display="flex"
			gap="0"
			style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0, padding: "0 32px" }}
		>
			{steps.map((s, i) => {
				const isDone = i < currentIdx;
				const isActive = s.id === current;
				return (
					<Box
						key={s.id}
						alignItems="center"
						display="flex"
						gap="8"
						style={{
							borderBottom: `2px solid ${isActive ? "var(--ax-colors-fg-default)" : "transparent"}`,
							marginBottom: -1,
							padding: "12px 20px",
						}}
					>
						<Box
							alignItems="center"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{
								background: isDone
									? "var(--ax-colors-bg-accent)"
									: isActive
									? "var(--ax-colors-bg-default)"
									: "var(--ax-colors-bg-secondary)",
								border: isActive ? "1.5px solid var(--ax-colors-border-default)" : "none",
								flexShrink: 0,
								fontSize: 11,
								fontWeight: 600,
								height: 22,
								width: 22,
								color: isDone ? "var(--ax-colors-fg-default-inverse)" : isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
							}}
						>
							{isDone ? <IconCheck size={11} /> : i + 1}
						</Box>
						<Box display="flex" flexDirection="column" gap="2">
							<Text
								fontWeight={isActive ? "600" : "400"}
								style={{
									color: isActive ? "var(--ax-colors-fg-default)" : isDone ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
									fontSize: 13,
								}}
							>
								{s.label}
							</Text>
						</Box>
					</Box>
				);
			})}
		</Box>
	);
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="24"
			rounded="xl"
			shadow="sm"
		>
			<Box display="flex" flexDirection="column" gap="4">
				<Text fontWeight="600" style={{ fontSize: 15 }}>{title}</Text>
				{description && <Text color="fg.secondary" fontSize="sm">{description}</Text>}
			</Box>
			<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
			{children}
		</Box>
	);
}

// ── Color row ────────────────────────────────────────────────────────────────

function ColorRow({
	role,
	label,
	hex,
	name,
	onChange,
	onRemove,
}: {
	role: string;
	label: string;
	hex: string;
	name: string;
	onChange: (field: "hex" | "name", val: string) => void;
	onRemove?: () => void;
}) {
	const inputStyle: React.CSSProperties = {
		background: "var(--ax-colors-bg-secondary)",
		border: "1.5px solid var(--ax-colors-border-default)",
		borderRadius: 8,
		color: "var(--ax-colors-fg-default)",
		fontFamily: "inherit",
		fontSize: 13,
		outline: "none",
		padding: "6px 10px",
	};

	return (
		<Box alignItems="center" display="flex" gap="12">
			{/* Color swatch (clickable native color input) */}
			<label style={{ cursor: "pointer", flexShrink: 0 }}>
				<Box
					rounded="md"
					style={{
						background: hex || "#cccccc",
						border: "2px solid var(--ax-colors-border-default)",
						height: 36,
						width: 36,
					}}
				/>
				<input
					type="color"
					value={hex || "#cccccc"}
					onChange={(e) => onChange("hex", e.target.value)}
					style={{ display: "none" }}
				/>
			</label>

			{/* Hex */}
			<input
				value={hex}
				onChange={(e) => onChange("hex", e.target.value)}
				placeholder="#000000"
				style={{ ...inputStyle, width: 100 }}
				onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
				onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
			/>

			{/* Name */}
			<input
				value={name}
				onChange={(e) => onChange("name", e.target.value)}
				placeholder={`${label} color name`}
				style={{ ...inputStyle, flex: 1 }}
				onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
				onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
			/>

			{/* Role badge */}
			<Box
				bg="bg.secondary"
				rounded="full"
				style={{ flexShrink: 0, padding: "2px 10px" }}
			>
				<Text color="fg.tertiary" style={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
					{label}
				</Text>
			</Box>

			{onRemove && (
				<button
					type="button"
					onClick={onRemove}
					style={{
						alignItems: "center",
						background: "transparent",
						border: 0,
						borderRadius: 6,
						color: "var(--ax-colors-fg-tertiary)",
						cursor: "pointer",
						display: "flex",
						flexShrink: 0,
						height: 24,
						justifyContent: "center",
						padding: 0,
						width: 24,
					}}
				>
					<IconXmark size={12} />
				</button>
			)}
		</Box>
	);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BrandPackManualPage() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("basics");

	// Basics
	const [packName, setPackName] = useState("");
	const [description, setDescription] = useState("");

	// Colors
	const [colors, setColors] = useState(
		COLOR_ROLES.map((r) => ({ role: r.role, label: r.label, hex: "", name: "" }))
	);

	// Typography
	const [headingFont, setHeadingFont] = useState("");
	const [bodyFont, setBodyFont] = useState("");
	const [monoFont, setMonoFont] = useState("");

	// Tone
	const [selectedTone, setSelectedTone] = useState<Set<string>>(new Set());
	const [customTone, setCustomTone] = useState("");

	// Channels
	const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

	const stepIdx = STEPS.findIndex((s) => s.id === step);
	const isFirst = stepIdx === 0;
	const isLast = stepIdx === STEPS.length - 1;

	function goNext() {
		if (!isLast) setStep(STEPS[stepIdx + 1].id);
		else router.push("/opal/brand-packs/stride-core");
	}

	function goPrev() {
		if (!isFirst) setStep(STEPS[stepIdx - 1].id);
	}

	function updateColor(idx: number, field: "hex" | "name", val: string) {
		setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
	}

	function toggleTone(kw: string) {
		setSelectedTone((prev) => {
			const next = new Set(prev);
			if (next.has(kw)) next.delete(kw);
			else next.add(kw);
			return next;
		});
	}

	function toggleChannel(ch: string) {
		setSelectedChannels((prev) => {
			const next = new Set(prev);
			if (next.has(ch)) next.delete(ch);
			else next.add(ch);
			return next;
		});
	}

	const inputStyle: React.CSSProperties = {
		background: "var(--ax-colors-bg-secondary)",
		border: "1.5px solid var(--ax-colors-border-default)",
		borderRadius: 8,
		color: "var(--ax-colors-fg-default)",
		fontFamily: "inherit",
		fontSize: 14,
		outline: "none",
		padding: "8px 12px",
		transition: "border-color 0.15s ease",
		width: "100%",
	};

	return (
		<Box display="flex" flexDirection="column" h="full" overflow="hidden">
			<Box
				style={{ flexShrink: 0, padding: "32px 32px 16px" }}
			>
				<BrandPackPageHeader
					onBack={() => router.push(BRAND_PACKS_HOME)}
					title="New Brand Pack"
					subtitle="Build manually"
				/>
			</Box>

			{/* Step bar */}
			<Stepper current={step} steps={STEPS} />

			{/* Content */}
			<Box style={{ flex: 1, overflowY: "auto", padding: "32px 24px 80px" }}>
				<Box display="flex" flexDirection="column" gap="16" style={{ margin: "0 auto", maxWidth: 600 }}>

					{/* BASICS */}
					{step === "basics" && (
						<Section title="Brand Pack Basics" description="Give your brand pack a name and a short description.">
							<Box display="flex" flexDirection="column" gap="16">
								<Box display="flex" flexDirection="column" gap="6">
									<Text fontWeight="500" style={{ fontSize: 13 }}>Pack name</Text>
									<input
										value={packName}
										onChange={(e) => setPackName(e.target.value)}
										placeholder="e.g. Acme Core Brand"
										style={inputStyle}
										autoFocus
										onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
										onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
									/>
								</Box>
								<Box display="flex" flexDirection="column" gap="6">
									<Text fontWeight="500" style={{ fontSize: 13 }}>Description <span style={{ color: "var(--ax-colors-fg-tertiary)", fontWeight: 400 }}>(optional)</span></Text>
									<textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Describe the purpose of this brand pack…"
										rows={3}
										style={{ ...inputStyle, resize: "vertical" }}
										onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
										onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
									/>
								</Box>
							</Box>
						</Section>
					)}

					{/* COLORS */}
					{step === "colors" && (
						<Section title="Brand Colors" description="Define your palette. Click a swatch to pick a color.">
							<Box display="flex" flexDirection="column" gap="12">
								{colors.map((c, i) => (
									<ColorRow
										key={c.role}
										role={c.role}
										label={c.label}
										hex={c.hex}
										name={c.name}
										onChange={(field, val) => updateColor(i, field, val)}
									/>
								))}
							</Box>
						</Section>
					)}

					{/* TYPOGRAPHY */}
					{step === "typography" && (
						<Section title="Typography" description="Choose the fonts Opal uses in generated content.">
							<Box display="flex" flexDirection="column" gap="16">
								{[
									{ label: "Heading font", hint: "Used for titles and display copy", value: headingFont, set: setHeadingFont, placeholder: "e.g. Inter, Playfair Display" },
									{ label: "Body font", hint: "Used for paragraphs and body copy", value: bodyFont, set: setBodyFont, placeholder: "e.g. Inter, Georgia" },
									{ label: "Monospace font", hint: "Optional — for code and technical content", value: monoFont, set: setMonoFont, placeholder: "e.g. JetBrains Mono" },
								].map((f) => (
									<Box key={f.label} display="flex" flexDirection="column" gap="6">
										<Box display="flex" flexDirection="column" gap="2">
											<Text fontWeight="500" style={{ fontSize: 13 }}>{f.label}</Text>
											<Text color="fg.tertiary" fontSize="xs">{f.hint}</Text>
										</Box>
										<input
											value={f.value}
											onChange={(e) => f.set(e.target.value)}
											placeholder={f.placeholder}
											style={inputStyle}
											onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
											onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
										/>
									</Box>
								))}
							</Box>
						</Section>
					)}

					{/* TONE */}
					{step === "tone" && (
						<Section title="Tone of Voice" description="Select keywords that guide how Opal writes copy for this brand.">
							<Box display="flex" flexDirection="column" gap="16">
								<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
									{TONE_KEYWORDS.map((kw) => {
										const active = selectedTone.has(kw);
										return (
											<button
												key={kw}
												type="button"
												onClick={() => toggleTone(kw)}
												style={{
													background: active ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-secondary)",
													border: `1.5px solid ${active ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-tertiary)"}`,
													borderRadius: 999,
													color: active ? "var(--ax-colors-fg-default-inverse)" : "var(--ax-colors-fg-default)",
													cursor: "pointer",
													fontSize: 13,
													fontWeight: active ? 600 : 400,
													padding: "6px 14px",
													transition: "all 0.12s ease",
												}}
											>
												{kw}
											</button>
										);
									})}
								</Box>

								<Box display="flex" flexDirection="column" gap="6">
									<Text fontWeight="500" style={{ fontSize: 13 }}>Custom keywords</Text>
									<input
										value={customTone}
										onChange={(e) => setCustomTone(e.target.value)}
										placeholder="Add your own, separated by commas"
										style={inputStyle}
										onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
										onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
									/>
								</Box>

								{selectedTone.size > 0 && (
									<Box display="flex" flexDirection="column" gap="8">
										<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
											Selected ({selectedTone.size})
										</Text>
										<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
											{Array.from(selectedTone).map((kw) => (
												<Box
													key={kw}
													alignItems="center"
													bg="bg.accent.subtle"
													display="inline-flex"
													gap="6"
													rounded="full"
													style={{ padding: "4px 10px 4px 12px" }}
												>
													<Text color="fg.accent" fontWeight="500" style={{ fontSize: 12 }}>{kw}</Text>
													<button
														type="button"
														onClick={() => toggleTone(kw)}
														style={{ alignItems: "center", background: "transparent", border: 0, color: "var(--ax-colors-fg-accent)", cursor: "pointer", display: "flex", padding: 0 }}
													>
														<IconXmark size={10} />
													</button>
												</Box>
											))}
										</Box>
									</Box>
								)}
							</Box>
						</Section>
					)}

					{/* CHANNELS */}
					{step === "channels" && (
						<Section title="Channels" description="Which channels does this brand publish to? Opal generates appropriately-sized templates for each.">
							<Box display="grid" gap="10" style={{ gridTemplateColumns: "1fr 1fr" }}>
								{CHANNEL_OPTIONS.map((ch) => {
									const active = selectedChannels.has(ch);
									return (
										<button
											key={ch}
											type="button"
											onClick={() => toggleChannel(ch)}
											style={{
												alignItems: "center",
												background: active ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-secondary)",
												border: `1.5px solid ${active ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-tertiary)"}`,
												borderRadius: 10,
												cursor: "pointer",
												display: "flex",
												gap: 10,
												padding: "12px 16px",
												textAlign: "left",
												transition: "all 0.12s ease",
											}}
										>
											<Box
												alignItems="center"
												display="flex"
												justifyContent="center"
												rounded="full"
												style={{
													background: active ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-default)",
													border: `1.5px solid ${active ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
													flexShrink: 0,
													height: 20,
													width: 20,
												}}
											>
												{active && <IconCheck size={10} style={{ color: "var(--ax-colors-fg-default-inverse)" }} />}
											</Box>
											<Text fontWeight={active ? "600" : "400"} style={{ fontSize: 14 }}>
												{ch}
											</Text>
										</button>
									);
								})}
							</Box>

							{selectedChannels.size > 0 && (
								<Text color="fg.secondary" fontSize="sm">
									{selectedChannels.size} channel{selectedChannels.size !== 1 ? "s" : ""} selected
								</Text>
							)}
						</Section>
					)}
				</Box>
			</Box>

			{/* Fixed footer nav */}
			<Box
				bg="bg.default"
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{
					borderTop: "1px solid var(--ax-colors-border-tertiary)",
					flexShrink: 0,
					padding: "16px 32px",
				}}
			>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconArrowLeft />}
					onClick={goPrev}
					disabled={isFirst}
				>
					Back
				</Button>

				<Box alignItems="center" display="flex" gap="6">
					{STEPS.map((s, i) => (
						<Box
							key={s.id}
							rounded="full"
							style={{
								background:
									s.id === step
										? "var(--ax-colors-fg-default)"
										: i < stepIdx
										? "var(--ax-colors-fg-accent)"
										: "var(--ax-colors-border-default)",
								height: 6,
								transition: "all 0.2s ease",
								width: s.id === step ? 20 : 6,
							}}
						/>
					))}
				</Box>

				<Button
					appearance="primary"
					size="sm"
					icon={<IconArrowRight />}
					iconPosition="end"
					onClick={goNext}
					disabled={step === "basics" && !packName.trim()}
				>
					{isLast ? "Create Pack" : "Continue"}
				</Button>
			</Box>
		</Box>
	);
}
