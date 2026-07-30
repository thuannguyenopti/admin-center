<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconArrowLeft,
	IconCheck,
	IconSparkles,
	IconLink,
	IconTriangleExclamation as IconWarning,
} from "@optimizely/axiom-icons";

type FlowStep = "input" | "validating" | "preview" | "importing" | "done";

const IMPORT_STEPS = [
	"Connecting to Figma…",
	"Reading design library…",
	"Extracting color styles…",
	"Extracting text styles…",
	"Generating templates…",
	"Finalizing brand pack…",
];

const PREVIEW_DATA = {
	name: "Design Library",
	colors: [
		{ hex: "#1A6EF5", name: "Primary Blue" },
		{ hex: "#0D1117", name: "Ink Black" },
		{ hex: "#F5F7FA", name: "Surface Light" },
		{ hex: "#E6ECF5", name: "Border Cool" },
		{ hex: "#22C55E", name: "Success Green" },
		{ hex: "#F59E0B", name: "Warning Amber" },
	],
	fonts: ["Inter", "DM Mono"],
	components: 47,
	styles: 12,
};

function ColorDot({ hex, name }: { hex: string; name: string }) {
	return (
		<Box alignItems="center" display="flex" gap="8">
			<Box
				rounded="full"
				style={{ background: hex, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0, height: 20, width: 20 }}
			/>
			<Box display="flex" flexDirection="column" gap="2">
				<Text fontWeight="500" style={{ fontSize: 12 }}>{name}</Text>
				<Text color="fg.tertiary" style={{ fontSize: 11 }}>{hex}</Text>
			</Box>
		</Box>
	);
}

export default function BrandPackFigmaPage() {
	const router = useRouter();
	const [step, setStep] = useState<FlowStep>("input");
	const [url, setUrl] = useState("");
	const [urlError, setUrlError] = useState("");
	const [importStep, setImportStep] = useState(0);
	const [packName, setPackName] = useState("");

	function isValidFigmaUrl(v: string) {
		return v.includes("figma.com/");
	}

	function handleValidate() {
		if (!url.trim()) {
			setUrlError("Please enter a Figma URL.");
			return;
		}
		if (!isValidFigmaUrl(url)) {
			setUrlError("This doesn't look like a Figma URL. Try sharing a design file or library link.");
			return;
		}
		setUrlError("");
		setStep("validating");

		// Simulate validation
		setTimeout(() => {
			// Extract a name from URL for demo purposes
			setPackName("Design Library");
			setStep("preview");
		}, 1800);
	}

	function handleImport() {
		setStep("importing");
		setImportStep(0);
	}

	useEffect(() => {
		if (step !== "importing") return;
		const interval = setInterval(() => {
			setImportStep((prev) => {
				if (prev >= IMPORT_STEPS.length - 1) {
					clearInterval(interval);
					setTimeout(() => {
						router.push("/opal/brand-packs/aurora-digital");
					}, 600);
					return prev;
				}
				return prev + 1;
			});
		}, 900);
		return () => clearInterval(interval);
	}, [step, router]);

	return (
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
					onClick={() => router.push("/opal/brand-packs")}
				/>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="600" style={{ fontSize: 14 }}>
						New Brand Pack
					</Text>
					<Text color="fg.tertiary" fontSize="xs">
						Import from Figma
					</Text>
				</Box>
			</Box>

			{/* Content */}
			<Box
				display="flex"
				flexDirection="column"
				style={{ flex: 1, overflowY: "auto", padding: "48px 24px" }}
			>
				<Box
					display="flex"
					flexDirection="column"
					gap="32"
					style={{ margin: "0 auto", maxWidth: 560, width: "100%" }}
				>
					{/* Step: URL Input */}
					{(step === "input" || step === "validating") && (
						<>
							{/* Icon + heading */}
							<Box alignItems="center" display="flex" flexDirection="column" gap="16" style={{ textAlign: "center" }}>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="center"
									rounded="xl"
									style={{
										background: "rgba(10, 207, 131, 0.12)",
										height: 64,
										width: 64,
									}}
								>
									<Text fontWeight="700" style={{ color: "#0ACF83", fontSize: 28 }}>F</Text>
								</Box>
								<Box display="flex" flexDirection="column" gap="8">
									<Text fontWeight="700" style={{ fontSize: 24 }}>
										Import from Figma
									</Text>
									<Text color="fg.secondary" fontSize="sm" style={{ maxWidth: 400 }}>
										Paste a link to a Figma design file or library. Opal will extract your color styles, text styles, and component structure.
									</Text>
								</Box>
							</Box>

							{/* URL input card */}
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
								<Box display="flex" flexDirection="column" gap="8">
									<Text fontWeight="600" style={{ fontSize: 14 }}>
										Figma file or library URL
									</Text>
									<Box
										alignItems="center"
										display="flex"
										gap="10"
										style={{
											background: "var(--ax-colors-bg-secondary)",
											border: `1.5px solid ${urlError ? "rgba(220, 38, 38, 0.5)" : "var(--ax-colors-border-default)"}`,
											borderRadius: 10,
											padding: "10px 14px",
											transition: "border-color 0.15s ease",
										}}
									>
										<IconLink size={16} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
										<input
											type="url"
											placeholder="https://figma.com/design/..."
											value={url}
											onChange={(e) => {
												setUrl(e.target.value);
												if (urlError) setUrlError("");
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleValidate();
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
									{urlError && (
										<Box alignItems="center" display="flex" gap="6">
											<IconWarning size={13} style={{ color: "#DC2626" }} />
											<Text style={{ color: "#DC2626", fontSize: 12 }}>{urlError}</Text>
										</Box>
									)}
								</Box>

								<Box display="flex" flexDirection="column" gap="8">
									<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
										How to get the link
									</Text>
									{[
										"Open your Figma file or design library",
										"Click Share in the top-right corner",
										"Copy the link and paste it above",
									].map((tip, i) => (
										<Box key={tip} alignItems="start" display="flex" gap="10">
											<Box
												alignItems="center"
												bg="bg.secondary"
												display="flex"
												justifyContent="center"
												rounded="full"
												style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, height: 20, width: 20, color: "var(--ax-colors-fg-tertiary)" }}
											>
												{i + 1}
											</Box>
											<Text color="fg.secondary" fontSize="sm">{tip}</Text>
										</Box>
									))}
								</Box>

								<Box display="flex" justifyContent="end">
									<Button
										appearance="primary"
										size="sm"
										onClick={handleValidate}
										disabled={step === "validating"}
									>
										{step === "validating" ? "Connecting…" : "Connect Figma"}
									</Button>
								</Box>
							</Box>
						</>
					)}

					{/* Step: Preview */}
					{step === "preview" && (
						<>
							<Box display="flex" flexDirection="column" gap="8" style={{ textAlign: "center", alignItems: "center" }}>
								<Box
									alignItems="center"
									bg="bg.accent.subtle"
									display="flex"
									justifyContent="center"
									rounded="full"
									style={{ height: 56, width: 56 }}
								>
									<IconCheck size={24} style={{ color: "var(--ax-colors-fg-accent)" }} />
								</Box>
								<Box display="flex" flexDirection="column" gap="4">
									<Text fontWeight="700" style={{ fontSize: 22 }}>
										Found your Figma library
									</Text>
									<Text color="fg.secondary" fontSize="sm">
										Review what Opal detected — then import to create your brand pack.
									</Text>
								</Box>
							</Box>

							{/* Preview card */}
							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="20"
								p="24"
								rounded="xl"
								shadow="sm"
							>
								{/* Library name */}
								<Box alignItems="center" display="flex" gap="12">
									<Box
										alignItems="center"
										display="flex"
										justifyContent="center"
										rounded="lg"
										style={{ background: "rgba(10, 207, 131, 0.1)", flexShrink: 0, height: 40, width: 40 }}
									>
										<Text fontWeight="700" style={{ color: "#0ACF83", fontSize: 16 }}>F</Text>
									</Box>
									<Box display="flex" flexDirection="column" gap="2">
										<Text fontWeight="600" style={{ fontSize: 15 }}>{packName}</Text>
										<Text color="fg.tertiary" fontSize="xs">
											{PREVIEW_DATA.components} components · {PREVIEW_DATA.styles} color styles
										</Text>
									</Box>
								</Box>

								<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />

								{/* Colors preview */}
								<Box display="flex" flexDirection="column" gap="12">
									<Text color="fg.secondary" fontWeight="600" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
										Color Styles
									</Text>
									<Box
										display="grid"
										gap="10"
										style={{ gridTemplateColumns: "1fr 1fr" }}
									>
										{PREVIEW_DATA.colors.map((c) => (
											<ColorDot key={c.hex} hex={c.hex} name={c.name} />
										))}
									</Box>
								</Box>

								<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />

								{/* Fonts */}
								<Box display="flex" flexDirection="column" gap="8">
									<Text color="fg.secondary" fontWeight="600" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
										Text Styles
									</Text>
									<Box display="flex" gap="8">
										{PREVIEW_DATA.fonts.map((f) => (
											<Box
												key={f}
												bg="bg.secondary"
												rounded="full"
												style={{ padding: "4px 12px" }}
											>
												<Text fontWeight="500" style={{ fontSize: 13 }}>{f}</Text>
											</Box>
										))}
									</Box>
								</Box>
							</Box>

							{/* Pack name */}
							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="8"
								p="20"
								rounded="xl"
								shadow="sm"
							>
								<Text fontWeight="600" style={{ fontSize: 14 }}>
									Brand pack name
								</Text>
								<input
									value={packName}
									onChange={(e) => setPackName(e.target.value)}
									style={{
										background: "var(--ax-colors-bg-secondary)",
										border: "1.5px solid var(--ax-colors-border-default)",
										borderRadius: 8,
										color: "var(--ax-colors-fg-default)",
										fontFamily: "inherit",
										fontSize: 14,
										outline: "none",
										padding: "8px 12px",
										width: "100%",
									}}
									onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
									onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
								/>
							</Box>

							{/* Actions */}
							<Box alignItems="center" display="flex" gap="12" justifyContent="end">
								<Button appearance="subtle" size="sm" onClick={() => setStep("input")}>
									Use a different file
								</Button>
								<Button
									appearance="primary"
									size="sm"
									icon={<IconSparkles />}
									onClick={handleImport}
								>
									Import & build pack
								</Button>
							</Box>
						</>
					)}

					{/* Step: Importing */}
					{step === "importing" && (
						<>
							<style>{`
								@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
								@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.75); } }
							`}</style>
							<Box alignItems="center" display="flex" flexDirection="column" gap="24" style={{ textAlign: "center" }}>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="center"
									rounded="full"
									style={{
										animation: "spin 1.5s linear infinite",
										background: "linear-gradient(135deg, #0ACF83 0%, #009C5E 100%)",
										height: 64,
										width: 64,
									}}
								>
									<IconSparkles size={24} style={{ color: "#fff" }} />
								</Box>
								<Box display="flex" flexDirection="column" gap="8">
									<Text fontWeight="700" style={{ fontSize: 22 }}>
										Importing from Figma…
									</Text>
									<Text color="fg.secondary" fontSize="sm">
										Building your brand pack from the library
									</Text>
								</Box>
							</Box>

							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="10"
								p="24"
								rounded="xl"
								shadow="sm"
							>
								{IMPORT_STEPS.map((s, i) => {
									const isDone = i < importStep;
									const isActive = i === importStep;
									return (
										<Box key={s} alignItems="center" display="flex" gap="12">
											<Box
												alignItems="center"
												display="flex"
												justifyContent="center"
												rounded="full"
												style={{
													background: isDone
														? "rgba(10, 207, 131, 0.15)"
														: isActive
														? "rgba(10, 207, 131, 0.08)"
														: "var(--ax-colors-bg-secondary)",
													flexShrink: 0,
													height: 24,
													width: 24,
												}}
											>
												{isDone ? (
													<IconCheck size={12} style={{ color: "#0ACF83" }} />
												) : isActive ? (
													<Box
														rounded="full"
														style={{
															animation: "pulse 1s ease-in-out infinite",
															background: "#0ACF83",
															height: 6,
															width: 6,
														}}
													/>
												) : null}
											</Box>
											<Text
												style={{
													color: isDone || isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
													fontSize: 14,
													fontWeight: isActive ? 500 : 400,
												}}
											>
												{s}
											</Text>
										</Box>
									);
								})}
							</Box>
						</>
					)}
				</Box>
			</Box>
		</Box>
	);
}
=======
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconCheck,
	IconSparkles,
	IconLink,
	IconTriangleExclamation as IconWarning,
} from "@optimizely/axiom-icons";
import { BrandPackPageHeader } from "../../components/BrandPackPageHeader";

type FlowStep = "input" | "validating" | "preview" | "importing" | "done";

const IMPORT_STEPS = [
	"Connecting to Figma…",
	"Reading design library…",
	"Extracting color styles…",
	"Extracting text styles…",
	"Generating templates…",
	"Finalizing brand…",
];

const PREVIEW_DATA = {
	name: "Design Library",
	colors: [
		{ hex: "#1A6EF5", name: "Primary Blue" },
		{ hex: "#0D1117", name: "Ink Black" },
		{ hex: "#F5F7FA", name: "Surface Light" },
		{ hex: "#E6ECF5", name: "Border Cool" },
		{ hex: "#22C55E", name: "Success Green" },
		{ hex: "#F59E0B", name: "Warning Amber" },
	],
	fonts: ["Inter", "DM Mono"],
	components: 47,
	styles: 12,
};

const BRAND_PACKS_HOME = "/opal/context?tab=brand";

function ColorDot({ hex, name }: { hex: string; name: string }) {
	return (
		<Box alignItems="center" display="flex" gap="8">
			<Box
				rounded="full"
				style={{ background: hex, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0, height: 20, width: 20 }}
			/>
			<Box display="flex" flexDirection="column" gap="2">
				<Text fontWeight="500" style={{ fontSize: 12 }}>{name}</Text>
				<Text color="fg.tertiary" style={{ fontSize: 11 }}>{hex}</Text>
			</Box>
		</Box>
	);
}

export default function BrandPackFigmaPage() {
	const router = useRouter();
	const [step, setStep] = useState<FlowStep>("input");
	const [url, setUrl] = useState("");
	const [urlError, setUrlError] = useState("");
	const [importStep, setImportStep] = useState(0);
	const [packName, setPackName] = useState("");

	function isValidFigmaUrl(v: string) {
		return v.includes("figma.com/");
	}

	function handleValidate() {
		if (!url.trim()) {
			setUrlError("Please enter a Figma URL.");
			return;
		}
		if (!isValidFigmaUrl(url)) {
			setUrlError("This doesn't look like a Figma URL. Try sharing a design file or library link.");
			return;
		}
		setUrlError("");
		setStep("validating");

		// Simulate validation
		setTimeout(() => {
			// Extract a name from URL for demo purposes
			setPackName("Design Library");
			setStep("preview");
		}, 1800);
	}

	function handleImport() {
		setStep("importing");
		setImportStep(0);
	}

	useEffect(() => {
		if (step !== "importing") return;
		const interval = setInterval(() => {
			setImportStep((prev) => {
				if (prev >= IMPORT_STEPS.length - 1) {
					clearInterval(interval);
					setTimeout(() => {
						router.push("/opal/brand-packs/sprite");
					}, 600);
					return prev;
				}
				return prev + 1;
			});
		}, 900);
		return () => clearInterval(interval);
	}, [step, router]);

	return (
		<Box display="flex" flexDirection="column" h="full" overflow="hidden">
			<Box
				display="flex"
				flexDirection="column"
				style={{ flex: 1, overflowY: "auto", padding: "40px 24px 64px" }}
			>
				<Box style={{ marginBottom: 40 }}>
					<BrandPackPageHeader
						maxWidth={960}
						onBack={() => router.push(BRAND_PACKS_HOME)}
						title="New Brand"
						subtitle="Import from Figma"
					/>
				</Box>

				<Box
					display="flex"
					flexDirection="column"
					gap="32"
					style={{ margin: "0 auto", maxWidth: 560, width: "100%" }}
				>
					{/* Step: URL Input */}
					{(step === "input" || step === "validating") && (
						<>
							{/* Icon + heading */}
							<Box alignItems="center" display="flex" flexDirection="column" gap="16" style={{ textAlign: "center" }}>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="center"
									rounded="xl"
									style={{
										background: "rgba(10, 207, 131, 0.12)",
										height: 64,
										width: 64,
									}}
								>
									<Text fontWeight="700" style={{ color: "#0ACF83", fontSize: 28 }}>F</Text>
								</Box>
								<Box display="flex" flexDirection="column" gap="8">
									<Text fontWeight="700" style={{ fontSize: 24 }}>
										Import from Figma
									</Text>
									<Text color="fg.secondary" fontSize="sm" style={{ maxWidth: 400 }}>
										Paste a link to a Figma design file or library. Opal will extract your color styles, text styles, and component structure.
									</Text>
								</Box>
							</Box>

							{/* URL input card */}
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
								<Box display="flex" flexDirection="column" gap="8">
									<Text fontWeight="600" style={{ fontSize: 14 }}>
										Figma file or library URL
									</Text>
									<Box
										alignItems="center"
										display="flex"
										gap="10"
										style={{
											background: "var(--ax-colors-bg-secondary)",
											border: `1.5px solid ${urlError ? "rgba(220, 38, 38, 0.5)" : "var(--ax-colors-border-default)"}`,
											borderRadius: 10,
											padding: "10px 14px",
											transition: "border-color 0.15s ease",
										}}
									>
										<IconLink size={16} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
										<input
											type="url"
											placeholder="https://figma.com/design/..."
											value={url}
											onChange={(e) => {
												setUrl(e.target.value);
												if (urlError) setUrlError("");
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleValidate();
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
									{urlError && (
										<Box alignItems="center" display="flex" gap="6">
											<IconWarning size={13} style={{ color: "#DC2626" }} />
											<Text style={{ color: "#DC2626", fontSize: 12 }}>{urlError}</Text>
										</Box>
									)}
								</Box>

								<Box display="flex" flexDirection="column" gap="8">
									<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
										How to get the link
									</Text>
									{[
										"Open your Figma file or design library",
										"Click Share in the top-right corner",
										"Copy the link and paste it above",
									].map((tip, i) => (
										<Box key={tip} alignItems="start" display="flex" gap="10">
											<Box
												alignItems="center"
												bg="bg.secondary"
												display="flex"
												justifyContent="center"
												rounded="full"
												style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, height: 20, width: 20, color: "var(--ax-colors-fg-tertiary)" }}
											>
												{i + 1}
											</Box>
											<Text color="fg.secondary" fontSize="sm">{tip}</Text>
										</Box>
									))}
								</Box>

								<Box display="flex" justifyContent="end">
									<Button
										appearance="primary"
										size="sm"
										onClick={handleValidate}
										disabled={step === "validating"}
									>
										{step === "validating" ? "Connecting…" : "Connect Figma"}
									</Button>
								</Box>
							</Box>
						</>
					)}

					{/* Step: Preview */}
					{step === "preview" && (
						<>
							<Box display="flex" flexDirection="column" gap="8" style={{ textAlign: "center", alignItems: "center" }}>
								<Box
									alignItems="center"
									bg="bg.accent.subtle"
									display="flex"
									justifyContent="center"
									rounded="full"
									style={{ height: 56, width: 56 }}
								>
									<IconCheck size={24} style={{ color: "var(--ax-colors-fg-accent-strong)" }} />
								</Box>
								<Box display="flex" flexDirection="column" gap="4">
									<Text fontWeight="700" style={{ fontSize: 22 }}>
										Found your Figma library
									</Text>
									<Text color="fg.secondary" fontSize="sm">
										Review what Opal detected — then import to create your brand.
									</Text>
								</Box>
							</Box>

							{/* Preview card */}
							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="20"
								p="24"
								rounded="xl"
								shadow="sm"
							>
								{/* Library name */}
								<Box alignItems="center" display="flex" gap="12">
									<Box
										alignItems="center"
										display="flex"
										justifyContent="center"
										rounded="lg"
										style={{ background: "rgba(10, 207, 131, 0.1)", flexShrink: 0, height: 40, width: 40 }}
									>
										<Text fontWeight="700" style={{ color: "#0ACF83", fontSize: 16 }}>F</Text>
									</Box>
									<Box display="flex" flexDirection="column" gap="2">
										<Text fontWeight="600" style={{ fontSize: 15 }}>{packName}</Text>
										<Text color="fg.tertiary" fontSize="xs">
											{PREVIEW_DATA.components} components · {PREVIEW_DATA.styles} color styles
										</Text>
									</Box>
								</Box>

								<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />

								{/* Colors preview */}
								<Box display="flex" flexDirection="column" gap="12">
									<Text color="fg.secondary" fontWeight="600" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
										Color Styles
									</Text>
									<Box
										display="grid"
										gap="10"
										style={{ gridTemplateColumns: "1fr 1fr" }}
									>
										{PREVIEW_DATA.colors.map((c) => (
											<ColorDot key={c.hex} hex={c.hex} name={c.name} />
										))}
									</Box>
								</Box>

								<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />

								{/* Fonts */}
								<Box display="flex" flexDirection="column" gap="8">
									<Text color="fg.secondary" fontWeight="600" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
										Text Styles
									</Text>
									<Box display="flex" gap="8">
										{PREVIEW_DATA.fonts.map((f) => (
											<Box
												key={f}
												bg="bg.secondary"
												rounded="full"
												style={{ padding: "4px 12px" }}
											>
												<Text fontWeight="500" style={{ fontSize: 13 }}>{f}</Text>
											</Box>
										))}
									</Box>
								</Box>
							</Box>

							{/* Pack name */}
							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="8"
								p="20"
								rounded="xl"
								shadow="sm"
							>
								<Text fontWeight="600" style={{ fontSize: 14 }}>
									Brand name
								</Text>
								<input
									value={packName}
									onChange={(e) => setPackName(e.target.value)}
									style={{
										background: "var(--ax-colors-bg-secondary)",
										border: "1.5px solid var(--ax-colors-border-default)",
										borderRadius: 8,
										color: "var(--ax-colors-fg-default)",
										fontFamily: "inherit",
										fontSize: 14,
										outline: "none",
										padding: "8px 12px",
										width: "100%",
									}}
									onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
									onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
								/>
							</Box>

							{/* Actions */}
							<Box alignItems="center" display="flex" gap="12" justifyContent="end">
								<Button appearance="subtle" size="sm" onClick={() => setStep("input")}>
									Use a different file
								</Button>
								<Button
									appearance="primary"
									size="sm"
									icon={<IconSparkles />}
									onClick={handleImport}
								>
									Import & build pack
								</Button>
							</Box>
						</>
					)}

					{/* Step: Importing */}
					{step === "importing" && (
						<>
							<style>{`
								@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
								@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.75); } }
							`}</style>
							<Box alignItems="center" display="flex" flexDirection="column" gap="24" style={{ textAlign: "center" }}>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="center"
									rounded="full"
									style={{
										animation: "spin 1.5s linear infinite",
										background: "linear-gradient(135deg, #0ACF83 0%, #009C5E 100%)",
										height: 64,
										width: 64,
									}}
								>
									<IconSparkles size={24} style={{ color: "#fff" }} />
								</Box>
								<Box display="flex" flexDirection="column" gap="8">
									<Text fontWeight="700" style={{ fontSize: 22 }}>
										Importing from Figma…
									</Text>
									<Text color="fg.secondary" fontSize="sm">
										Building your brand from the library
									</Text>
								</Box>
							</Box>

							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="10"
								p="24"
								rounded="xl"
								shadow="sm"
							>
								{IMPORT_STEPS.map((s, i) => {
									const isDone = i < importStep;
									const isActive = i === importStep;
									return (
										<Box key={s} alignItems="center" display="flex" gap="12">
											<Box
												alignItems="center"
												display="flex"
												justifyContent="center"
												rounded="full"
												style={{
													background: isDone
														? "rgba(10, 207, 131, 0.15)"
														: isActive
														? "rgba(10, 207, 131, 0.08)"
														: "var(--ax-colors-bg-secondary)",
													flexShrink: 0,
													height: 24,
													width: 24,
												}}
											>
												{isDone ? (
													<IconCheck size={12} style={{ color: "#0ACF83" }} />
												) : isActive ? (
													<Box
														rounded="full"
														style={{
															animation: "pulse 1s ease-in-out infinite",
															background: "#0ACF83",
															height: 6,
															width: 6,
														}}
													/>
												) : null}
											</Box>
											<Text
												style={{
													color: isDone || isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
													fontSize: 14,
													fontWeight: isActive ? 500 : 400,
												}}
											>
												{s}
											</Text>
										</Box>
									);
								})}
							</Box>
						</>
					)}
				</Box>
			</Box>
		</Box>
	);
}
>>>>>>> origin/main
