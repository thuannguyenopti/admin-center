"use client";

import { useEffect, useRef, useState } from "react";
import {
	AlertDialog, AlertDialogAction, AlertDialogBody, AlertDialogCancel,
	AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	Badge, Box, Button, Popover, PopoverContent, PopoverTrigger, Text, Tooltip,
} from "@optiaxiom/react";
import {
	IconArrowUp, IconBolt, IconCircleQuestion, IconGear, IconPlus, IconRocket, IconStar, IconUpload, IconXmark,
} from "@optiaxiom/icons";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 9,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.08em",
	textTransform: "uppercase" as const,
};

type TemplateData = {
	id: string;
	name: string;
	quote: string;
	icon: React.ElementType;
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
		icon: IconGear,
		description:
			"Done, done, and done. They cut through noise, skip the chit-chat, and get the job done. Always right, all the time.",
		traits: ["DECISIVE", "GROUNDED", "NO-NONSENSE", "RELIABLE"],
		tone: ["DIRECT", "PLAINSPOKEN", "WRY"],
		toneExtra: 2,
		detail: 20, warmth: 25, energy: 30,
		defaultTraits: ["Decisive", "Grounded", "No-nonsense", "Reliable"],
	},
	{
		id: "tastemaker",
		name: "The tastemaker",
		quote: '"I liked it before."',
		icon: IconStar,
		description:
			"The first to bring a crazy idea to life. They are nonchalant, set the standard, and somehow always know what's next.",
		traits: ["OPINIONATED", "DISCERNING", "AHEAD OF THE CURVE"],
		tone: ["CONFIDENT", "CULTURED", "COOL"],
		detail: 50, warmth: 45, energy: 55,
		defaultTraits: ["Opinionated", "Discerning", "Ahead of the curve", "Witty"],
	},
	{
		id: "hype-machine",
		name: "The hype machine",
		quote: '"Wait, hear me out."',
		icon: IconRocket,
		description:
			'Enthusiasm is contagious and they\'re patient zero. They turn "meh" ideas into "wait, actually…" moments.',
		traits: ["ENTHUSIASTIC", "PERSUASIVE", "FUNNY", "ZERO CHILL"],
		tone: ["WARM", "SUPPORTIVE", "ENERGETIC"],
		detail: 75, warmth: 80, energy: 90,
		defaultTraits: ["Enthusiastic", "Persuasive", "Funny", "Infectious"],
	},
	{
		id: "spicy-realist",
		name: "The spicy realist",
		quote: '"Just saying."',
		icon: IconBolt,
		description:
			"Skeptical? Always. Wrong? Rarely. They poke holes in bad ideas before they become expensive ones.",
		traits: ["SKEPTICAL", "SHARP", "BLUNT", "CONTRARIAN"],
		tone: ["DEADPAN", "BONE DRY", "WITTY"],
		toneExtra: 1,
		detail: 30, warmth: 15, energy: 35,
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

// ── 3-option tone picker ──────────────────────────────────────────────────

function ToneOption({
	selected,
	onClick,
	emoji,
	label,
	isCenter,
}: {
	selected: boolean;
	onClick: () => void;
	emoji?: string;
	label: string;
	isCenter?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className="tone-option"
			data-selected={selected || undefined}
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 6,
				padding: "10px 6px",
				borderRadius: 8,
				border: selected ? "1.5px solid #197A94" : "1px solid var(--ax-colors-border-default)",
				background: selected ? "#EFF5EB" : "transparent",
				cursor: "pointer",
				fontFamily: "inherit",
			}}
		>
			<span style={{ fontSize: 16, lineHeight: 1 }}>
				{isCenter ? "⚖️" : emoji}
			</span>
			<span style={{
				...CAPTION,
				fontSize: 8,
				color: selected ? "#616755" : "var(--ax-colors-fg-tertiary)",
				lineHeight: 1.2,
				textAlign: "center",
			}}>
				{label}
			</span>
		</button>
	);
}

function ToneRow({
	label,
	leftLabel, leftEmoji,
	rightLabel, rightEmoji,
	value, onChange,
}: {
	label: string;
	leftLabel: string; leftEmoji: string;
	rightLabel: string; rightEmoji: string;
	value: number; onChange: (v: number) => void;
}) {
	const selected = value <= 33 ? 0 : value >= 67 ? 100 : 50;
	return (
		<Box style={{ marginBottom: 16 }}>
			<Text fontSize="sm" color="fg.secondary" style={{ fontWeight: 500, display: "block", marginBottom: 8 }}>
				{label}
			</Text>
			<Box style={{ display: "flex", gap: 8 }}>
				<ToneOption selected={selected === 0} onClick={() => onChange(0)} emoji={leftEmoji} label={leftLabel} />
				<ToneOption selected={selected === 50} onClick={() => onChange(50)} isCenter label="Balanced" />
				<ToneOption selected={selected === 100} onClick={() => onChange(100)} emoji={rightEmoji} label={rightLabel} />
			</Box>
		</Box>
	);
}

// ── Upload popover ────────────────────────────────────────────────────────

function UploadPopover() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);

	function handleFile(file: File) {
		setFileName(file.name);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button appearance="primary" size="sm" icon={<IconUpload size={14} />}>Upload a file</Button>
			</PopoverTrigger>
			<PopoverContent style={{ width: 320, padding: 0, borderRadius: 12, overflow: "hidden" }}>
				<Box style={{ padding: "16px 16px 8px" }}>
					<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 2 }}>Upload a file</Text>
					<Text fontSize="sm" color="fg.secondary">Supports .txt, .pdf, .docx, or .md</Text>
				</Box>
				<Box
					onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
					onDragLeave={() => setDragging(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragging(false);
						const file = e.dataTransfer.files[0];
						if (file) handleFile(file);
					}}
					style={{
						margin: "8px 16px 16px",
						border: `1.5px dashed ${dragging ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
						borderRadius: 8,
						padding: "24px 16px",
						display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
						background: dragging ? "var(--ax-colors-bg-success-subtle)" : "var(--ax-colors-bg-secondary)",
						transition: "border-color 0.15s, background 0.15s",
						cursor: "pointer",
					}}
					onClick={() => fileInputRef.current?.click()}
				>
					<IconUpload size={20} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
					{fileName ? (
						<Text fontSize="sm" color="fg.default" style={{ textAlign: "center", fontWeight: 500 }}>{fileName}</Text>
					) : (
						<>
							<Text fontSize="sm" color="fg.secondary" style={{ textAlign: "center" }}>
								Drag and drop a file here, or{" "}
								<span style={{ color: "var(--ax-colors-fg-accent)", fontWeight: 500, cursor: "pointer" }}>browse</span>
							</Text>
						</>
					)}
					<input
						ref={fileInputRef}
						type="file"
						accept=".txt,.pdf,.docx,.md"
						style={{ display: "none" }}
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handleFile(file);
						}}
					/>
				</Box>
				{fileName && (
					<Box style={{ padding: "0 16px 16px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
						<Button size="sm" appearance="subtle" onClick={() => setFileName(null)}>Clear</Button>
						<Button size="sm" appearance="primary">Import</Button>
					</Box>
				)}
			</PopoverContent>
		</Popover>
	);
}

// ── Main component ────────────────────────────────────────────────────────

export function PersonalityTab({
	name,
	compact,
	setPreviewOpen,
}: {
	name: string;
	avatar?: string;
	avatarBg?: string;
	compact?: boolean;
	setPreviewOpen: (v: boolean) => void;
}) {
	const [selectedTemplate, setSelectedTemplate] = useState("pragmatist");
	const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
	const [showSwitchDialog, setShowSwitchDialog] = useState(false);
	const [toastVisible, setToastVisible] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [activeTraits, setActiveTraits] = useState<string[]>(TEMPLATES[0].defaultTraits);
	const [detail, setDetail] = useState(TEMPLATES[0].detail);
	const [warmth, setWarmth] = useState(TEMPLATES[0].warmth);
	const [energy, setEnergy] = useState(TEMPLATES[0].energy);
	const [values, setValues] = useState<string[]>(DEFAULT_VALUES);
	const [importText, setImportText] = useState("");
	const [showAddTrait, setShowAddTrait] = useState(false);
	const [newTrait, setNewTrait] = useState("");
	const [showAddValue, setShowAddValue] = useState(false);
	const [newValue, setNewValue] = useState("");

	useEffect(() => {
		if (!toastVisible) return;
		const t = setTimeout(() => setToastVisible(false), 4000);
		return () => clearTimeout(t);
	}, [toastVisible]);

	function applyTemplate(id: string) {
		const t = TEMPLATES.find((t) => t.id === id)!;
		setSelectedTemplate(id);
		setActiveTraits(t.defaultTraits);
		setDetail(t.detail);
		setWarmth(t.warmth);
		setEnergy(t.energy);
		setToastMessage(`${name}'s personality has been updated to '${t.name.toLowerCase()}'`);
		setToastVisible(true);
		setPreviewOpen(true);
	}

	function handleTemplateClick(id: string) {
		if (id === selectedTemplate) return;
		if (selectedTemplate) {
			setPendingTemplate(id);
			setShowSwitchDialog(true);
		} else {
			applyTemplate(id);
		}
	}

	return (
		<>
			<Box style={{ padding: "24px 40px 40px" }}>
				{/* ── Start with a template ── */}
				<Text style={{ fontSize: 18, fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 4 }}>
					Start with a template
				</Text>
				<Text fontSize="sm" color="fg.secondary" style={{ display: "block", marginBottom: 20 }}>
					Choose a personality archetype to guide how your teammate interacts with you
				</Text>
				<Box style={{ display: "grid", gridTemplateColumns: compact ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
					{TEMPLATES.map((t) => {
						const Icon = t.icon;
						const isSelected = t.id === selectedTemplate;
						return (
							<Box
								key={t.id}
								bg="bg.default"
								className={`archetype-card${isSelected ? " archetype-card--selected" : ""}`}
								onClick={() => handleTemplateClick(t.id)}
								style={{
									border: "1px solid var(--ax-colors-border-default)",
									outline: isSelected ? "2px solid #197A94" : "none",
									outlineOffset: isSelected ? "2px" : "0",
									borderRadius: 8,
									padding: "16px",
									cursor: "pointer",
									display: "flex",
									flexDirection: "column",
									gap: 12,
								}}
							>
								<Box style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
									<Box
										style={{
											width: 40, height: 40, borderRadius: 8, flexShrink: 0,
											background: "#EEFFD9",
											display: "flex", alignItems: "center", justifyContent: "center",
										}}
									>
										<Icon size={18} style={{ color: "var(--ax-colors-fg-default)" }} />
									</Box>
									<Box>
										<Text asChild fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)", lineHeight: "1.2", display: "block", margin: 0, marginBottom: 4 }}>
											<h4>{t.name}</h4>
										</Text>
										<Text fontSize="sm" color="fg.tertiary" style={{ fontStyle: "italic", lineHeight: "1.3" }}>
											{t.quote}
										</Text>
									</Box>
								</Box>
								<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5" }}>
									{t.description}
								</Text>
								<Box style={{ height: 1, background: "var(--ax-colors-border-default)" }} />
								<Box>
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 6 }}>TRAITS</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
										{t.traits.map((tr) => (
											<Badge key={tr} intent="information">{tr}</Badge>
										))}
									</Box>
								</Box>
								<Box>
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 6 }}>TONE</span>
									<Box style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
										{t.tone.map((to) => (
											<Badge key={to}>{to}</Badge>
										))}
										{t.toneExtra ? (
											<Text fontSize="sm" color="fg.tertiary">+{t.toneExtra}</Text>
										) : null}
									</Box>
								</Box>
							</Box>
						);
					})}
				</Box>

				<Box style={{ height: 1, background: "var(--ax-colors-border-default)", marginBottom: 32 }} />

				{/* ── Configure manually ── */}
				<Text style={{ fontSize: 18, fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 4 }}>
					Configure manually
				</Text>
				<Text fontSize="sm" color="fg.secondary" style={{ display: "block", marginBottom: 20 }}>
					Edit or add personality traits to meet your exact needs
				</Text>

				{/* Personality traits */}
				<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px", marginBottom: 12 }}>
					<Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
						<Box>
							<Box style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
								<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Personality traits</Text>
								<Tooltip delayDuration={300} content="Traits shape how Randy approaches problems and communicates — e.g. 'Decisive' means confident answers without hedging, 'Concise' means no fluff.">
									<span style={{ display: "inline-flex" }}>
										<IconCircleQuestion size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
									</span>
								</Tooltip>
							</Box>
							<Text fontSize="sm" color="fg.secondary">Shape how {name} thinks and communicates</Text>
						</Box>
						<Button appearance="primary" size="sm" onClick={() => setShowAddTrait(true)}>Add your own</Button>
					</Box>
					<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
						{activeTraits.map((trait) => (
							<button
								key={trait}
								className="trait-pill-active"
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
					<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 8 }}>SUGGESTED</span>
					<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: showAddTrait ? 12 : 0 }}>
						{SUGGESTED_TRAITS.filter((t) => !activeTraits.includes(t)).map((trait) => (
							<button
								key={trait}
								className="trait-pill-suggest"
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
					</Box>
					{showAddTrait && (
						<Box style={{ display: "flex", gap: 8, marginTop: 12 }}>
							<input
								autoFocus
								value={newTrait}
								onChange={(e) => setNewTrait(e.target.value)}
								placeholder="Enter a trait..."
								onKeyDown={(e) => {
									if (e.key === "Enter" && newTrait.trim()) {
										setActiveTraits((p) => [...p, newTrait.trim()]);
										setNewTrait("");
										setShowAddTrait(false);
									}
									if (e.key === "Escape") { setNewTrait(""); setShowAddTrait(false); }
								}}
								style={{
									flex: 1, height: 36, padding: "0 12px",
									border: "1px solid var(--ax-colors-border-default)",
									borderRadius: 6, background: "var(--ax-colors-bg-input)",
									fontSize: 14, color: "var(--ax-colors-fg-default)",
									fontFamily: "inherit", outline: "none",
								}}
							/>
							<Button size="md" style={{ height: 36 }} onClick={() => {
								if (newTrait.trim()) setActiveTraits((p) => [...p, newTrait.trim()]);
								setNewTrait(""); setShowAddTrait(false);
							}}>Save</Button>
							<Button size="md" style={{ height: 36 }} appearance="subtle" onClick={() => { setNewTrait(""); setShowAddTrait(false); }}>Cancel</Button>
						</Box>
					)}
				</Box>

				{/* Tone of voice */}
				<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px", marginBottom: 12 }}>
					<Box style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
						<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Tone of voice</Text>
						<Tooltip delayDuration={300} content="These sliders control how Randy sounds in responses — how much detail to include, how warm or formal the language is, and how energetic vs. calm the delivery feels.">
							<span style={{ display: "inline-flex" }}>
								<IconCircleQuestion size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
							</span>
						</Tooltip>
					</Box>
					<Text fontSize="sm" color="fg.secondary" style={{ display: "block", marginBottom: 20 }}>Fine-tune {name}&apos;s communication style</Text>
					<ToneRow label="Detail" leftLabel="Brief" leftEmoji="🐣" rightLabel="Detailed" rightEmoji="🪄" value={detail} onChange={setDetail} />
					<ToneRow label="Warmth" leftLabel="Formal" leftEmoji="🏛" rightLabel="Warm" rightEmoji="☀️" value={warmth} onChange={setWarmth} />
					<ToneRow label="Energy" leftLabel="Calm" leftEmoji="🌱" rightLabel="Playful" rightEmoji="🎯" value={energy} onChange={setEnergy} />
				</Box>

				{/* Values */}
				<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px", marginBottom: 12 }}>
					<Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
						<Box>
							<Box style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
								<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Values</Text>
								<Tooltip delayDuration={300} content="Values are the principles Randy weighs when making tradeoffs — they guide judgment on ambiguous tasks and keep priorities consistent with what matters to your team.">
									<span style={{ display: "inline-flex" }}>
										<IconCircleQuestion size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
									</span>
								</Tooltip>
							</Box>
							<Text fontSize="sm" color="fg.secondary">Principles that guide {name}&apos;s tradeoffs</Text>
						</Box>
						<Button appearance="primary" size="sm" onClick={() => setShowAddValue(true)}>Add your own</Button>
					</Box>
					<Box style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
						{values.map((v) => (
							<Box key={v} style={{
								display: "flex", alignItems: "center", justifyContent: "space-between",
								padding: "10px 14px",
								background: "#EFF5EB",
								borderRadius: 8,
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
					{showAddValue && (
						<Box style={{ display: "flex", gap: 8, marginBottom: 12 }}>
							<input
								autoFocus
								value={newValue}
								onChange={(e) => setNewValue(e.target.value)}
								placeholder="Add a value or principle..."
								onKeyDown={(e) => {
									if (e.key === "Enter" && newValue.trim()) {
										setValues((p) => [...p, newValue.trim()]);
										setNewValue(""); setShowAddValue(false);
									}
									if (e.key === "Escape") { setNewValue(""); setShowAddValue(false); }
								}}
								style={{
									flex: 1, height: 36, padding: "0 12px",
									border: "1px solid var(--ax-colors-border-default)",
									borderRadius: 6, background: "var(--ax-colors-bg-input)",
									fontSize: 14, color: "var(--ax-colors-fg-default)",
									fontFamily: "inherit", outline: "none",
								}}
							/>
							<Button size="md" style={{ height: 36 }} appearance="default" onClick={() => {
								if (newValue.trim()) setValues((p) => [...p, newValue.trim()]);
								setNewValue(""); setShowAddValue(false);
							}}>Save</Button>
							<Button size="md" style={{ height: 36 }} appearance="subtle" onClick={() => { setNewValue(""); setShowAddValue(false); }}>Cancel</Button>
						</Box>
					)}
					<Box style={{ marginTop: 4 }}>
						<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 8 }}>QUICK ADD</span>
						<Box style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
							{QUICK_ADD_VALUES.filter((v) => !values.includes(v)).map((v) => (
								<button
									key={v}
									className="trait-pill-suggest"
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
					</Box>
				</Box>

				{/* Import a personality */}
				<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px", marginBottom: 40 }}>
					<Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
						<Box>
							<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 2 }}>Import a personality</Text>
							<Text fontSize="sm" color="fg.secondary">Paste a description or upload a file — we&apos;ll extract the traits and tone automatically</Text>
						</Box>
						<UploadPopover />
					</Box>
					<Box style={{
						display: "flex", alignItems: "center",
						border: "1px solid var(--ax-colors-border-default)",
						borderRadius: 8, overflow: "hidden",
						background: "var(--ax-colors-bg-input)",
						padding: "0 8px 0 0",
					}}>
						<input
							value={importText}
							onChange={(e) => setImportText(e.target.value)}
							placeholder="Paste a prompt, persona description, or any notes on how your teammate should sound…"
							style={{
								flex: 1, height: 44,
								padding: "0 14px",
								border: "none", background: "transparent",
								fontSize: 14, color: "var(--ax-colors-fg-default)",
								fontFamily: "inherit", outline: "none",
							}}
						/>
						<Button
							size="sm"
							appearance="primary"
							icon={<IconArrowUp size={14} />}
							disabled={!importText.trim()}
						/>
					</Box>
				</Box>
			</Box>

			{/* ── Switch template dialog ── */}
			<AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
				<AlertDialogContent style={{ width: 480, borderRadius: 20 }}>
					<AlertDialogHeader>Switch personality template?</AlertDialogHeader>
					<AlertDialogBody>
						<Text fontSize="md" color="fg.default" style={{ lineHeight: "1.6" }}>
							Switching to a new personality template will replace {name}&apos;s current traits and tone. Your values will stay as-is.
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel appearance="subtle" size="md" onClick={() => { setPendingTemplate(null); setShowSwitchDialog(false); }}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction appearance="primary" size="md" onClick={() => { if (pendingTemplate) applyTemplate(pendingTemplate); setPendingTemplate(null); setShowSwitchDialog(false); }}>
							Switch template
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* ── Toast ── */}
			{toastVisible && (
				<Box style={{
					position: "fixed", top: 64, right: 24, zIndex: 9999,
					background: "#202320", borderRadius: 10,
					padding: "12px 16px",
					display: "flex", alignItems: "center", gap: 12, maxWidth: 420,
					boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
				}}>
					<Text style={{ fontSize: 16, color: "#7dd3c8", flexShrink: 0 }}>ℹ</Text>
					<Text fontSize="sm" style={{ color: "#fff", flex: 1 }}>{toastMessage}</Text>
					<button style={{
						background: "none", border: "1px solid rgba(255,255,255,0.3)",
						borderRadius: 6, padding: "4px 10px",
						cursor: "pointer", color: "#fff", fontSize: 13, fontFamily: "inherit",
					}}>
						Undo
					</button>
					<button onClick={() => setToastVisible(false)} style={{
						background: "none", border: "none", cursor: "pointer",
						color: "rgba(255,255,255,0.7)", display: "flex", padding: 2,
					}}>
						<IconXmark size={14} />
					</button>
				</Box>
			)}
		</>
	);
}
