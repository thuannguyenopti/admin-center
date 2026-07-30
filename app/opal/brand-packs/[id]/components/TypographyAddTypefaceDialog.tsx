"use client";

import { type ChangeEvent, useRef, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	SearchInput,
	Select,
	SelectContent,
	SelectTrigger,
	Text,
} from "@optiaxiom/react";
import { Range } from "@optiaxiom/react/unstable";
import { IconCheck, IconChevronDown, IconFolder, IconUpload } from "@optiaxiom/icons";
import styles from "./TypographyTab.module.css";

type AddTypefaceDialogProps = {
	onOpenChange: (open: boolean) => void;
	open: boolean;
};

type TypefaceSource = "adobe" | "google" | "upload" | "library";

type TypefaceResult = {
	designer: string;
	family: string;
	foundry: string;
	license: string;
	meta: string;
	styles: number;
	variable: boolean;
};

const SOURCE_OPTIONS: Array<{
	description: string;
	icon: React.ReactNode;
	label: string;
	value: TypefaceSource;
}> = [
	{
		description: "Browse thousands of fonts",
		icon: <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>A</span>,
		label: "Adobe Fonts",
		value: "adobe",
	},
	{
		description: "Open source web fonts",
		icon: <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>G</span>,
		label: "Google Fonts",
		value: "google",
	},
	{
		description: "TTF, OTF, or variable font",
		icon: <IconUpload size={22} />,
		label: "Upload file",
		value: "upload",
	},
	{
		description: "From your team library",
		icon: <IconFolder size={22} />,
		label: "Existing library",
		value: "library",
	},
];

const SOURCE_RESULTS: Record<Exclude<TypefaceSource, "upload">, TypefaceResult[]> = {
	adobe: [
		{
			designer: "Mark Simonson",
			family: "Proxima Nova",
			foundry: "Mark Simonson Studio",
			license: "Adobe Fonts license",
			meta: "Adobe Fonts · 48 styles",
			styles: 48,
			variable: false,
		},
		{
			designer: "Robert Slimbach",
			family: "Acumin Pro",
			foundry: "Adobe Originals",
			license: "Adobe Fonts license",
			meta: "Adobe Originals · 90 styles",
			styles: 90,
			variable: false,
		},
		{
			designer: "Paul D. Hunt",
			family: "Source Sans 3",
			foundry: "Adobe Originals",
			license: "Adobe Fonts license",
			meta: "Adobe Originals · Variable",
			styles: 18,
			variable: true,
		},
		{
			designer: "Jos Buivenga",
			family: "Museo Sans",
			foundry: "exljbris",
			license: "Adobe Fonts license",
			meta: "exljbris · 10 styles",
			styles: 10,
			variable: false,
		},
		{
			designer: "Adobe Type",
			family: "Minion 3",
			foundry: "Adobe Originals",
			license: "Adobe Fonts license",
			meta: "Adobe Originals · 64 styles",
			styles: 64,
			variable: false,
		},
	],
	google: [
		{
			designer: "Rasmus Andersson",
			family: "Inter",
			foundry: "Inter Project",
			license: "Open Font License (OFL)",
			meta: "Rasmus Andersson · Variable",
			styles: 14,
			variable: true,
		},
		{
			designer: "Rasmus Andersson",
			family: "Inter Tight",
			foundry: "Inter Project",
			license: "Open Font License (OFL)",
			meta: "Rasmus Andersson · Variable",
			styles: 12,
			variable: true,
		},
		{
			designer: "Google",
			family: "Roboto Flex",
			foundry: "Google Fonts",
			license: "Apache License 2.0",
			meta: "Google Fonts · Variable",
			styles: 12,
			variable: true,
		},
		{
			designer: "Tokotype",
			family: "Plus Jakarta Sans",
			foundry: "Tokotype",
			license: "Open Font License (OFL)",
			meta: "Tokotype · 18 styles",
			styles: 18,
			variable: true,
		},
		{
			designer: "Mikhail Sharanda",
			family: "Manrope",
			foundry: "Manrope Project",
			license: "Open Font License (OFL)",
			meta: "Mikhail Sharanda · 7 styles",
			styles: 7,
			variable: true,
		},
	],
	library: [
		{
			designer: "Brand team",
			family: "Custom Sans",
			foundry: "Team library",
			license: "Approved enterprise license",
			meta: "Approved · Product UI",
			styles: 12,
			variable: true,
		},
		{
			designer: "Rasmus Andersson",
			family: "Inter",
			foundry: "Team library",
			license: "Open Font License (OFL)",
			meta: "Approved · Documentation",
			styles: 14,
			variable: true,
		},
		{
			designer: "Commercial vendor",
			family: "GT America",
			foundry: "Team library",
			license: "Brand campaign license",
			meta: "Approved · Marketing",
			styles: 22,
			variable: false,
		},
		{
			designer: "Indian Type Foundry",
			family: "Satoshi",
			foundry: "Team library",
			license: "Commercial library license",
			meta: "Approved · Social",
			styles: 20,
			variable: false,
		},
	],
};

const SOURCE_META: Record<TypefaceSource, {
	badge: string;
	selectLabel: string;
	searchLabel: string;
	searchPlaceholder: string;
}> = {
	adobe: {
		badge: "Creative Cloud connected",
		searchLabel: "Search Adobe Fonts",
		searchPlaceholder: "Search Adobe families, designers, foundries...",
		selectLabel: "Select Adobe typeface",
	},
	google: {
		badge: "Open source catalog",
		searchLabel: "Search Google Fonts",
		searchPlaceholder: "Search Google fonts, designers, foundries...",
		selectLabel: "Select Google typeface",
	},
	library: {
		badge: "Team-approved fonts",
		searchLabel: "Search existing library",
		searchPlaceholder: "Search approved brand and team fonts...",
		selectLabel: "Select library typeface",
	},
	upload: {
		badge: "License review required",
		searchLabel: "Upload font file",
		searchPlaceholder: "Uploaded font metadata appears here",
		selectLabel: "Imported typeface",
	},
};

const UPLOAD_EMPTY_TYPEFACE: TypefaceResult = {
	designer: "Detected from file",
	family: "Uploaded font",
	foundry: "Local upload",
	license: "Confirm license before publishing",
	meta: "TTF, OTF, WOFF, or WOFF2",
	styles: 1,
	variable: false,
};

const ROLE_OPTIONS = [
	{ label: "Select a role", value: "none" },
	{ label: "Primary", value: "primary" },
	{ label: "Secondary", value: "secondary" },
	{ label: "Mono", value: "mono" },
	{ label: "Display", value: "display" },
];

function sourceIconBg(source: TypefaceSource): "bg.default.inverse" | undefined {
	return source === "adobe" ? "bg.default.inverse" : undefined;
}

function sourceIconColor(source: TypefaceSource): "fg.default.inverse" | "fg.information" | "fg.default" {
	if (source === "adobe") return "fg.default.inverse";
	if (source === "google") return "fg.information";
	return "fg.default";
}

function sourceIconSize(source: TypefaceSource) {
	return source === "adobe" ? 40 : 36;
}

function familyFromFileName(fileName: string) {
	const baseName = fileName.replace(/\.(ttf|otf|woff2?|ttc)$/i, "");
	return baseName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "Uploaded font";
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<Text color="fg.secondary" fontSize="xs" fontWeight="700" style={{ textTransform: "uppercase" }}>
			{children}
		</Text>
	);
}

export function AddTypefaceDialog({ onOpenChange, open }: AddTypefaceDialogProps) {
	const [selectedSource, setSelectedSource] = useState<TypefaceSource>("adobe");
	const [selectedTypeface, setSelectedTypeface] = useState(SOURCE_RESULTS.adobe[0]);
	const [uploadedFileName, setUploadedFileName] = useState("");
	const [weight, setWeight] = useState(400);
	const [role, setRole] = useState("none");
	const [usedFor, setUsedFor] = useState(["Product UI", "Marketing"]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const toggleUsedFor = (label: string) => {
		setUsedFor((prev) =>
			prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
		);
	};

	const uploadedTypeface: TypefaceResult = uploadedFileName
		? {
			designer: "Detected from file",
			family: familyFromFileName(uploadedFileName),
			foundry: "Local upload",
			license: "Confirm license before publishing",
			meta: `${uploadedFileName} · Pending review`,
			styles: 1,
			variable: /variable|var|vf/i.test(uploadedFileName),
		}
		: UPLOAD_EMPTY_TYPEFACE;
	const sourceResults = selectedSource === "upload" ? (uploadedFileName ? [uploadedTypeface] : []) : SOURCE_RESULTS[selectedSource];
	const activeTypeface = selectedSource === "upload" ? uploadedTypeface : selectedTypeface;
	const previewFont = `"${activeTypeface.family}", Inter, sans-serif`;
	const sourceMeta = SOURCE_META[selectedSource];

	const selectSource = (source: TypefaceSource) => {
		setSelectedSource(source);
		if (source !== "upload") {
			setSelectedTypeface(SOURCE_RESULTS[source][0]);
		}
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setUploadedFileName(file.name);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				style={{
					bottom: "auto",
					height: "min(954px, calc(100vh - 70px))",
					maxHeight: "calc(100vh - 70px)",
					maxWidth: 960,
					top: "50%",
					translate: "-50% -50%",
					width: "min(92vw, 960px)",
				}}
			>
				<DialogHeader description="Add a new typeface to your brand pack.">
					Add typeface
				</DialogHeader>

				<DialogBody className={styles.addTypefaceBody}>
					<Box
						className={styles.addTypefaceGrid}
						display="grid"
						gap="32"
					>
						<Box display="flex" flexDirection="column" gap="24">
							<Box display="flex" flexDirection="column" gap="12">
								<SectionLabel>Source</SectionLabel>
								<Box
									className={styles.sourceGrid}
									display="grid"
									gap="10"
								>
									{SOURCE_OPTIONS.map((source) => {
										const selected = source.value === selectedSource;
										return (
											<Box
												key={source.value}
												alignItems="center"
												className={
													selected
														? `${styles.sourceButton} ${styles.sourceButtonSelected}`
														: styles.sourceButton
												}
												display="flex"
												justifyContent="center"
												aria-label={`${source.label} source`}
												onClick={() => selectSource(source.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														selectSource(source.value);
													}
												}}
												role="button"
												tabIndex={0}
											>
												<Box alignItems="center" display="flex" flexDirection="column" gap="8" style={{ minWidth: 0 }}>
														<Box
															alignItems="center"
															bg={sourceIconBg(source.value)}
															color={sourceIconColor(source.value)}
															display="flex"
															justifyContent="center"
															rounded="md"
															style={{
																flexShrink: 0,
																height: sourceIconSize(source.value),
																width: sourceIconSize(source.value),
															}}
														>
														{source.icon}
													</Box>
													<Text fontWeight="700" fontSize="sm">{source.label}</Text>
													<Text
														color="fg.secondary"
														fontSize="xs"
														style={{ lineHeight: 1.4, textAlign: "center" }}
													>
														{source.description}
													</Text>
												</Box>
											</Box>
										);
									})}
								</Box>
								<Box alignItems="center" className={styles.sourceStatus} display="flex" gap="8">
									<Badge intent={selectedSource === "upload" ? "neutral" : "success"} variant="subtle">
										{sourceMeta.badge}
									</Badge>
									<Text color="fg.secondary" fontSize="xs">
										{selectedSource === "upload" ? "Local font import" : "Catalog results"}
									</Text>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="12">
								<SectionLabel>{sourceMeta.searchLabel}</SectionLabel>
								{selectedSource === "upload" ? (
									<Box className={styles.uploadPanel} display="flex" flexDirection="column" gap="12">
										<input
											ref={fileInputRef}
											accept=".ttf,.otf,.woff,.woff2"
											aria-label="Choose font file"
											onChange={handleFileChange}
											style={{ display: "none" }}
											type="file"
										/>
										<Box alignItems="center" display="flex" justifyContent="space-between" gap="16">
											<Box display="flex" flexDirection="column" gap="4">
												<Text fontWeight="600" fontSize="sm">
													{uploadedFileName || "No font file selected"}
												</Text>
												<Text color="fg.secondary" fontSize="xs">
													TTF, OTF, WOFF, or WOFF2
												</Text>
											</Box>
											<Button appearance="default" icon={<IconUpload />} onClick={() => fileInputRef.current?.click()} size="sm">
												Choose file
											</Button>
										</Box>
									</Box>
								) : (
									<SearchInput
										aria-label={sourceMeta.searchLabel}
										placeholder={sourceMeta.searchPlaceholder}
									/>
								)}
							</Box>

							<Box display="flex" flexDirection="column" gap="12">
								<SectionLabel>{sourceMeta.selectLabel}</SectionLabel>
								<Box
									border="1"
									borderColor="border.tertiary"
									display="flex"
									flexDirection="column"
									overflow="hidden"
									rounded="lg"
								>
									{sourceResults.length === 0 && (
										<Box className={styles.typefaceEmptyState} display="flex" flexDirection="column" gap="8" p="16">
											<Text fontWeight="600" fontSize="sm">Upload a file to continue</Text>
											<Text color="fg.secondary" fontSize="xs">
												Waiting for a TTF, OTF, WOFF, or WOFF2 file.
											</Text>
										</Box>
									)}
									{sourceResults.map((tf) => {
										const selected = tf.family === activeTypeface.family;
										return (
											<Box
												key={tf.family}
												alignItems="center"
												className={
													selected
														? `${styles.typefaceResult} ${styles.typefaceResultSelected}`
														: styles.typefaceResult
												}
												display="flex"
												justifyContent="space-between"
												onClick={() => setSelectedTypeface(tf)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														setSelectedTypeface(tf);
													}
												}}
												p="16"
												role="button"
												tabIndex={0}
											>
												<Box display="flex" flexDirection="column" gap="2">
													<Text fontWeight="600" fontSize="sm">{tf.family}</Text>
													<Text color="fg.secondary" fontSize="xs">{tf.meta}</Text>
												</Box>
												{selected && (
													<Box
														alignItems="center"
														bg="bg.success"
														color="fg.black"
														display="flex"
														justifyContent="center"
														rounded="full"
														style={{ flexShrink: 0, height: 20, width: 20 }}
													>
														<IconCheck size={11} />
													</Box>
												)}
											</Box>
										);
									})}

									{selectedSource !== "upload" && (
										<Box
											borderT="1"
											borderColor="border.tertiary"
											display="flex"
											justifyContent="center"
											p="8"
										>
											<Button
												appearance="subtle"
												icon={<IconChevronDown size={16} />}
												iconPosition="end"
												size="sm"
											>
												Show more results
											</Button>
										</Box>
									)}
								</Box>
							</Box>
						</Box>

						<Box
							className={styles.addTypefaceRightRail}
							display="flex"
							flexDirection="column"
							gap="24"
						>
							<Box display="flex" flexDirection="column" gap="12">
								<SectionLabel>Preview</SectionLabel>
								<Box className={styles.typefaceDialogPreview}>
									<Box
										alignItems="center"
										display="grid"
										gap="16"
										className={styles.dialogSpecimenRow}
									>
										<Text
											className={styles.dialogAg}
											style={{ fontFamily: previewFont, fontWeight: weight }}
										>
											Ag
										</Text>
										<Text
											className={styles.dialogPangram}
											style={{ fontFamily: previewFont, fontWeight: weight }}
										>
											The quick brown fox jumps over the lazy dog.
										</Text>
									</Box>

									<Box display="flex" flexDirection="column" gap="8">
										<Box alignItems="center" display="flex" gap="8">
											<Text color="fg.secondary" fontSize="sm">Weight</Text>
											<Text color="fg.success" fontSize="sm" fontWeight="700">
												{weight}
											</Text>
										</Box>
										<Range
											aria-label="Preview font weight"
											className={styles.weightSlider}
											marks={[
												{ label: "100", value: 100 },
												{ label: "900", value: 900 },
											]}
											max={900}
											min={100}
											onValueChange={setWeight}
											step={100}
											suppressHydrationWarning
											value={weight}
										/>
									</Box>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="12">
								<SectionLabel>Typeface details</SectionLabel>
								<Box
									display="grid"
									style={{
										gap: "12px 24px",
										gridTemplateColumns: "minmax(80px, auto) minmax(0, 1fr)",
									}}
								>
									<Text color="fg.secondary" fontSize="sm">Designer</Text>
									<Text fontSize="sm">{activeTypeface.designer}</Text>

									<Text color="fg.secondary" fontSize="sm">Foundry</Text>
									<Text fontSize="sm">{activeTypeface.foundry}</Text>

									<Text color="fg.secondary" fontSize="sm">Styles</Text>
									<Text fontSize="sm">{activeTypeface.styles} styles</Text>

									<Text color="fg.secondary" fontSize="sm">Variable</Text>
									<Badge
										intent={activeTypeface.variable ? "success" : "neutral"}
										variant="subtle"
										style={{ width: "fit-content" }}
									>
										{activeTypeface.variable ? "Yes" : "No"}
									</Badge>

									<Text color="fg.secondary" fontSize="sm">License</Text>
									<Text fontSize="sm">{activeTypeface.license}</Text>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="10">
								<SectionLabel>Assign to role (optional)</SectionLabel>
								<Box style={{ width: "100%" }}>
									<Select options={ROLE_OPTIONS} value={role} onValueChange={setRole}>
										<SelectTrigger style={{ width: "100%" }} />
										<SelectContent />
									</Select>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="12">
								<SectionLabel>Used for (optional)</SectionLabel>
								<Box
									className={styles.usedForGrid}
									display="grid"
									gap="12"
								>
									{["Product UI", "Documentation", "Marketing", "Ads", "Emails", "Other"].map(
										(label) => (
											<Checkbox
												key={label}
												checked={usedFor.includes(label)}
												onCheckedChange={() => toggleUsedFor(label)}
											>
												{label}
											</Checkbox>
										),
									)}
								</Box>
							</Box>
						</Box>
					</Box>
				</DialogBody>

				<DialogFooter className={styles.addTypefaceFooter}>
					<DialogClose appearance="default" size="md" style={{ minWidth: 88 }}>Cancel</DialogClose>
					<Button
						appearance="primary"
						disabled={selectedSource === "upload" && !uploadedFileName}
						onClick={() => onOpenChange(false)}
						size="md"
						style={{ minWidth: 144 }}
					>
						Add typeface
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
