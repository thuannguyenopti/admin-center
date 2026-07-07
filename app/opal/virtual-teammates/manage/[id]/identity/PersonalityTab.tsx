"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
	AlertDialog, AlertDialogAction, AlertDialogBody, AlertDialogCancel,
	AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	Badge, Box, Button, Popover, PopoverContent, PopoverTrigger, Text, Tooltip,
} from "@optiaxiom/react";
import {
	IconArrowUp, IconChevronDown, IconChevronUp, IconCircleQuestion, IconPlus, IconUpload, IconXmark,
} from "@optiaxiom/icons";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 12,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.08em",
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
		icon: "/vt-icon-tape.png",
		description:
			"Done, done, and done. They cut through noise, skip the chit-chat, and get the job done. Always right, all the time.",
		traits: ["DECISIVE", "GROUNDED", "NO-NONSENSE", "RELIABLE"],
		tone: ["DIRECT", "PLAINSPOKEN", "WRY"],
		toneExtra: 2,
		detail: 0, warmth: 0, energy: 0,
		defaultTraits: ["Decisive", "Grounded", "No-nonsense", "Reliable"],
	},
	{
		id: "tastemaker",
		name: "The tastemaker",
		quote: '"I liked it before."',
		icon: "/vt-icon-disco.png",
		description:
			"The first to bring a crazy idea to life. They are nonchalant, set the standard, and somehow always know what's next.",
		traits: ["OPINIONATED", "DISCERNING", "AHEAD OF THE CURVE"],
		tone: ["CONFIDENT", "CULTURED", "COOL"],
		detail: 50, warmth: 50, energy: 50,
		defaultTraits: ["Opinionated", "Discerning", "Ahead of the curve", "Witty"],
	},
	{
		id: "hype-machine",
		name: "The hype machine",
		quote: '"Wait, hear me out."',
		icon: "/vt-icon-finger.png",
		description:
			'Enthusiasm is contagious and they\'re patient zero. They turn "meh" ideas into "wait, actually…" moments.',
		traits: ["ENTHUSIASTIC", "PERSUASIVE", "FUNNY", "ZERO CHILL"],
		tone: ["WARM", "SUPPORTIVE", "ENERGETIC"],
		detail: 100, warmth: 100, energy: 100,
		defaultTraits: ["Enthusiastic", "Persuasive", "Funny", "Infectious"],
	},
	{
		id: "spicy-realist",
		name: "The spicy realist",
		quote: '"Just saying."',
		icon: "/vt-icon-chili.png",
		description:
			"Skeptical? Always. Wrong? Rarely. They poke holes in bad ideas before they become expensive ones.",
		traits: ["SKEPTICAL", "SHARP", "BLUNT", "CONTRARIAN"],
		tone: ["DEADPAN", "BONE DRY", "WITTY"],
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

function getToneSummary(d: number, w: number, e: number): string {
	const dl = d === 0 ? "Brief" : d === 100 ? "Detailed" : "Balanced";
	const wl = w === 0 ? "Formal" : w === 100 ? "Warm" : "Balanced";
	const el = e === 0 ? "Mild" : e === 100 ? "Extra hot" : "Balanced";
	return `${dl} · ${wl} · ${el}`;
}

// ── Tone slider row ───────────────────────────────────────────────────────

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
	return (
		<Box style={{ marginBottom: 36 }}>
			<Text fontSize="sm" color="fg.secondary" style={{ fontWeight: 400, display: "block", marginBottom: 8 }}>
				{label}
			</Text>
			<input
				type="range"
				min={0}
				max={100}
				step={50}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				style={{ width: "100%", display: "block", cursor: "pointer", accentColor: "#616755" }}
			/>
			<Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 6 }}>
				<Text fontSize="sm" color="fg.secondary">{leftEmoji} {leftLabel}</Text>
				<Text fontSize="sm" color="fg.secondary" style={{ textAlign: "center" }}>⚖️ Balanced</Text>
				<Text fontSize="sm" color="fg.secondary" style={{ textAlign: "right" }}>{rightEmoji} {rightLabel}</Text>
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

// ── Accordion section ─────────────────────────────────────────────────────

function AccordionSection({
	title,
	tooltip,
	subtitle,
	summary,
	isOpen,
	onToggle,
	actionButton,
	children,
}: {
	title: string;
	tooltip?: string;
	subtitle?: string;
	summary: string;
	isOpen: boolean;
	onToggle: () => void;
	actionButton?: ReactNode;
	children: ReactNode;
}) {
	return (
		<Box
			bg="bg.default"
			style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, marginBottom: 16, padding: "20px 24px" }}
		>
			<Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
				<Box onClick={onToggle} style={{ cursor: "pointer", flex: 1, minWidth: 0 }}>
					<Box style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
						<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>{title}</Text>
						{tooltip && (
							<Tooltip delayDuration={300} content={tooltip}>
								<span style={{ display: "inline-flex" }}>
									<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
								</span>
							</Tooltip>
						)}
					</Box>
					<Text fontSize="sm" color="fg.secondary" style={{ display: "block" }}>
						{isOpen ? (subtitle ?? summary) : summary}
					</Text>
				</Box>
				<Box style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 16 }}>
					{isOpen && actionButton && (
						<Box onClick={(e) => e.stopPropagation()}>
							{actionButton}
						</Box>
					)}
					<Box
						onClick={onToggle}
						style={{ color: "var(--ax-colors-fg-tertiary)", display: "inline-flex", alignItems: "center", cursor: "pointer" }}
					>
						{isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
					</Box>
				</Box>
			</Box>
			{isOpen && (
				<Box style={{ marginTop: 20 }}>
					{children}
				</Box>
			)}
		</Box>
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
	const [configExpanded, setConfigExpanded] = useState(false);
	const [openSections, setOpenSections] = useState<Set<string>>(new Set());

	function toggleSection(key: string) {
		setOpenSections((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	}

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
		setConfigExpanded(false);
		setOpenSections(new Set());
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
									<img src={t.icon} alt="" width={40} height={40} style={{ objectFit: "contain", flexShrink: 0 }} />
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
				<Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
					<Box>
						<Text style={{ fontSize: 18, fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 4 }}>
							Configure manually
						</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ display: "block" }}>
							Edit or add personality traits to meet your exact needs
						</Text>
					</Box>
					<Button
						appearance="subtle"
						size="sm"
						icon={configExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
						iconPosition="end"
						onClick={() => {
							if (configExpanded) {
								setConfigExpanded(false);
								setOpenSections(new Set());
							} else {
								setConfigExpanded(true);
								setOpenSections(new Set(["traits", "tone", "values", "import"]));
							}
						}}
					>
						View details
					</Button>
				</Box>

				{!configExpanded ? (
					/* ── Collapsed summary ── */
					<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
						<Text fontSize="sm" color="fg.secondary" style={{ display: "block", marginBottom: 16 }}>Configuration overview</Text>
						<Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							<Box style={{ display: "flex", gap: 12, alignItems: "center" }}>
								<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, minWidth: 48 }}>TRAITS</span>
								<Box style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
									{activeTraits.map((t) => <Badge key={t} intent="information">{t.toUpperCase()}</Badge>)}
								</Box>
							</Box>
							<Box style={{ display: "flex", gap: 12, alignItems: "center" }}>
								<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, minWidth: 48 }}>TONE</span>
								<Box style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
									{getToneSummary(detail, warmth, energy).split(" · ").map((t) => <Badge key={t}>{t.toUpperCase()}</Badge>)}
								</Box>
							</Box>
							<Box style={{ display: "flex", gap: 12, alignItems: "center" }}>
								<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, minWidth: 48 }}>VALUES</span>
								<Text fontSize="sm" color="fg.secondary">{values.length} values saved</Text>
							</Box>
						</Box>
					</Box>
				) : (
					/* ── Expanded accordion ── */
					<Box>

						{/* Personality traits */}
						<AccordionSection
							title="Personality traits"
							tooltip="Keywords that shape how your teammate thinks and communicates."
							subtitle="Shape how Randy thinks and communicates"
							summary={activeTraits.slice(0, 4).join(" · ") + (activeTraits.length > 4 ? ` +${activeTraits.length - 4}` : "")}
							isOpen={openSections.has("traits")}
							onToggle={() => toggleSection("traits")}
						>
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
							<Box style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
								{/* Ghost pill / inline input at end of suggested row */}
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
												setNewTrait("");
												setShowAddTrait(false);
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
										onMouseEnter={(e) => {
											(e.currentTarget as HTMLButtonElement).style.borderStyle = "solid";
											(e.currentTarget as HTMLButtonElement).style.color = "var(--ax-colors-fg-default)";
										}}
										onMouseLeave={(e) => {
											(e.currentTarget as HTMLButtonElement).style.borderStyle = "dashed";
											(e.currentTarget as HTMLButtonElement).style.color = "var(--ax-colors-fg-tertiary)";
										}}
									>
										+ Add trait
									</button>
								)}
							</Box>
						</AccordionSection>

						{/* Tone of voice */}
						<AccordionSection
							title="Tone of voice"
							tooltip="Adjusts how formal, warm, and energetic your teammate sounds."
							subtitle={`Fine-tune ${name}'s communication style`}
							summary={getToneSummary(detail, warmth, energy)}
							isOpen={openSections.has("tone")}
							onToggle={() => toggleSection("tone")}
						>
							<ToneRow label="Detail" leftLabel="Brief" leftEmoji="🐣" rightLabel="Detailed" rightEmoji="🪄" value={detail} onChange={setDetail} />
							<ToneRow label="Warmth" leftLabel="Formal" leftEmoji="🏛" rightLabel="Warm" rightEmoji="☀️" value={warmth} onChange={setWarmth} />
							<ToneRow label="Spiciness" leftLabel="Mild" leftEmoji="🧊" rightLabel="Extra hot" rightEmoji="🌶️" value={energy} onChange={setEnergy} />
						</AccordionSection>

						{/* Values */}
						<AccordionSection
							title="Values"
							tooltip="Principles that guide your teammate's priorities and tradeoffs."
							subtitle="Principles that guide Randy's tradeoffs"
							summary={`${values.length} values set`}
							isOpen={openSections.has("values")}
							onToggle={() => toggleSection("values")}
						>
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
							<Box style={{ marginBottom: 12 }}>
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
							{/* Ghost input row */}
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
									onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderStyle = "solid"; }}
									onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderStyle = "dashed"; }}
								>
									<IconPlus size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
									<Text fontSize="sm" color="fg.tertiary">Add a value...</Text>
								</button>
							)}
						</AccordionSection>

						{/* Import a personality */}
						<AccordionSection
							title="Import a personality"
							subtitle="Paste a description or upload a file — we'll extract the traits and tone automatically"
							summary="Paste or upload to extract traits and tone"
							isOpen={openSections.has("import")}
							onToggle={() => toggleSection("import")}
							actionButton={<UploadPopover />}
						>
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
						</AccordionSection>

				</Box>
				)}

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
