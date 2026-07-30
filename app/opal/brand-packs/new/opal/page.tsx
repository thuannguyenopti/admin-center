<<<<<<< HEAD
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconArrowLeft,
	IconArrowRight,
	IconChevronLeft,
	IconChevronRight,
	IconXmark,
	IconPenToSquare as IconPencil,
	IconSparkles,
	IconCheck,
	IconGlobe,
} from "@optimizely/axiom-icons";

// ── Types ──────────────────────────────────────────────────────────────────────

type OptionId = string;

type Question = {
	id: string;
	text: string;
	multiSelect: boolean;
	options: Array<{ id: OptionId; label: string }>;
	opalMessage: string;
};

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
	{
		id: "brand-name",
		text: "What is your brand/company name?",
		multiSelect: false,
		opalMessage:
			"I've presented a few questions to help me tailor the brand pack to your needs. Please share your selections and any additional details so I can get started!",
		options: [
			{ id: "optimizely", label: "Optimizely" },
			{ id: "org-name", label: "Use my organization's name" },
		],
	},
	{
		id: "sections",
		text: "Which sections should the brand guidelines include?",
		multiSelect: true,
		opalMessage:
			"Great — now let me know what sections you'd like to include in the brand guidelines.",
		options: [
			{ id: "tone", label: "Tone of Voice & Writing Style" },
			{ id: "mission", label: "Brand Mission & Values" },
			{ id: "visual", label: "Visual Identity (colors, typography, logo usage)" },
			{ id: "messaging", label: "Messaging Framework (taglines, positioning statements)" },
			{ id: "dos-donts", label: "Do's & Don'ts" },
			{ id: "personas", label: "Target Audience Personas" },
		],
	},
	{
		id: "audience",
		text: "What is the primary audience for this document?",
		multiSelect: false,
		opalMessage:
			"Almost done — who is this brand pack primarily for?",
		options: [
			{ id: "internal", label: "Internal teams (marketing, content, design)" },
			{ id: "external", label: "External agencies and partners" },
			{ id: "both", label: "Both internal and external audiences" },
		],
	},
];

// URL step comes after questions
const URL_STEP_IDX = QUESTIONS.length;
const ANALYZING_STEP_IDX = URL_STEP_IDX + 1;

const TOTAL_CARD_STEPS = QUESTIONS.length + 1; // +1 for URL

const ANALYZING_STEPS = [
	"Browsing website…",
	"Extracting color palette…",
	"Analyzing typography…",
	"Detecting tone of voice…",
	"Building brand pack…",
];

// ── Chat history ──────────────────────────────────────────────────────────────

type ChatMessage = {
	role: "user" | "opal";
	text: string;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function OpalAvatar() {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				background: "linear-gradient(135deg, #ABFF44 0%, #347300 100%)",
				flexShrink: 0,
				height: 28,
				width: 28,
			}}
		>
			<IconSparkles size={12} style={{ color: "#202320" }} />
		</Box>
	);
}

function OpalLabel() {
	return (
		<Box alignItems="center" display="flex" gap="6">
			<OpalAvatar />
			<Text color="fg.accent" fontWeight="600" style={{ fontSize: 12 }}>Opal</Text>
		</Box>
	);
}

function UserBubble({ text }: { text: string }) {
	return (
		<Box display="flex" justifyContent="end">
			<Box
				alignItems="center"
				display="flex"
				gap="10"
			>
				<Box
					rounded="xl"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						border: "1px solid var(--ax-colors-border-tertiary)",
						color: "var(--ax-colors-fg-default)",
						fontSize: 14,
						lineHeight: 1.6,
						padding: "8px 16px",
					}}
				>
					{text}
				</Box>
				{/* User avatar placeholder */}
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{
						background: "var(--ax-colors-bg-accent)",
						color: "var(--ax-colors-fg-default-inverse)",
						flexShrink: 0,
						fontSize: 11,
						fontWeight: 700,
						height: 28,
						width: 28,
					}}
				>
					DS
				</Box>
			</Box>
		</Box>
	);
}

function OpalBubble({ text }: { text: string }) {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			<OpalLabel />
			<Text color="fg.default" style={{ fontSize: 14, lineHeight: 1.6 }}>
				{text}
			</Text>
		</Box>
	);
}

// ── Checkbox option row (multi-select) ────────────────────────────────────────

function CheckboxRow({
	label,
	checked,
	onClick,
}: {
	label: string;
	checked: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				alignItems: "center",
				background: "transparent",
				border: 0,
				borderBottom: "1px solid var(--ax-colors-border-tertiary)",
				cursor: "pointer",
				display: "flex",
				gap: 12,
				padding: "14px 16px",
				textAlign: "left",
				width: "100%",
			}}
		>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				rounded="sm"
				style={{
					background: checked ? "#1A6EF5" : "transparent",
					border: `1.5px solid ${checked ? "#1A6EF5" : "var(--ax-colors-border-default)"}`,
					flexShrink: 0,
					height: 18,
					width: 18,
					transition: "all 0.12s ease",
				}}
			>
				{checked && <IconCheck size={11} style={{ color: "#fff" }} />}
			</Box>
			<Text style={{ fontSize: 14 }}>{label}</Text>
		</button>
	);
}

// ── Numbered option row (single-select) ───────────────────────────────────────

function NumberedRow({
	number,
	label,
	onClick,
}: {
	number: number;
	label: string;
	onClick: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				alignItems: "center",
				background: hovered ? "var(--ax-colors-bg-secondary)" : "transparent",
				border: 0,
				borderBottom: "1px solid var(--ax-colors-border-tertiary)",
				cursor: "pointer",
				display: "flex",
				gap: 12,
				justifyContent: "space-between",
				padding: "14px 16px",
				textAlign: "left",
				transition: "background 0.12s ease",
				width: "100%",
			}}
		>
			<Box alignItems="center" display="flex" gap="12">
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						color: "var(--ax-colors-fg-secondary)",
						flexShrink: 0,
						fontSize: 12,
						fontWeight: 600,
						height: 24,
						width: 24,
					}}
				>
					{number}
				</Box>
				<Text style={{ fontSize: 14 }}>{label}</Text>
			</Box>
			<IconArrowRight
				size={14}
				style={{
					color: "var(--ax-colors-fg-tertiary)",
					flexShrink: 0,
					opacity: hovered ? 1 : 0,
					transition: "opacity 0.12s ease",
				}}
			/>
		</button>
	);
}

// ── "Something else" row ──────────────────────────────────────────────────────

function SomethingElseRow({
	value,
	onChange,
	isMulti,
	checked,
	onCheck,
}: {
	value: string;
	onChange: (v: string) => void;
	isMulti: boolean;
	checked?: boolean;
	onCheck?: () => void;
}) {
	const ref = useRef<HTMLInputElement>(null);

	return (
		<Box
			alignItems="center"
			display="flex"
			gap="12"
			style={{
				borderBottom: "1px solid var(--ax-colors-border-tertiary)",
				padding: "12px 16px",
			}}
		>
			{isMulti ? (
				<button
					type="button"
					onClick={onCheck}
					style={{
						alignItems: "center",
						background: "transparent",
						border: 0,
						cursor: "pointer",
						display: "flex",
						flexShrink: 0,
						padding: 0,
					}}
				>
					<Box
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
						style={{
							background: checked ? "#1A6EF5" : "transparent",
							border: `1.5px solid ${checked ? "#1A6EF5" : "var(--ax-colors-border-default)"}`,
							height: 18,
							width: 18,
						}}
					>
						{checked && <IconCheck size={11} style={{ color: "#fff" }} />}
					</Box>
				</button>
			) : (
				<IconPencil size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
			)}
			<input
				ref={ref}
				type="text"
				placeholder="Something else"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onClick={() => { if (isMulti && onCheck && !checked) onCheck(); }}
				style={{
					background: "transparent",
					border: 0,
					color: value ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
					flex: 1,
					fontSize: 14,
					outline: "none",
				}}
			/>
		</Box>
	);
}

// ── Question card ─────────────────────────────────────────────────────────────

type CardProps = {
	question: Question;
	cardStep: number;
	totalCards: number;
	selected: Set<OptionId>;
	somethingElse: string;
	somethingElseChecked: boolean;
	onToggle: (id: OptionId) => void;
	onSomethingElseChange: (v: string) => void;
	onSomethingElseCheck: () => void;
	onPrev: () => void;
	onNext: (skipToUrl?: boolean) => void;
	onSkip: () => void;
	onDismiss: () => void;
};

function QuestionCard({
	question,
	cardStep,
	totalCards,
	selected,
	somethingElse,
	somethingElseChecked,
	onToggle,
	onSomethingElseChange,
	onSomethingElseCheck,
	onPrev,
	onNext,
	onSkip,
	onDismiss,
}: CardProps) {
	const selectionCount = selected.size + (somethingElseChecked && somethingElse.trim() ? 1 : 0);
	const canAdvance = selectionCount > 0 || (somethingElse.trim().length > 0 && !question.multiSelect);

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			rounded="xl"
			shadow="sm"
			style={{ overflow: "hidden" }}
		>
			{/* Card header */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ padding: "14px 16px 10px" }}
			>
				<Text fontWeight="600" style={{ fontSize: 14, flex: 1, paddingRight: 16 }}>
					{question.text}
				</Text>

				{/* Pagination */}
				<Box alignItems="center" display="flex" gap="4" style={{ flexShrink: 0 }}>
					<button
						type="button"
						onClick={onPrev}
						disabled={cardStep === 0}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: cardStep === 0 ? "var(--ax-colors-fg-disabled)" : "var(--ax-colors-fg-secondary)",
							cursor: cardStep === 0 ? "not-allowed" : "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronLeft size={14} />
					</button>
					<Text color="fg.tertiary" style={{ fontSize: 12, fontWeight: 500, minWidth: 40, textAlign: "center" }}>
						{cardStep + 1} of {totalCards}
					</Text>
					<button
						type="button"
						onClick={() => onNext()}
						disabled={!canAdvance}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: canAdvance ? "var(--ax-colors-fg-secondary)" : "var(--ax-colors-fg-disabled)",
							cursor: canAdvance ? "pointer" : "not-allowed",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronRight size={14} />
					</button>
					<button
						type="button"
						onClick={onDismiss}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-tertiary)",
							cursor: "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							marginLeft: 4,
							padding: 0,
							width: 22,
						}}
					>
						<IconXmark size={14} />
					</button>
				</Box>
			</Box>

			{/* Options */}
			<Box display="flex" flexDirection="column">
				{question.options.map((opt, idx) =>
					question.multiSelect ? (
						<CheckboxRow
							key={opt.id}
							label={opt.label}
							checked={selected.has(opt.id)}
							onClick={() => onToggle(opt.id)}
						/>
					) : (
						<NumberedRow
							key={opt.id}
							number={idx + 1}
							label={opt.label}
							onClick={() => onNext()}
						/>
					)
				)}

				{/* Something else */}
				<SomethingElseRow
					value={somethingElse}
					onChange={onSomethingElseChange}
					isMulti={question.multiSelect}
					checked={somethingElseChecked}
					onCheck={onSomethingElseCheck}
				/>
			</Box>

			{/* Footer */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{
					padding: "10px 16px",
				}}
			>
				{question.multiSelect ? (
					<Text color="fg.tertiary" style={{ fontSize: 13 }}>
						{selectionCount} selected
					</Text>
				) : (
					<Box />
				)}
				<Box alignItems="center" display="flex" gap="8">
					<Button appearance="subtle" size="sm" onClick={onSkip}>
						Skip
					</Button>
					{question.multiSelect && (
						<button
							type="button"
							onClick={() => onNext()}
							disabled={!canAdvance}
							style={{
								alignItems: "center",
								background: canAdvance ? "#1A6EF5" : "var(--ax-colors-bg-secondary)",
								border: 0,
								borderRadius: 8,
								color: canAdvance ? "#fff" : "var(--ax-colors-fg-tertiary)",
								cursor: canAdvance ? "pointer" : "not-allowed",
								display: "flex",
								height: 32,
								justifyContent: "center",
								transition: "all 0.15s ease",
								width: 32,
							}}
						>
							<IconArrowRight size={15} />
						</button>
					)}
				</Box>
			</Box>
		</Box>
	);
}

// ── URL card ──────────────────────────────────────────────────────────────────

function UrlCard({
	url,
	onUrlChange,
	onSubmit,
	onSkip,
	onPrev,
	onDismiss,
	cardStep,
	totalCards,
}: {
	url: string;
	onUrlChange: (v: string) => void;
	onSubmit: () => void;
	onSkip: () => void;
	onPrev: () => void;
	onDismiss: () => void;
	cardStep: number;
	totalCards: number;
}) {
	const isValid = url.trim().length > 0;

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			rounded="xl"
			shadow="sm"
			style={{ overflow: "hidden" }}
		>
			{/* Header */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ padding: "14px 16px 10px" }}
			>
				<Text fontWeight="600" style={{ fontSize: 14, flex: 1, paddingRight: 16 }}>
					Share your brand's website so Opal can analyze it
				</Text>
				<Box alignItems="center" display="flex" gap="4" style={{ flexShrink: 0 }}>
					<button
						type="button"
						onClick={onPrev}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-secondary)",
							cursor: "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronLeft size={14} />
					</button>
					<Text color="fg.tertiary" style={{ fontSize: 12, fontWeight: 500, minWidth: 40, textAlign: "center" }}>
						{cardStep + 1} of {totalCards}
					</Text>
					<button
						type="button"
						disabled
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-disabled)",
							cursor: "not-allowed",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronRight size={14} />
					</button>
					<button
						type="button"
						onClick={onDismiss}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-tertiary)",
							cursor: "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							marginLeft: 4,
							padding: 0,
							width: 22,
						}}
					>
						<IconXmark size={14} />
					</button>
				</Box>
			</Box>

			{/* URL input */}
			<Box style={{ padding: "4px 16px 16px" }}>
				<Box
					alignItems="center"
					display="flex"
					gap="10"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						border: "1.5px solid var(--ax-colors-border-default)",
						borderRadius: 10,
						padding: "10px 14px",
					}}
				>
					<IconGlobe size={15} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
					<input
						type="url"
						placeholder="https://yourbrand.com"
						value={url}
						onChange={(e) => onUrlChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && isValid) onSubmit();
						}}
						autoFocus
						style={{
							background: "transparent",
							border: 0,
							color: "var(--ax-colors-fg-default)",
							flex: 1,
							fontSize: 14,
							outline: "none",
						}}
					/>
				</Box>
				<Text color="fg.tertiary" fontSize="xs" style={{ marginTop: 6 }}>
					Opal will browse this URL to extract colors, typography, and tone.
				</Text>
			</Box>

			{/* Footer */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ padding: "10px 16px" }}
			>
				<Box />
				<Box alignItems="center" display="flex" gap="8">
					<Button appearance="subtle" size="sm" onClick={onSkip}>
						Skip
					</Button>
					<button
						type="button"
						onClick={onSubmit}
						disabled={!isValid}
						style={{
							alignItems: "center",
							background: isValid ? "#1A6EF5" : "var(--ax-colors-bg-secondary)",
							border: 0,
							borderRadius: 8,
							color: isValid ? "#fff" : "var(--ax-colors-fg-tertiary)",
							cursor: isValid ? "pointer" : "not-allowed",
							display: "flex",
							height: 32,
							justifyContent: "center",
							transition: "all 0.15s ease",
							width: 32,
						}}
					>
						<IconArrowRight size={15} />
					</button>
				</Box>
			</Box>
		</Box>
	);
}

// ── Analyzing card ────────────────────────────────────────────────────────────

function AnalyzingCard({ currentStep }: { currentStep: number }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="20"
			rounded="xl"
			shadow="sm"
		>
			<Box alignItems="center" display="flex" gap="12">
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{
						animation: "opal-spin 1.5s linear infinite",
						background: "linear-gradient(135deg, #ABFF44 0%, #347300 100%)",
						flexShrink: 0,
						height: 32,
						width: 32,
					}}
				>
					<IconSparkles size={14} style={{ color: "#202320" }} />
				</Box>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="600" style={{ fontSize: 14 }}>
						Opal is analyzing your brand…
					</Text>
					<Text color="fg.tertiary" fontSize="xs">
						This usually takes just a few seconds
					</Text>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" gap="8">
				{ANALYZING_STEPS.map((step, i) => {
					const isDone = i < currentStep;
					const isActive = i === currentStep;
					return (
						<Box key={step} alignItems="center" display="flex" gap="10">
							<Box
								alignItems="center"
								display="flex"
								justifyContent="center"
								rounded="full"
								style={{
									background: isDone
										? "var(--ax-colors-bg-accent)"
										: isActive
										? "var(--ax-colors-bg-accent-subtle)"
										: "var(--ax-colors-bg-secondary)",
									flexShrink: 0,
									height: 20,
									width: 20,
								}}
							>
								{isDone ? (
									<IconCheck size={10} style={{ color: "var(--ax-colors-fg-default-inverse)" }} />
								) : isActive ? (
									<Box
										rounded="full"
										style={{
											animation: "opal-pulse 1s ease-in-out infinite",
											background: "var(--ax-colors-fg-accent)",
											height: 6,
											width: 6,
										}}
									/>
								) : null}
							</Box>
							<Text
								style={{
									color: isDone || isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
									fontSize: 13,
									fontWeight: isActive ? 500 : 400,
								}}
							>
								{step}
							</Text>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BrandPackOpalSetupPage() {
	const router = useRouter();

	const [step, setStep] = useState(0); // 0..Q-1 = questions; URL_STEP_IDX = url; ANALYZING_STEP_IDX = analyzing
	const [answers, setAnswers] = useState<Record<string, Set<OptionId>>>(
		() => Object.fromEntries(QUESTIONS.map((q) => [q.id, new Set()]))
	);
	const [somethingElse, setSomethingElse] = useState<Record<string, string>>(
		() => Object.fromEntries(QUESTIONS.map((q) => [q.id, ""]))
	);
	const [somethingElseChecked, setSomethingElseChecked] = useState<Record<string, boolean>>(
		() => Object.fromEntries(QUESTIONS.map((q) => [q.id, false]))
	);
	const [url, setUrl] = useState("");
	const [analyzingStep, setAnalyzingStep] = useState(0);

	// Chat history — grows as user answers questions
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
		{ role: "user", text: "I want to create a brand pack" },
		{ role: "opal", text: QUESTIONS[0].opalMessage },
	]);

	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatHistory, step]);

	// Analyzing animation
	useEffect(() => {
		if (step !== ANALYZING_STEP_IDX) return;
		setAnalyzingStep(0);
		const interval = setInterval(() => {
			setAnalyzingStep((prev) => {
				if (prev >= ANALYZING_STEPS.length - 1) {
					clearInterval(interval);
					setTimeout(() => router.push("/opal/brand-packs/stride-core"), 700);
					return prev;
				}
				return prev + 1;
			});
		}, 950);
		return () => clearInterval(interval);
	}, [step, router]);

	const currentQ = step < QUESTIONS.length ? QUESTIONS[step] : null;
	const currentSelected = currentQ ? answers[currentQ.id] : new Set<OptionId>();
	const currentSomethingElse = currentQ ? somethingElse[currentQ.id] : "";
	const currentSomethingElseChecked = currentQ ? somethingElseChecked[currentQ.id] : false;

	function toggleOption(id: OptionId) {
		if (!currentQ) return;
		setAnswers((prev) => {
			const set = new Set(prev[currentQ.id]);
			if (currentQ.multiSelect) {
				if (set.has(id)) set.delete(id);
				else set.add(id);
			} else {
				set.clear();
				set.add(id);
			}
			return { ...prev, [currentQ.id]: set };
		});
	}

	function buildUserAnswerText(): string {
		if (!currentQ) return "Skipped";
		const labels = Array.from(currentSelected)
			.map((id) => currentQ.options.find((o) => o.id === id)?.label)
			.filter(Boolean);
		const parts = [...labels];
		if (currentSomethingElseChecked && currentSomethingElse.trim()) {
			parts.push(currentSomethingElse.trim());
		} else if (!currentQ.multiSelect && currentSomethingElse.trim() && currentSelected.size === 0) {
			parts.push(currentSomethingElse.trim());
		}
		return parts.length ? parts.join(", ") : "Skipped";
	}

	function advanceStep(skipToUrl?: boolean) {
		const answerText = buildUserAnswerText();
		const nextStep = skipToUrl ? URL_STEP_IDX : step + 1;

		const nextOpalMsg =
			nextStep < QUESTIONS.length
				? QUESTIONS[nextStep].opalMessage
				: nextStep === URL_STEP_IDX
				? "Almost there! What's your brand's website? I'll browse it to extract your visual identity automatically."
				: "";

		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: answerText },
			...(nextOpalMsg ? [{ role: "opal" as const, text: nextOpalMsg }] : []),
		]);
		setStep(nextStep);
	}

	function handleSkip() {
		const nextStep = step + 1;
		const nextOpalMsg =
			nextStep < QUESTIONS.length
				? QUESTIONS[nextStep].opalMessage
				: nextStep === URL_STEP_IDX
				? "No problem — one last thing. Do you have a website I can browse to help build the pack?"
				: "";
		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: "Skipped" },
			...(nextOpalMsg ? [{ role: "opal" as const, text: nextOpalMsg }] : []),
		]);
		setStep(nextStep);
	}

	function handlePrev() {
		if (step === 0) return;
		setStep((prev) => prev - 1);
		// Remove last two chat messages (user answer + opal response)
		setChatHistory((prev) => prev.slice(0, -2));
	}

	function handleDismiss() {
		router.push("/opal/brand-packs");
	}

	function handleUrlSubmit() {
		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: url },
			{ role: "opal", text: `On it — I'm browsing ${url} now to extract your brand identity.` },
		]);
		setStep(ANALYZING_STEP_IDX);
	}

	function handleUrlSkip() {
		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: "Skipped" },
			{ role: "opal", text: "No problem! Building your brand pack with the information you've shared…" },
		]);
		setStep(ANALYZING_STEP_IDX);
	}

	// For numbered rows (single-select): clicking a row selects it then auto-advances
	function handleNumberedRowClick(optId: OptionId) {
		if (!currentQ) return;
		setAnswers((prev) => ({
			...prev,
			[currentQ.id]: new Set([optId]),
		}));
		// Brief delay so selection is visible before advance
		setTimeout(() => advanceStep(), 120);
	}

	return (
		<>
			<style>{`
				@keyframes opal-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
				@keyframes opal-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
			`}</style>

			<Box display="flex" flexDirection="column" h="full" overflow="hidden">
				{/* Header */}
				<Box
					bg="bg.default"
					alignItems="center"
					display="flex"
					gap="12"
					style={{
						borderBottom: "1px solid var(--ax-colors-border-tertiary)",
						flexShrink: 0,
						padding: "12px 24px",
					}}
				>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconArrowLeft />}
						aria-label="Back"
						onClick={handleDismiss}
					/>
					<Box display="flex" flexDirection="column" gap="2">
						<Text fontWeight="600" style={{ fontSize: 14 }}>New Brand Pack</Text>
						<Text color="fg.tertiary" fontSize="xs">Set up with Opal</Text>
					</Box>
				</Box>

				{/* Chat area */}
				<Box
					display="flex"
					flexDirection="column"
					style={{ flex: 1, overflowY: "auto", padding: "32px 0 64px" }}
				>
					<Box
						display="flex"
						flexDirection="column"
						gap="20"
						style={{ margin: "0 auto", maxWidth: 660, padding: "0 32px", width: "100%" }}
					>
						{/* Render chat history */}
						{chatHistory.map((msg, i) => (
							msg.role === "user"
								? <UserBubble key={i} text={msg.text} />
								: <OpalBubble key={i} text={msg.text} />
						))}

						{/* Action toolbar under Opal messages (like the real UI) */}
						{step < QUESTIONS.length && (
							<Box style={{ display: "flex", gap: 8, paddingLeft: 0 }}>
								{/* placeholder feedback row — matches the copy/thumbs icons in screenshots */}
							</Box>
						)}

						{/* Active question card */}
						{step < QUESTIONS.length && currentQ && (
							<QuestionCard
								question={currentQ}
								cardStep={step}
								totalCards={TOTAL_CARD_STEPS}
								selected={currentSelected}
								somethingElse={currentSomethingElse}
								somethingElseChecked={currentSomethingElseChecked}
								onToggle={(id) => {
									if (currentQ.multiSelect) {
										toggleOption(id);
									} else {
										handleNumberedRowClick(id);
									}
								}}
								onSomethingElseChange={(v) =>
									setSomethingElse((prev) => ({ ...prev, [currentQ.id]: v }))
								}
								onSomethingElseCheck={() =>
									setSomethingElseChecked((prev) => ({
										...prev,
										[currentQ.id]: !prev[currentQ.id],
									}))
								}
								onPrev={handlePrev}
								onNext={advanceStep}
								onSkip={handleSkip}
								onDismiss={handleDismiss}
							/>
						)}

						{step === URL_STEP_IDX && (
							<UrlCard
								url={url}
								onUrlChange={setUrl}
								onSubmit={handleUrlSubmit}
								onSkip={handleUrlSkip}
								onPrev={handlePrev}
								onDismiss={handleDismiss}
								cardStep={URL_STEP_IDX}
								totalCards={TOTAL_CARD_STEPS}
							/>
						)}

						{step === ANALYZING_STEP_IDX && (
							<AnalyzingCard currentStep={analyzingStep} />
						)}

						<div ref={bottomRef} />
					</Box>
				</Box>
			</Box>
		</>
	);
}
=======
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconArrowLeft,
	IconArrowRight,
	IconChevronLeft,
	IconChevronRight,
	IconXmark,
	IconPenToSquare as IconPencil,
	IconSparkles,
	IconCheck,
	IconGlobe,
} from "@optimizely/axiom-icons";
import { BrandPackPageHeader } from "../../components/BrandPackPageHeader";

// ── Types ──────────────────────────────────────────────────────────────────────

type OptionId = string;

type Question = {
	id: string;
	text: string;
	multiSelect: boolean;
	options: Array<{ id: OptionId; label: string }>;
	opalMessage: string;
};

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
	{
		id: "brand-name",
		text: "What is your brand/company name?",
		multiSelect: false,
		opalMessage:
			"I've presented a few questions to help me tailor the brand to your needs. Please share your selections and any additional details so I can get started!",
		options: [
			{ id: "manual-entry", label: "Enter a new brand name" },
			{ id: "org-name", label: "Use my organization's name" },
		],
	},
	{
		id: "sections",
		text: "Which sections should the brand guidelines include?",
		multiSelect: true,
		opalMessage:
			"Great — now let me know what sections you'd like to include in the brand guidelines.",
		options: [
			{ id: "tone", label: "Tone of Voice & Writing Style" },
			{ id: "mission", label: "Brand Mission & Values" },
			{ id: "visual", label: "Visual Identity (colors, typography, logo usage)" },
			{ id: "messaging", label: "Messaging Framework (taglines, positioning statements)" },
			{ id: "dos-donts", label: "Do's & Don'ts" },
			{ id: "personas", label: "Target Audience Personas" },
		],
	},
	{
		id: "audience",
		text: "What is the primary audience for this document?",
		multiSelect: false,
		opalMessage:
			"Almost done — who is this brand primarily for?",
		options: [
			{ id: "internal", label: "Internal teams (marketing, content, design)" },
			{ id: "external", label: "External agencies and partners" },
			{ id: "both", label: "Both internal and external audiences" },
		],
	},
];

// URL step comes after questions
const URL_STEP_IDX = QUESTIONS.length;
const ANALYZING_STEP_IDX = URL_STEP_IDX + 1;

const TOTAL_CARD_STEPS = QUESTIONS.length + 1; // +1 for URL

const ANALYZING_STEPS = [
	"Browsing website…",
	"Extracting color palette…",
	"Analyzing typography…",
	"Detecting tone of voice…",
	"Building brand…",
];

const BRAND_PACKS_HOME = "/opal/context?tab=brand";

// ── Chat history ──────────────────────────────────────────────────────────────

type ChatMessage = {
	role: "user" | "opal";
	text: string;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function OpalAvatar() {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				background: "linear-gradient(135deg, #ABFF44 0%, #347300 100%)",
				flexShrink: 0,
				height: 28,
				width: 28,
			}}
		>
			<IconSparkles size={12} style={{ color: "#202320" }} />
		</Box>
	);
}

function OpalLabel() {
	return (
		<Box alignItems="center" display="flex" gap="6">
			<OpalAvatar />
			<Text color="fg.accent" fontWeight="600" style={{ fontSize: 12 }}>Opal</Text>
		</Box>
	);
}

function UserBubble({ text }: { text: string }) {
	return (
		<Box display="flex" justifyContent="end">
			<Box
				alignItems="center"
				display="flex"
				gap="10"
			>
				<Box
					rounded="xl"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						border: "1px solid var(--ax-colors-border-tertiary)",
						color: "var(--ax-colors-fg-default)",
						fontSize: 14,
						lineHeight: 1.6,
						padding: "8px 16px",
					}}
				>
					{text}
				</Box>
				{/* User avatar placeholder */}
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{
						background: "var(--ax-colors-bg-accent)",
						color: "var(--ax-colors-fg-default-inverse)",
						flexShrink: 0,
						fontSize: 11,
						fontWeight: 700,
						height: 28,
						width: 28,
					}}
				>
					DS
				</Box>
			</Box>
		</Box>
	);
}

function OpalBubble({ text }: { text: string }) {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			<OpalLabel />
			<Text color="fg.default" style={{ fontSize: 14, lineHeight: 1.6 }}>
				{text}
			</Text>
		</Box>
	);
}

// ── Checkbox option row (multi-select) ────────────────────────────────────────

function CheckboxRow({
	label,
	checked,
	onClick,
}: {
	label: string;
	checked: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				alignItems: "center",
				background: "transparent",
				border: 0,
				borderBottom: "1px solid var(--ax-colors-border-tertiary)",
				cursor: "pointer",
				display: "flex",
				gap: 12,
				padding: "14px 16px",
				textAlign: "left",
				width: "100%",
			}}
		>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				rounded="sm"
				style={{
					background: checked ? "#1A6EF5" : "transparent",
					border: `1.5px solid ${checked ? "#1A6EF5" : "var(--ax-colors-border-default)"}`,
					flexShrink: 0,
					height: 18,
					width: 18,
					transition: "all 0.12s ease",
				}}
			>
				{checked && <IconCheck size={11} style={{ color: "#fff" }} />}
			</Box>
			<Text style={{ fontSize: 14 }}>{label}</Text>
		</button>
	);
}

// ── Numbered option row (single-select) ───────────────────────────────────────

function NumberedRow({
	number,
	label,
	onClick,
}: {
	number: number;
	label: string;
	onClick: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				alignItems: "center",
				background: hovered ? "var(--ax-colors-bg-secondary)" : "transparent",
				border: 0,
				borderBottom: "1px solid var(--ax-colors-border-tertiary)",
				cursor: "pointer",
				display: "flex",
				gap: 12,
				justifyContent: "space-between",
				padding: "14px 16px",
				textAlign: "left",
				transition: "background 0.12s ease",
				width: "100%",
			}}
		>
			<Box alignItems="center" display="flex" gap="12">
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						color: "var(--ax-colors-fg-secondary)",
						flexShrink: 0,
						fontSize: 12,
						fontWeight: 600,
						height: 24,
						width: 24,
					}}
				>
					{number}
				</Box>
				<Text style={{ fontSize: 14 }}>{label}</Text>
			</Box>
			<IconArrowRight
				size={14}
				style={{
					color: "var(--ax-colors-fg-tertiary)",
					flexShrink: 0,
					opacity: hovered ? 1 : 0,
					transition: "opacity 0.12s ease",
				}}
			/>
		</button>
	);
}

// ── "Something else" row ──────────────────────────────────────────────────────

function SomethingElseRow({
	value,
	onChange,
	isMulti,
	checked,
	onCheck,
}: {
	value: string;
	onChange: (v: string) => void;
	isMulti: boolean;
	checked?: boolean;
	onCheck?: () => void;
}) {
	const ref = useRef<HTMLInputElement>(null);

	return (
		<Box
			alignItems="center"
			display="flex"
			gap="12"
			style={{
				borderBottom: "1px solid var(--ax-colors-border-tertiary)",
				padding: "12px 16px",
			}}
		>
			{isMulti ? (
				<button
					type="button"
					onClick={onCheck}
					style={{
						alignItems: "center",
						background: "transparent",
						border: 0,
						cursor: "pointer",
						display: "flex",
						flexShrink: 0,
						padding: 0,
					}}
				>
					<Box
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
						style={{
							background: checked ? "#1A6EF5" : "transparent",
							border: `1.5px solid ${checked ? "#1A6EF5" : "var(--ax-colors-border-default)"}`,
							height: 18,
							width: 18,
						}}
					>
						{checked && <IconCheck size={11} style={{ color: "#fff" }} />}
					</Box>
				</button>
			) : (
				<IconPencil size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
			)}
			<input
				ref={ref}
				type="text"
				placeholder="Something else"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onClick={() => { if (isMulti && onCheck && !checked) onCheck(); }}
				style={{
					background: "transparent",
					border: 0,
					color: value ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
					flex: 1,
					fontSize: 14,
					outline: "none",
				}}
			/>
		</Box>
	);
}

// ── Question card ─────────────────────────────────────────────────────────────

type CardProps = {
	question: Question;
	cardStep: number;
	totalCards: number;
	selected: Set<OptionId>;
	somethingElse: string;
	somethingElseChecked: boolean;
	onToggle: (id: OptionId) => void;
	onSomethingElseChange: (v: string) => void;
	onSomethingElseCheck: () => void;
	onPrev: () => void;
	onNext: (skipToUrl?: boolean) => void;
	onSkip: () => void;
	onDismiss: () => void;
};

function QuestionCard({
	question,
	cardStep,
	totalCards,
	selected,
	somethingElse,
	somethingElseChecked,
	onToggle,
	onSomethingElseChange,
	onSomethingElseCheck,
	onPrev,
	onNext,
	onSkip,
	onDismiss,
}: CardProps) {
	const selectionCount = selected.size + (somethingElseChecked && somethingElse.trim() ? 1 : 0);
	const canAdvance = selectionCount > 0 || (somethingElse.trim().length > 0 && !question.multiSelect);

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			rounded="xl"
			shadow="sm"
			style={{ overflow: "hidden" }}
		>
			{/* Card header */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ padding: "14px 16px 10px" }}
			>
				<Text fontWeight="600" style={{ fontSize: 14, flex: 1, paddingRight: 16 }}>
					{question.text}
				</Text>

				{/* Pagination */}
				<Box alignItems="center" display="flex" gap="4" style={{ flexShrink: 0 }}>
					<button
						type="button"
						onClick={onPrev}
						disabled={cardStep === 0}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: cardStep === 0 ? "var(--ax-colors-fg-disabled)" : "var(--ax-colors-fg-secondary)",
							cursor: cardStep === 0 ? "not-allowed" : "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronLeft size={14} />
					</button>
					<Text color="fg.tertiary" style={{ fontSize: 12, fontWeight: 500, minWidth: 40, textAlign: "center" }}>
						{cardStep + 1} of {totalCards}
					</Text>
					<button
						type="button"
						onClick={() => onNext()}
						disabled={!canAdvance}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: canAdvance ? "var(--ax-colors-fg-secondary)" : "var(--ax-colors-fg-disabled)",
							cursor: canAdvance ? "pointer" : "not-allowed",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronRight size={14} />
					</button>
					<button
						type="button"
						onClick={onDismiss}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-tertiary)",
							cursor: "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							marginLeft: 4,
							padding: 0,
							width: 22,
						}}
					>
						<IconXmark size={14} />
					</button>
				</Box>
			</Box>

			{/* Options */}
			<Box display="flex" flexDirection="column">
				{question.options.map((opt, idx) =>
					question.multiSelect ? (
						<CheckboxRow
							key={opt.id}
							label={opt.label}
							checked={selected.has(opt.id)}
							onClick={() => onToggle(opt.id)}
						/>
					) : (
						<NumberedRow
							key={opt.id}
							number={idx + 1}
							label={opt.label}
							onClick={() => onNext()}
						/>
					)
				)}

				{/* Something else */}
				<SomethingElseRow
					value={somethingElse}
					onChange={onSomethingElseChange}
					isMulti={question.multiSelect}
					checked={somethingElseChecked}
					onCheck={onSomethingElseCheck}
				/>
			</Box>

			{/* Footer */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{
					padding: "10px 16px",
				}}
			>
				{question.multiSelect ? (
					<Text color="fg.tertiary" style={{ fontSize: 13 }}>
						{selectionCount} selected
					</Text>
				) : (
					<Box />
				)}
				<Box alignItems="center" display="flex" gap="8">
					<Button appearance="subtle" size="sm" onClick={onSkip}>
						Skip
					</Button>
					{question.multiSelect && (
						<button
							type="button"
							onClick={() => onNext()}
							disabled={!canAdvance}
							style={{
								alignItems: "center",
								background: canAdvance ? "#1A6EF5" : "var(--ax-colors-bg-secondary)",
								border: 0,
								borderRadius: 8,
								color: canAdvance ? "#fff" : "var(--ax-colors-fg-tertiary)",
								cursor: canAdvance ? "pointer" : "not-allowed",
								display: "flex",
								height: 32,
								justifyContent: "center",
								transition: "all 0.15s ease",
								width: 32,
							}}
						>
							<IconArrowRight size={15} />
						</button>
					)}
				</Box>
			</Box>
		</Box>
	);
}

// ── URL card ──────────────────────────────────────────────────────────────────

function UrlCard({
	url,
	onUrlChange,
	onSubmit,
	onSkip,
	onPrev,
	onDismiss,
	cardStep,
	totalCards,
}: {
	url: string;
	onUrlChange: (v: string) => void;
	onSubmit: () => void;
	onSkip: () => void;
	onPrev: () => void;
	onDismiss: () => void;
	cardStep: number;
	totalCards: number;
}) {
	const isValid = url.trim().length > 0;

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			rounded="xl"
			shadow="sm"
			style={{ overflow: "hidden" }}
		>
			{/* Header */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ padding: "14px 16px 10px" }}
			>
				<Text fontWeight="600" style={{ fontSize: 14, flex: 1, paddingRight: 16 }}>
					Share your brand's website so Opal can analyze it
				</Text>
				<Box alignItems="center" display="flex" gap="4" style={{ flexShrink: 0 }}>
					<button
						type="button"
						onClick={onPrev}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-secondary)",
							cursor: "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronLeft size={14} />
					</button>
					<Text color="fg.tertiary" style={{ fontSize: 12, fontWeight: 500, minWidth: 40, textAlign: "center" }}>
						{cardStep + 1} of {totalCards}
					</Text>
					<button
						type="button"
						disabled
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-disabled)",
							cursor: "not-allowed",
							display: "flex",
							height: 22,
							justifyContent: "center",
							padding: 0,
							width: 22,
						}}
					>
						<IconChevronRight size={14} />
					</button>
					<button
						type="button"
						onClick={onDismiss}
						style={{
							alignItems: "center",
							background: "transparent",
							border: 0,
							borderRadius: 4,
							color: "var(--ax-colors-fg-tertiary)",
							cursor: "pointer",
							display: "flex",
							height: 22,
							justifyContent: "center",
							marginLeft: 4,
							padding: 0,
							width: 22,
						}}
					>
						<IconXmark size={14} />
					</button>
				</Box>
			</Box>

			{/* URL input */}
			<Box style={{ padding: "4px 16px 16px" }}>
				<Box
					alignItems="center"
					display="flex"
					gap="10"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						border: "1.5px solid var(--ax-colors-border-default)",
						borderRadius: 10,
						padding: "10px 14px",
					}}
				>
					<IconGlobe size={15} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
					<input
						type="url"
						placeholder="https://yourbrand.com"
						value={url}
						onChange={(e) => onUrlChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && isValid) onSubmit();
						}}
						autoFocus
						style={{
							background: "transparent",
							border: 0,
							color: "var(--ax-colors-fg-default)",
							flex: 1,
							fontSize: 14,
							outline: "none",
						}}
					/>
				</Box>
				<Text color="fg.tertiary" fontSize="xs" style={{ marginTop: 6 }}>
					Opal will browse this URL to extract colors, typography, and tone.
				</Text>
			</Box>

			{/* Footer */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ padding: "10px 16px" }}
			>
				<Box />
				<Box alignItems="center" display="flex" gap="8">
					<Button appearance="subtle" size="sm" onClick={onSkip}>
						Skip
					</Button>
					<button
						type="button"
						onClick={onSubmit}
						disabled={!isValid}
						style={{
							alignItems: "center",
							background: isValid ? "#1A6EF5" : "var(--ax-colors-bg-secondary)",
							border: 0,
							borderRadius: 8,
							color: isValid ? "#fff" : "var(--ax-colors-fg-tertiary)",
							cursor: isValid ? "pointer" : "not-allowed",
							display: "flex",
							height: 32,
							justifyContent: "center",
							transition: "all 0.15s ease",
							width: 32,
						}}
					>
						<IconArrowRight size={15} />
					</button>
				</Box>
			</Box>
		</Box>
	);
}

// ── Analyzing card ────────────────────────────────────────────────────────────

function AnalyzingCard({ currentStep }: { currentStep: number }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="20"
			rounded="xl"
			shadow="sm"
		>
			<Box alignItems="center" display="flex" gap="12">
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{
						animation: "opal-spin 1.5s linear infinite",
						background: "linear-gradient(135deg, #ABFF44 0%, #347300 100%)",
						flexShrink: 0,
						height: 32,
						width: 32,
					}}
				>
					<IconSparkles size={14} style={{ color: "#202320" }} />
				</Box>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="600" style={{ fontSize: 14 }}>
						Opal is analyzing your brand…
					</Text>
					<Text color="fg.tertiary" fontSize="xs">
						This usually takes just a few seconds
					</Text>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" gap="8">
				{ANALYZING_STEPS.map((step, i) => {
					const isDone = i < currentStep;
					const isActive = i === currentStep;
					return (
						<Box key={step} alignItems="center" display="flex" gap="10">
							<Box
								alignItems="center"
								display="flex"
								justifyContent="center"
								rounded="full"
								style={{
									background: isDone
										? "var(--ax-colors-bg-accent)"
										: isActive
										? "var(--ax-colors-bg-accent-subtle)"
										: "var(--ax-colors-bg-secondary)",
									flexShrink: 0,
									height: 20,
									width: 20,
								}}
							>
								{isDone ? (
									<IconCheck size={10} style={{ color: "var(--ax-colors-fg-default-inverse)" }} />
								) : isActive ? (
									<Box
										rounded="full"
										style={{
											animation: "opal-pulse 1s ease-in-out infinite",
											background: "var(--ax-colors-fg-accent)",
											height: 6,
											width: 6,
										}}
									/>
								) : null}
							</Box>
							<Text
								style={{
									color: isDone || isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
									fontSize: 13,
									fontWeight: isActive ? 500 : 400,
								}}
							>
								{step}
							</Text>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BrandPackOpalSetupPage() {
	const router = useRouter();

	const [step, setStep] = useState(0); // 0..Q-1 = questions; URL_STEP_IDX = url; ANALYZING_STEP_IDX = analyzing
	const [answers, setAnswers] = useState<Record<string, Set<OptionId>>>(
		() => Object.fromEntries(QUESTIONS.map((q) => [q.id, new Set()]))
	);
	const [somethingElse, setSomethingElse] = useState<Record<string, string>>(
		() => Object.fromEntries(QUESTIONS.map((q) => [q.id, ""]))
	);
	const [somethingElseChecked, setSomethingElseChecked] = useState<Record<string, boolean>>(
		() => Object.fromEntries(QUESTIONS.map((q) => [q.id, false]))
	);
	const [url, setUrl] = useState("");
	const [analyzingStep, setAnalyzingStep] = useState(0);

	// Chat history — grows as user answers questions
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
		{ role: "user", text: "I want to create a brand" },
		{ role: "opal", text: QUESTIONS[0].opalMessage },
	]);

	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatHistory, step]);

	// Analyzing animation
	useEffect(() => {
		if (step !== ANALYZING_STEP_IDX) return;
		setAnalyzingStep(0);
		const interval = setInterval(() => {
			setAnalyzingStep((prev) => {
				if (prev >= ANALYZING_STEPS.length - 1) {
					clearInterval(interval);
					setTimeout(() => router.push("/opal/brand-packs/coca-cola"), 700);
					return prev;
				}
				return prev + 1;
			});
		}, 950);
		return () => clearInterval(interval);
	}, [step, router]);

	const currentQ = step < QUESTIONS.length ? QUESTIONS[step] : null;
	const currentSelected = currentQ ? answers[currentQ.id] : new Set<OptionId>();
	const currentSomethingElse = currentQ ? somethingElse[currentQ.id] : "";
	const currentSomethingElseChecked = currentQ ? somethingElseChecked[currentQ.id] : false;

	function toggleOption(id: OptionId) {
		if (!currentQ) return;
		setAnswers((prev) => {
			const set = new Set(prev[currentQ.id]);
			if (currentQ.multiSelect) {
				if (set.has(id)) set.delete(id);
				else set.add(id);
			} else {
				set.clear();
				set.add(id);
			}
			return { ...prev, [currentQ.id]: set };
		});
	}

	function buildUserAnswerText(): string {
		if (!currentQ) return "Skipped";
		const labels = Array.from(currentSelected)
			.map((id) => currentQ.options.find((o) => o.id === id)?.label)
			.filter(Boolean);
		const parts = [...labels];
		if (currentSomethingElseChecked && currentSomethingElse.trim()) {
			parts.push(currentSomethingElse.trim());
		} else if (!currentQ.multiSelect && currentSomethingElse.trim() && currentSelected.size === 0) {
			parts.push(currentSomethingElse.trim());
		}
		return parts.length ? parts.join(", ") : "Skipped";
	}

	function advanceStep(skipToUrl?: boolean) {
		const answerText = buildUserAnswerText();
		const nextStep = skipToUrl ? URL_STEP_IDX : step + 1;

		const nextOpalMsg =
			nextStep < QUESTIONS.length
				? QUESTIONS[nextStep].opalMessage
				: nextStep === URL_STEP_IDX
				? "Almost there! What's your brand's website? I'll browse it to extract your visual identity automatically."
				: "";

		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: answerText },
			...(nextOpalMsg ? [{ role: "opal" as const, text: nextOpalMsg }] : []),
		]);
		setStep(nextStep);
	}

	function handleSkip() {
		const nextStep = step + 1;
		const nextOpalMsg =
			nextStep < QUESTIONS.length
				? QUESTIONS[nextStep].opalMessage
				: nextStep === URL_STEP_IDX
				? "No problem — one last thing. Do you have a website I can browse to help build the brand?"
				: "";
		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: "Skipped" },
			...(nextOpalMsg ? [{ role: "opal" as const, text: nextOpalMsg }] : []),
		]);
		setStep(nextStep);
	}

	function handlePrev() {
		if (step === 0) return;
		setStep((prev) => prev - 1);
		// Remove last two chat messages (user answer + opal response)
		setChatHistory((prev) => prev.slice(0, -2));
	}

	function handleDismiss() {
		router.push(BRAND_PACKS_HOME);
	}

	function handleUrlSubmit() {
		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: url },
			{ role: "opal", text: `On it — I'm browsing ${url} now to extract your brand identity.` },
		]);
		setStep(ANALYZING_STEP_IDX);
	}

	function handleUrlSkip() {
		setChatHistory((prev) => [
			...prev,
			{ role: "user", text: "Skipped" },
			{ role: "opal", text: "No problem! Building your brand with the information you've shared…" },
		]);
		setStep(ANALYZING_STEP_IDX);
	}

	// For numbered rows (single-select): clicking a row selects it then auto-advances
	function handleNumberedRowClick(optId: OptionId) {
		if (!currentQ) return;
		setAnswers((prev) => ({
			...prev,
			[currentQ.id]: new Set([optId]),
		}));
		// Brief delay so selection is visible before advance
		setTimeout(() => advanceStep(), 120);
	}

	return (
		<>
			<style>{`
				@keyframes opal-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
				@keyframes opal-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
			`}</style>

			<Box display="flex" flexDirection="column" h="full" overflow="hidden">
				<Box
					style={{ flexShrink: 0, padding: "32px 32px 16px" }}
				>
					<BrandPackPageHeader
						onBack={handleDismiss}
						title="New Brand"
						subtitle="Set up with Opal"
					/>
				</Box>

				{/* Chat area */}
				<Box
					display="flex"
					flexDirection="column"
					style={{ flex: 1, overflowY: "auto", padding: "32px 0 64px" }}
				>
					<Box
						display="flex"
						flexDirection="column"
						gap="20"
						style={{ margin: "0 auto", maxWidth: 660, padding: "0 32px", width: "100%" }}
					>
						{/* Render chat history */}
						{chatHistory.map((msg, i) => (
							msg.role === "user"
								? <UserBubble key={i} text={msg.text} />
								: <OpalBubble key={i} text={msg.text} />
						))}

						{/* Action toolbar under Opal messages (like the real UI) */}
						{step < QUESTIONS.length && (
							<Box style={{ display: "flex", gap: 8, paddingLeft: 0 }}>
								{/* placeholder feedback row — matches the copy/thumbs icons in screenshots */}
							</Box>
						)}

						{/* Active question card */}
						{step < QUESTIONS.length && currentQ && (
							<QuestionCard
								question={currentQ}
								cardStep={step}
								totalCards={TOTAL_CARD_STEPS}
								selected={currentSelected}
								somethingElse={currentSomethingElse}
								somethingElseChecked={currentSomethingElseChecked}
								onToggle={(id) => {
									if (currentQ.multiSelect) {
										toggleOption(id);
									} else {
										handleNumberedRowClick(id);
									}
								}}
								onSomethingElseChange={(v) =>
									setSomethingElse((prev) => ({ ...prev, [currentQ.id]: v }))
								}
								onSomethingElseCheck={() =>
									setSomethingElseChecked((prev) => ({
										...prev,
										[currentQ.id]: !prev[currentQ.id],
									}))
								}
								onPrev={handlePrev}
								onNext={advanceStep}
								onSkip={handleSkip}
								onDismiss={handleDismiss}
							/>
						)}

						{step === URL_STEP_IDX && (
							<UrlCard
								url={url}
								onUrlChange={setUrl}
								onSubmit={handleUrlSubmit}
								onSkip={handleUrlSkip}
								onPrev={handlePrev}
								onDismiss={handleDismiss}
								cardStep={URL_STEP_IDX}
								totalCards={TOTAL_CARD_STEPS}
							/>
						)}

						{step === ANALYZING_STEP_IDX && (
							<AnalyzingCard currentStep={analyzingStep} />
						)}

						<div ref={bottomRef} />
					</Box>
				</Box>
			</Box>
		</>
	);
}
>>>>>>> origin/main
