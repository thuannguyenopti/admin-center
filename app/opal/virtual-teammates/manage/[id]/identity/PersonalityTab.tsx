"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
	AlertDialog, AlertDialogAction, AlertDialogBody, AlertDialogCancel,
	AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	Badge, Box, Button, Heading, Menu, MenuContent, MenuTrigger, Text, Tooltip,
	type MenuOption,
} from "@optiaxiom/react";
import {
	IconAngleDown, IconArrowUp, IconCircleQuestion, IconEllipsisSolid, IconPen, IconPlus, IconXmark,
} from "@optiaxiom/icons";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

type TemplateData = {
	id: string;
	name: string;
	quote: string;
	icon: string;
	description: string;
	traits: string[];
	tone: string[];
	toneExtra?: number;
	detail: number;
	warmth: number;
	energy: number;
	defaultTraits: string[];
};

const TEMPLATES: TemplateData[] = [
	{
		id: "pragmatist",
		name: "The pragmatist",
		quote: '"Done talks."',
		icon: "/vau-icons/1a.png",
		description: "No fluff. No extra reviews. They cut to what matters, move fast, and deliver — annoyingly right, almost every time.",
		traits: ["DECISIVE", "GROUNDED", "NO-NONSENSE", "RELIABLE"],
		tone: ["DIRECT", "PLAINSPOKEN"],
		toneExtra: 2,
		detail: 0, warmth: 0, energy: 0,
		defaultTraits: ["Decisive", "Grounded", "No-nonsense", "Reliable"],
	},
	{
		id: "tastemaker",
		name: "The tastemaker",
		quote: '"Oh, that\'s hot"',
		icon: "/vau-icons/1b.png",
		description: "First to greenlight the bold idea, first to prove it works. They set the creative bar like it's no big deal.",
		traits: ["OPINIONATED", "DISCERNING", "AHEAD OF THE CURVE"],
		tone: ["CONFIDENT", "CULTURED", "COOL"],
		detail: 50, warmth: 50, energy: 50,
		defaultTraits: ["Opinionated", "Discerning", "Ahead of the curve", "Witty"],
	},
	{
		id: "hype-machine",
		name: "Hype machine",
		quote: '"Yes, yes, and more yes"',
		icon: "/vau-icons/1c.png",
		description: "They don't just get excited — they make the work exciting. Half-baked ideas in; fully-formed plans out.",
		traits: ["ENTHUSIASTIC", "PERSUASIVE", "INFECTIOUS", "ZERO CHILL"],
		tone: ["WARM", "SUPPORTIVE", "WRY"],
		detail: 100, warmth: 100, energy: 100,
		defaultTraits: ["Enthusiastic", "Persuasive", "Infectious", "Funny"],
	},
	{
		id: "stress-tester",
		name: "The stress tester",
		quote: '"Just saying."',
		icon: "/vau-icons/1d.png",
		description: "They ask the question everyone is quietly avoiding. Annoyingly right, but a lot cheaper than finding out later.",
		traits: ["SKEPTICAL", "SHARP", "BLUNT", "CONTRARIAN"],
		tone: ["DEADPAN", "BONE DRY"],
		toneExtra: 1,
		detail: 0, warmth: 0, energy: 50,
		defaultTraits: ["Skeptical", "Sharp", "Blunt", "Contrarian"],
	},
];

const SUGGESTED_TRAITS = ["Casual", "Bratty", "Wry", "Concise", "Candid", "Sassy", "Cheerful", "Funny", "Evil"];
const DEFAULT_VALUES = [
	"Clarity is kindness",
	"No question is too small",
	"Own the outcome, not just the task",
	"Done beats perfect",
	"Momentum is everything",
];
const QUICK_ADD_VALUES = [
	"Done beats perfect",
	"No dropped balls",
	"Momentum first",
	"Honest, not harsh",
	"Bias toward action",
];
const BUILD_CHIPS = ["Type less", "Get things done", "Help me think", "Be direct", "Stay warm"];

function ToneRow({
	label, leftLabel, leftEmoji, rightLabel, rightEmoji, value, onChange,
}: {
	label: string; leftLabel: string; leftEmoji: string;
	rightLabel: string; rightEmoji: string;
	value: number; onChange: (v: number) => void;
}) {
	return (
		<Box style={{ marginBottom: 24 }}>
			<Text fontSize="sm" color="fg.secondary" style={{ fontWeight: 400, display: "block", marginBottom: 8 }}>
				{label}
			</Text>
			<input
				type="range" min={0} max={100} step={50}
				value={value} onChange={(e) => onChange(Number(e.target.value))}
				style={{ width: "100%", display: "block", cursor: "pointer", accentColor: "var(--ax-colors-fg-tertiary)" }}
			/>
			<Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 6 }}>
				<Text fontSize="sm" color="fg.secondary">{leftEmoji} {leftLabel}</Text>
				<Text fontSize="sm" color="fg.secondary" style={{ textAlign: "center" }}>⚖️ Balanced</Text>
				<Text fontSize="sm" color="fg.secondary" style={{ textAlign: "right" }}>{rightEmoji} {rightLabel}</Text>
			</Box>
		</Box>
	);
}

export function PersonalityTab({
	name,
	previewOpen,
	setPreviewOpen,
	onTemplateSelect,
}: {
	name: string;
	cardImage?: string;
	compact?: boolean;
	previewOpen?: boolean;
	setPreviewOpen: (v: boolean) => void;
	onTemplateSelect?: (template: { name: string; icon: string } | null) => void;
}) {
	const [presetCardHeight, setPresetCardHeight] = useState<number | undefined>(undefined);

	useLayoutEffect(() => {
		const el = document.querySelector('[data-preset-card]') as HTMLElement | null;
		if (!el) return;
		setPresetCardHeight(el.offsetHeight);
		const observer = new ResizeObserver(() => setPresetCardHeight(el.offsetHeight));
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
	const [showSwitchDialog, setShowSwitchDialog] = useState(false);
	const [activeTraits, setActiveTraits] = useState<string[]>([]);
	const [detail, setDetail] = useState(50);
	const [warmth, setWarmth] = useState(50);
	const [energy, setEnergy] = useState(50);
	const [energySlider, setEnergySlider] = useState(50);
	const [values, setValues] = useState<string[]>([]);
	const [traitsOpen, setTraitsOpen] = useState(true);
	const [toneOpen, setToneOpen] = useState(true);
	const [valuesOpen, setValuesOpen] = useState(true);
	const [personaName, setPersonaName] = useState("Persona 1");
	const [editingPersonaName, setEditingPersonaName] = useState(false);
	const [builtPersonalities, setBuiltPersonalities] = useState<Array<{ id: string; name: string; traits: string[]; toneLabels: string[]; toneExtra: number; createdAt: string }>>([]);
	const [hoveredCard, setHoveredCard] = useState<string | null>(null);
	const buildSectionRef = useRef<HTMLDivElement>(null);
	const [buildPrompt, setBuildPrompt] = useState("");
	const [generating, setGenerating] = useState(false);
	const [showAddTrait, setShowAddTrait] = useState(false);
	const [newTrait, setNewTrait] = useState("");
	const [showAddValue, setShowAddValue] = useState(false);
	const [newValue, setNewValue] = useState("");

	function applyTemplate(id: string) {
		const t = TEMPLATES.find((t) => t.id === id)!;
		setSelectedTemplate(id);
		setActiveTraits(t.defaultTraits);
		setDetail(t.detail);
		setWarmth(t.warmth);
		setEnergy(t.energy);
		setPreviewOpen(true);
		onTemplateSelect?.({ name: t.name, icon: t.icon });
	}

	function handleTemplateClick(id: string) {
		if (id === "build-your-own") {
			if (selectedTemplate === "build-your-own") {
				setSelectedTemplate(null);
				return;
			}
			setSelectedTemplate("build-your-own");
			setTimeout(() => buildSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
			return;
		}
		if (id === selectedTemplate) return;
		if (selectedTemplate && selectedTemplate !== "build-your-own") {
			setPendingTemplate(id);
			setShowSwitchDialog(true);
		} else {
			applyTemplate(id);
		}
	}

	const isBuildYourOwn = selectedTemplate === "build-your-own";

	function getToneLabels(d: number, w: number, es: number, e: number) {
		const pick = (v: number, pairs: [string, string][]) => {
			const idx = Math.min(Math.floor(v / 25), pairs.length - 1);
			return pairs[idx];
		};
		const all = [
			...pick(d,  [["Concise", "Crisp"], ["Brief", "Focused"], ["Thorough", "Detailed"], ["Elaborate", "Comprehensive"]]),
			...pick(w,  [["Formal", "Reserved"], ["Professional", "Poised"], ["Approachable", "Friendly"], ["Warm", "Personable"]]),
			...pick(es, [["Calm", "Unhurried"], ["Steady", "Grounded"], ["Engaged", "Lively"], ["Playful", "Spirited"]]),
			...pick(e,  [["Mild", "Diplomatic"], ["Tactful", "Measured"], ["Direct", "Candid"], ["Bold", "Frank"]]),
		];
		return { labels: all.slice(0, 3), extra: Math.max(0, all.length - 3) };
	}

	function deletePersonality(id: string) {
		setBuiltPersonalities((prev) => prev.filter((p) => p.id !== id));
		if (selectedTemplate === id) setSelectedTemplate(null);
	}

	function getPersonalityFromPrompt(prompt: string) {
		const p = prompt.toLowerCase();
		if (p.match(/no.nonsense|direct|pragmatic|efficient|practical|plan|operator|noise/)) {
			return { traits: ["Decisive", "Grounded", "No-nonsense", "Reliable"], detail: 0, warmth: 0, energy: 50, energySlider: 50, values: ["Done beats perfect", "No dropped balls", "Bias toward action"] };
		}
		if (p.match(/creative|bold|taste|aesthetic|design|trend|visual|art/)) {
			return { traits: ["Opinionated", "Discerning", "Witty", "Bold"], detail: 50, warmth: 50, energy: 100, energySlider: 100, values: ["Momentum first", "Honest, not harsh"] };
		}
		if (p.match(/warm|support|team|hype|energy|fun|enthusias|cheer|kind/)) {
			return { traits: ["Enthusiastic", "Supportive", "Funny", "Persuasive"], detail: 100, warmth: 100, energy: 100, energySlider: 100, values: ["Momentum first", "No dropped balls", "Honest, not harsh"] };
		}
		if (p.match(/sharp|critical|skeptic|blunt|devil|question|stress|pressure/)) {
			return { traits: ["Skeptical", "Sharp", "Blunt", "Contrarian"], detail: 0, warmth: 0, energy: 50, energySlider: 100, values: ["Done beats perfect", "Honest, not harsh"] };
		}
		return { traits: ["Candid", "Reliable", "Concise", "Grounded"], detail: 50, warmth: 50, energy: 50, energySlider: 50, values: ["Done beats perfect", "Honest, not harsh", "Bias toward action"] };
	}

	function handleOpalGenerate() {
		if (!buildPrompt.trim()) return;
		setGenerating(true);
		setActiveTraits([]);
		setValues([]);
		setTimeout(() => {
			const result = getPersonalityFromPrompt(buildPrompt);
			setActiveTraits(result.traits);
			setDetail(result.detail);
			setWarmth(result.warmth);
			setEnergy(result.energy);
			setEnergySlider(result.energySlider);
			setValues(result.values);
			setTraitsOpen(true);
			setToneOpen(true);
			setValuesOpen(true);
			setGenerating(false);
		}, 1600);
	}

	function handleBuildPersonality() {
		const { labels: toneLabels, extra: toneExtra } = getToneLabels(detail, warmth, energySlider, energy);
		const now = new Date();
		const createdAt = `${now.getMonth() + 1}.${now.getDate()}.${String(now.getFullYear()).slice(2)}`;
		const newPersona = { id: `custom-${Date.now()}`, name: personaName, traits: activeTraits, toneLabels, toneExtra, createdAt };
		setBuiltPersonalities((prev) => [...prev, newPersona]);
		setSelectedTemplate(newPersona.id);
		setActiveTraits([]);
		setValues([]);
		setBuildPrompt("");
		setPersonaName(`Persona ${builtPersonalities.length + 2}`);
	}

	return (
		<>
			<Box style={{ padding: "0 0 40px" }}>
				<Heading level="3" mb="4">Pick a personality</Heading>
				<Text fontSize="md" color="fg.secondary" style={{ display: "block", marginBottom: 20 }}>
					Choose a personality to guide how your teammate interacts with you
				</Text>

				{/* All 5 cards in one grid — Build your own wraps to row 2 as 5th item */}
				<Box style={{ display: "grid", gridTemplateColumns: previewOpen ? "repeat(auto-fill, minmax(166px, 1fr))" : "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
					{TEMPLATES.map((t, i) => {
						const isSelected = t.id === selectedTemplate;
						return (
							<Box
								key={t.id}
								{...(i === 0 ? { "data-preset-card": "" } : {})}
								bg="bg.default"
								onClick={() => handleTemplateClick(t.id)}
								style={{
									border: "1px solid var(--ax-colors-border-default)",
									outline: isSelected ? "2px solid #197A94" : "none",
									outlineOffset: isSelected ? "2px" : "0",
									borderRadius: 8,
									padding: 16,
									cursor: "pointer",
									display: "flex",
									flexDirection: "column",
								}}
							>
								{/* Header: icon + title + quote */}
								<Box style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
									<Box style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
										<img src={t.icon} alt="" style={{ maxHeight: 40, maxWidth: 40, objectFit: "contain" }} />
									</Box>
									<Box>
										<Heading level="4" style={{ margin: 0, marginBottom: 4, lineHeight: "1.2" }}>{t.name}</Heading>
										<Text fontSize="sm" color="fg.tertiary" style={{ fontStyle: "italic", lineHeight: "1.3" }}>
											{t.quote}
										</Text>
									</Box>
								</Box>

								{/* Description: clamped to 3 lines, natural height */}
								<Text fontSize="sm" color="fg.secondary" style={{
									lineHeight: "1.5",
									overflow: "hidden",
									display: "-webkit-box",
									WebkitLineClamp: 3,
									WebkitBoxOrient: "vertical",
									marginBottom: 12,
									flex: "none",
								} as React.CSSProperties}>
									{t.description}
								</Text>

								{/* Divider */}
								<Box style={{ height: 1, background: "var(--ax-colors-border-default)", marginBottom: 12 }} />

								{/* Traits */}
								<Box style={{ marginBottom: 12 }}>
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 6 }}>TRAITS</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
										{t.traits.map((tr) => (
											<Badge key={tr} intent="information">{tr}</Badge>
										))}
									</Box>
								</Box>

								{/* Tone */}
								<Box>
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 6 }}>TONE</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
										{t.tone.map((to) => (
											<Badge key={to}>{to}</Badge>
										))}
										{t.toneExtra ? <Badge variant="subtle">+{t.toneExtra}</Badge> : null}
									</Box>
								</Box>
							</Box>
						);
					})}

					{/* Built custom personality cards — appear before Build your own */}
					{builtPersonalities.map((p) => {
						const isSelected = p.id === selectedTemplate;
						const isHovered = hoveredCard === p.id;
						const menuOptions: MenuOption[] = [
							{ label: "Delete personality", intent: "danger", execute: () => deletePersonality(p.id) },
						];
						return (
							<Box
								key={p.id}
								bg="bg.default"
								shadow={isHovered ? "md" : undefined}
								onClick={() => setSelectedTemplate(p.id)}
								onMouseEnter={() => setHoveredCard(p.id)}
								onMouseLeave={() => setHoveredCard(null)}
								style={{
									border: "1px solid var(--ax-colors-border-default)",
									outline: isSelected ? "2px solid #197A94" : "none",
									outlineOffset: isSelected ? "2px" : "0",
									borderRadius: 8,
									padding: 16,
									cursor: "pointer",
									display: "flex",
									flexDirection: "column",
									minHeight: presetCardHeight,
									position: "relative",
								}}
							>
								{/* Three-dot menu — visible on hover */}
								{isHovered && (
									<Box
										style={{ position: "absolute", top: 8, right: 8 }}
										onClick={(e) => e.stopPropagation()}
									>
										<Menu options={menuOptions}>
											<MenuTrigger asChild>
												<Button appearance="subtle" size="sm" icon={<IconEllipsisSolid size={13} />} />
											</MenuTrigger>
											<MenuContent align="end" />
										</Menu>
									</Box>
								)}

								{/* Header: icon + name + date */}
								<Box style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
									<Box style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
										<img src="/vau-icons/1a.png" alt="" style={{ maxHeight: 40, maxWidth: 40, objectFit: "contain" }} />
									</Box>
									<Box>
										<Heading level="4" style={{ margin: 0, marginBottom: 4, lineHeight: "1.2" }}>{p.name}</Heading>
										<Text fontSize="sm" color="fg.tertiary">Created {p.createdAt}</Text>
									</Box>
								</Box>

								{/* Divider */}
								<Box style={{ height: 1, background: "var(--ax-colors-border-default)", marginBottom: 12 }} />

								{/* Traits */}
								<Box style={{ marginBottom: 12 }}>
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 6 }}>TRAITS</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
										{p.traits.map((tr) => <Badge key={tr} intent="information">{tr}</Badge>)}
									</Box>
								</Box>

								{/* Tone */}
								<Box>
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 6 }}>TONE</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
										{p.toneLabels.map((t) => <Badge key={t}>{t}</Badge>)}
										{p.toneExtra > 0 && <Badge variant="subtle">+{p.toneExtra}</Badge>}
									</Box>
								</Box>
							</Box>
						);
					})}

					{/* Build your own — 5th card, same size, wraps to row 2 */}
					<Box
						bg="bg.default"
						onClick={() => handleTemplateClick("build-your-own")}
						style={{
							border: isBuildYourOwn
								? "1px solid #197A94"
								: "1.5px dashed var(--ax-colors-border-default)",
							outline: isBuildYourOwn ? "2px solid #197A94" : "none",
							outlineOffset: isBuildYourOwn ? "2px" : "0",
							borderRadius: 8,
							padding: 16,
							cursor: "pointer",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 8,
							minHeight: presetCardHeight,
						}}
					>
						<Text style={{ fontWeight: 600, fontSize: 15, color: "var(--ax-colors-fg-default)", display: "block", textAlign: "center" }}>
							Build your own
						</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5", textAlign: "center" }}>
							Choose your vibe, shape its personality, and watch it come to life
						</Text>
					</Box>
				</Box>

				{/* Divider between card grid and build-your-own sections */}
				{isBuildYourOwn && (
					<Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "0 0 32px" }} />
				)}

				{/* Build your own progressive disclosure */}
				{isBuildYourOwn && (
					<Box ref={buildSectionRef} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

						{/* Section header */}
						<Box style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
							<Box>
								<Text style={{ fontSize: 16, fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 2 }}>
									Build your own
								</Text>
								<Text fontSize="sm" color="fg.secondary">
									Because sometimes you know exactly what you want.
								</Text>
							</Box>
							<Box style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
								{editingPersonaName ? (
									<input
										autoFocus
										value={personaName}
										onChange={(e) => setPersonaName(e.target.value)}
										onBlur={() => setEditingPersonaName(false)}
										onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingPersonaName(false); }}
										style={{ border: "none", borderBottom: "1px solid var(--ax-colors-border-default)", outline: "none", fontSize: 14, fontWeight: 500, color: "var(--ax-colors-fg-default)", background: "transparent", fontFamily: "inherit", width: 90, padding: "2px 0" }}
									/>
								) : (
									<button
										onClick={() => setEditingPersonaName(true)}
										style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 5 }}
									>
										<Text style={{ fontSize: 14, fontWeight: 500, color: "var(--ax-colors-fg-default)", textDecoration: "underline" }}>{personaName}</Text>
										<IconPen size={13} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
									</button>
								)}
								<Button appearance="primary" size="md" onClick={handleBuildPersonality}>Save personality</Button>
							</Box>
						</Box>

						{/* Card 1: Create with Opal */}
						<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
							<Box style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
								<img src="/opal-orb.png" alt="" width={16} height={16} style={{ display: "inline-block", verticalAlign: "middle" }} />
								<Text style={{ fontSize: 15, fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Create with Opal</Text>
								<Tooltip delayDuration={300} content="Describe how your teammate should sound and Opal will configure their personality.">
									<span style={{ display: "inline-flex" }}>
										<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
									</span>
								</Tooltip>
							</Box>
							<Text fontSize="sm" color="fg.secondary" style={{ display: "block", marginBottom: 16 }}>
								Create your dream teammate with a prompt
							</Text>
							<Box style={{
								display: "flex", alignItems: "center",
								border: "1px solid var(--ax-colors-border-default)",
								borderRadius: 8, overflow: "hidden",
								background: "var(--ax-colors-bg-input)", padding: "0 8px 0 0",
							}}>
								<input
									value={buildPrompt}
									onChange={(e) => setBuildPrompt(e.target.value)}
									placeholder="e.g. A no-nonsense operator who cuts through noise and always has a plan B."
									onKeyDown={(e) => { if (e.key === "Enter") handleOpalGenerate(); }}
									style={{
										flex: 1, height: 44, padding: "0 14px",
										border: "none", background: "transparent",
										fontSize: 14, color: "var(--ax-colors-fg-default)",
										fontFamily: "inherit", outline: "none",
									}}
								/>
								<Button size="sm" appearance="primary" icon={<IconArrowUp size={14} />} disabled={!buildPrompt.trim() || generating} onClick={handleOpalGenerate} />
							</Box>
						</Box>

						{/* Card 2: Personality traits */}
						<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
							<Box
								onClick={() => setTraitsOpen((p) => !p)}
								style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: traitsOpen ? 16 : 0 }}
							>
								<Box style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
									<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Personality traits</Text>
									<Tooltip delayDuration={300} content="Keywords that shape how your teammate thinks and communicates.">
										<span style={{ display: "inline-flex" }} onClick={(e) => e.stopPropagation()}>
											<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
										</span>
									</Tooltip>
								</Box>
								<IconAngleDown size={16} style={{ color: "var(--ax-colors-fg-tertiary)", transform: traitsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
							</Box>
							{traitsOpen && (
								<>
									{generating ? (
										<Box style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 16px" }}>
											<img src="/opal-orb.png" alt="" width={14} height={14} className="appear" style={{ opacity: 0.7 }} />
											<Text fontSize="sm" color="fg.tertiary">Opal is generating traits...</Text>
										</Box>
									) : activeTraits.length === 0 ? (
										<Text fontSize="sm" color="fg.tertiary" style={{ display: "block", textAlign: "center", padding: "12px 0 16px" }}>
											No traits yet — add some to give {name} a personality
										</Text>
									) : (
										<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
											{activeTraits.map((trait) => (
												<button
													key={trait}
													onClick={() => setActiveTraits((p) => p.filter((t) => t !== trait))}
													style={{
														display: "inline-flex", alignItems: "center", gap: 6,
														padding: "5px 10px", borderRadius: 99,
														background: "var(--ax-colors-bg-secondary)",
														border: "1px solid var(--ax-colors-border-default)",
														cursor: "pointer", fontSize: 13,
														color: "var(--ax-colors-fg-default)", fontFamily: "inherit",
													}}
												>
													{trait}
													<IconXmark size={11} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
												</button>
											))}
										</Box>
									)}
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 8 }}>SUGGESTED</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
										{SUGGESTED_TRAITS.filter((t) => !activeTraits.includes(t)).map((trait) => (
											<button
												key={trait}
												onClick={() => setActiveTraits((p) => [...p, trait])}
												style={{
													display: "inline-flex", alignItems: "center", gap: 4,
													padding: "5px 10px", borderRadius: 99,
													background: "transparent",
													border: "1px solid var(--ax-colors-border-default)",
													cursor: "pointer", fontSize: 13,
													color: "var(--ax-colors-fg-secondary)", fontFamily: "inherit",
												}}
											>
												+ {trait}
											</button>
										))}
										{showAddTrait ? (
											<input
												autoFocus
												value={newTrait}
												onChange={(e) => setNewTrait(e.target.value)}
												placeholder="Type a trait..."
												onBlur={() => { setNewTrait(""); setShowAddTrait(false); }}
												onKeyDown={(e) => {
													if (e.key === "Enter" && newTrait.trim()) {
														setActiveTraits((p) => [...p, newTrait.trim()]);
														setNewTrait(""); setShowAddTrait(false);
													}
													if (e.key === "Escape") { setNewTrait(""); setShowAddTrait(false); }
												}}
												style={{
													height: 29, padding: "0 10px",
													border: "1px solid var(--ax-colors-border-default)",
													borderRadius: 99, background: "var(--ax-colors-bg-input)",
													fontSize: 13, color: "var(--ax-colors-fg-default)",
													fontFamily: "inherit", outline: "none", width: 120,
												}}
											/>
										) : (
											<button
												onClick={() => setShowAddTrait(true)}
												style={{
													display: "inline-flex", alignItems: "center", gap: 4,
													padding: "5px 10px", borderRadius: 99,
													background: "transparent",
													border: "1.5px dashed var(--ax-colors-border-default)",
													cursor: "pointer", fontSize: 13,
													color: "var(--ax-colors-fg-tertiary)", fontFamily: "inherit",
												}}
											>
												+ Add trait
											</button>
										)}
									</Box>
								</>
							)}
						</Box>

						{/* Card 3: Tone of voice */}
						<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
							<Box
								onClick={() => setToneOpen((p) => !p)}
								style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: toneOpen ? 20 : 0 }}
							>
								<Box style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
									<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Tone of voice</Text>
									<Tooltip delayDuration={300} content="Adjusts how formal, warm, and energetic your teammate sounds.">
										<span style={{ display: "inline-flex" }} onClick={(e) => e.stopPropagation()}>
											<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
										</span>
									</Tooltip>
								</Box>
								<IconAngleDown size={16} style={{ color: "var(--ax-colors-fg-tertiary)", transform: toneOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
							</Box>
							{toneOpen && (
								<>
									{generating ? (
										<Box style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 16px" }}>
											<img src="/opal-orb.png" alt="" width={14} height={14} style={{ opacity: 0.7 }} />
											<Text fontSize="sm" color="fg.tertiary">Opal is tuning tone...</Text>
										</Box>
									) : (
									<>
									<ToneRow label="Detail" leftLabel="Brief" leftEmoji="🐣" rightLabel="Detailed" rightEmoji="🪄" value={detail} onChange={setDetail} />
									<ToneRow label="Warmth" leftLabel="Formal" leftEmoji="🏛" rightLabel="Warm" rightEmoji="☀️" value={warmth} onChange={setWarmth} />
									<ToneRow label="Energy" leftLabel="Calm" leftEmoji="🧊" rightLabel="Playful" rightEmoji="🎯" value={energySlider} onChange={setEnergySlider} />
									<ToneRow label="Spiciness" leftLabel="Mild" leftEmoji="🍊" rightLabel="Extra hot" rightEmoji="🔥" value={energy} onChange={setEnergy} />
									</>
								)}
							</>
						)}
					</Box>

						{/* Card 4: Values */}
						<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
							<Box
								onClick={() => setValuesOpen((p) => !p)}
								style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: valuesOpen ? 16 : 0 }}
							>
								<Box style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
									<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Values</Text>
									<Tooltip delayDuration={300} content="Principles that guide your teammate's priorities and tradeoffs.">
										<span style={{ display: "inline-flex" }} onClick={(e) => e.stopPropagation()}>
											<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
										</span>
									</Tooltip>
								</Box>
								<IconAngleDown size={16} style={{ color: "var(--ax-colors-fg-tertiary)", transform: valuesOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
							</Box>
							{valuesOpen && (
								<>
									{generating ? (
										<Box style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 16px" }}>
											<img src="/opal-orb.png" alt="" width={14} height={14} style={{ opacity: 0.7 }} />
											<Text fontSize="sm" color="fg.tertiary">Opal is selecting values...</Text>
										</Box>
									) : values.length === 0 ? (
										<Text fontSize="sm" color="fg.tertiary" style={{ display: "block", textAlign: "center", padding: "12px 0 16px" }}>
											No values yet — add some to guide how {name} makes decisions
										</Text>
									) : (
										<Box style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
											{values.map((v) => (
												<Box key={v} style={{
													display: "flex", alignItems: "center", justifyContent: "space-between",
													padding: "10px 14px", background: "var(--ax-colors-bg-secondary)", borderRadius: 8,
												}}>
													<Text fontSize="md" color="fg.default">{v}</Text>
													<button
														onClick={() => setValues((p) => p.filter((x) => x !== v))}
														style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ax-colors-fg-tertiary)", display: "flex", alignItems: "center" }}
													>
														<IconXmark size={14} />
													</button>
												</Box>
											))}
										</Box>
									)}
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 8 }}>QUICK ADD</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
										{QUICK_ADD_VALUES.filter((v) => !values.includes(v)).map((v) => (
											<button
												key={v}
												onClick={() => setValues((p) => [...p, v])}
												style={{
													display: "inline-flex", alignItems: "center", gap: 4,
													padding: "5px 10px", borderRadius: 99,
													background: "transparent",
													border: "1px solid var(--ax-colors-border-default)",
													cursor: "pointer", fontSize: 13,
													color: "var(--ax-colors-fg-secondary)", fontFamily: "inherit",
												}}
											>
												+ {v}
											</button>
										))}
									</Box>
									{showAddValue ? (
										<Box style={{
											display: "flex", alignItems: "center",
											border: "1px solid var(--ax-colors-border-default)",
											borderRadius: 8, padding: "0 14px", background: "var(--ax-colors-bg-input)",
										}}>
											<IconPlus size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginRight: 8 }} />
											<input
												autoFocus
												value={newValue}
												onChange={(e) => setNewValue(e.target.value)}
												placeholder="Add a value..."
												onBlur={() => { setNewValue(""); setShowAddValue(false); }}
												onKeyDown={(e) => {
													if (e.key === "Enter" && newValue.trim()) {
														setValues((p) => [...p, newValue.trim()]);
														setNewValue(""); setShowAddValue(false);
													}
													if (e.key === "Escape") { setNewValue(""); setShowAddValue(false); }
												}}
												style={{
													flex: 1, height: 40, border: "none", background: "transparent",
													fontSize: 14, color: "var(--ax-colors-fg-default)",
													fontFamily: "inherit", outline: "none",
												}}
											/>
										</Box>
									) : (
										<button
											onClick={() => setShowAddValue(true)}
											style={{
												display: "flex", alignItems: "center", gap: 8, width: "100%",
												padding: "10px 14px", borderRadius: 8,
												border: "1.5px dashed var(--ax-colors-border-default)",
												background: "transparent", cursor: "pointer", fontFamily: "inherit",
											}}
										>
											<IconPlus size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
											<Text fontSize="sm" color="fg.tertiary">Add a value...</Text>
										</button>
									)}
								</>
							)}
						</Box>

					</Box>
				)}
			</Box>

			{/* Switch template dialog */}
			<AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
				<AlertDialogContent style={{ width: 480, borderRadius: 20 }}>
					<AlertDialogHeader>Switch personality template?</AlertDialogHeader>
					<AlertDialogBody>
						<Text fontSize="md" color="fg.default" style={{ lineHeight: "1.6" }}>
							Switching to a new personality template will replace {name}&apos;s current traits and tone.
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel appearance="subtle" size="md" onClick={() => { setPendingTemplate(null); setShowSwitchDialog(false); }}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							appearance="primary"
							size="md"
							onClick={() => {
								if (pendingTemplate) applyTemplate(pendingTemplate);
								setPendingTemplate(null);
								setShowSwitchDialog(false);
							}}
						>
							Switch template
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
