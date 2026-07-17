"use client";

import { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Select,
	SelectContent,
	SelectTrigger,
	Text,
} from "@optiaxiom/react";
import { IconArrowRotateLeft, IconCheck, IconPlus, IconSparkles } from "@optiaxiom/icons";
import type { Typeface } from "./TypographyTab";
import styles from "./TypographyTab.module.css";

type ManageTypeSystemDialogProps = {
	fonts: Typeface[];
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
	open: boolean;
};

type TypeRole = {
	description: string;
	key: string;
	label: string;
	optional?: boolean;
};

const TYPE_ROLES: TypeRole[] = [
	{ description: "Large, expressive headlines", key: "display", label: "Display" },
	{ description: "Section and page headings", key: "heading", label: "Heading" },
	{ description: "Paragraphs and body copy", key: "body", label: "Body" },
	{ description: "Code, data, technical text", key: "mono", label: "Mono" },
	{ description: "Buttons, labels, small text", key: "ui", label: "UI" },
	{ description: "Short labels and highlights", key: "accent", label: "Accent", optional: true },
];

const DEFAULT_ASSIGNMENTS: Record<string, string> = {
	accent: "Manrope",
	body: "Inter",
	display: "Overpass",
	heading: "Inter",
	mono: "JetBrains Mono",
	ui: "Inter",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<Text color="fg.success" fontSize="xs" fontWeight="700" style={{ textTransform: "uppercase" }}>
			{children}
		</Text>
	);
}

function fontStack(typeface?: Typeface) {
	if (!typeface) return "Inter, sans-serif";
	if (typeface.category === "Mono") return `"${typeface.family}", monospace`;
	return `"${typeface.family}", Inter, sans-serif`;
}

function fontMeta(typeface?: Typeface) {
	if (!typeface) return "Unassigned";
	if (["Inter", "JetBrains Mono", "Manrope", "Overpass"].includes(typeface.family)) return "Variable";
	return typeface.styles > 1 ? `${typeface.styles} styles` : "Variable";
}

export function ManageTypeSystemDialog({ fonts, onOpenChange, onSave, open }: ManageTypeSystemDialogProps) {
	const [activeRole, setActiveRole] = useState(TYPE_ROLES[0].key);
	const [assignments, setAssignments] = useState(DEFAULT_ASSIGNMENTS);
	const [customRoles, setCustomRoles] = useState<TypeRole[]>([]);
	const roles = [...TYPE_ROLES, ...customRoles];

	const fontOptions = useMemo(
		() => fonts.map((font) => ({ label: font.family, value: font.family })),
		[fonts],
	);
	const selectedFonts = useMemo(
		() => Object.fromEntries(
			Object.entries(assignments).map(([role, family]) => [
				role,
				fonts.find((font) => font.family === family) ?? fonts[0],
			]),
		) as Record<string, Typeface | undefined>,
		[assignments, fonts],
	);
	const activeFont = selectedFonts[activeRole];
	const displayFont = selectedFonts.display;
	const headingFont = selectedFonts.heading;
	const bodyFont = selectedFonts.body;
	const monoFont = selectedFonts.mono;

	const resetAssignments = () => {
		setAssignments(DEFAULT_ASSIGNMENTS);
		setCustomRoles([]);
		setActiveRole(TYPE_ROLES[0].key);
	};

	const addCustomRole = () => {
		const key = `custom-${customRoles.length + 1}`;
		const nextRole = {
			description: "Captions, legal lines, and utility copy",
			key,
			label: customRoles.length === 0 ? "Caption" : `Custom ${customRoles.length + 1}`,
			optional: true,
		};

		setCustomRoles((current) => [...current, nextRole]);
		setAssignments((current) => ({ ...current, [key]: "Inter" }));
		setActiveRole(key);
	};

	const saveChanges = () => {
		onSave();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				style={{
					bottom: "auto",
					height: "min(980px, calc(100vh - 48px))",
					maxHeight: "calc(100vh - 48px)",
					maxWidth: 1152,
					top: "50%",
					translate: "-50% -50%",
					width: "min(92vw, 1152px)",
				}}
			>
				<DialogHeader description="Define the roles in your brand's typography hierarchy and assign the best typefaces for each purpose.">
					Manage type system
				</DialogHeader>

				<DialogBody className={styles.manageTypeBody}>
					<Box
						className={styles.manageTypeGrid}
						display="grid"
						gap="32"
						style={{ gridTemplateColumns: "var(--manage-type-grid-columns, minmax(0, 526px) minmax(420px, 1fr))" }}
					>
						<Box display="flex" flexDirection="column" gap="16">
							<SectionLabel>Type system roles</SectionLabel>
							<Box display="flex" flexDirection="column" gap="8">
								{roles.map((role) => {
									const selected = role.key === activeRole;
									const typeface = selectedFonts[role.key];
									return (
										<Box
											key={role.key}
											alignItems="center"
											aria-label={`${role.label} role`}
											bg={selected ? "bg.success.subtle" : "bg.default"}
											border="1"
											borderColor={selected ? "border.success" : "border.tertiary"}
											className={
												selected
													? `${styles.typeRoleRow} ${styles.typeRoleRowSelected}`
													: styles.typeRoleRow
											}
											display="grid"
											gap="16"
											rounded="md"
											onClick={() => setActiveRole(role.key)}
											onKeyDown={(event) => {
												if (event.key === "Enter" || event.key === " ") {
													event.preventDefault();
													setActiveRole(role.key);
												}
											}}
											role="button"
											style={{
												gridTemplateColumns: "var(--type-role-row-columns, 40px minmax(0, 1fr) 176px)",
												minHeight: 90,
												padding: "var(--type-role-row-padding, 14px 16px)",
											}}
											tabIndex={0}
										>
											<Box alignItems="center" bg="bg.success.subtle" display="flex" justifyContent="center" rounded="md" style={{ height: 40, width: 40 }}>
												<Text fontWeight="700" style={{ fontSize: 24, lineHeight: 1 }}>T</Text>
											</Box>
											<Box display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
												<Text fontWeight="700">
													{role.label}
													{role.optional && (
														<span style={{ color: "var(--ax-colors-fg-secondary)", fontWeight: 400 }}> (Optional)</span>
													)}
												</Text>
												<Text color="fg.secondary" fontSize="sm">{role.description}</Text>
											</Box>
											<Box onClick={(event) => event.stopPropagation()}>
												<Select
													options={fontOptions}
													value={typeface?.family ?? fonts[0]?.family}
													onValueChange={(family) => {
														setAssignments((current) => ({ ...current, [role.key]: family }));
														setActiveRole(role.key);
													}}
												>
													<SelectTrigger style={{ width: "100%" }} />
													<SelectContent />
												</Select>
												<Text color="fg.secondary" fontSize="xs" mt="4">{fontMeta(typeface)}</Text>
											</Box>
										</Box>
									);
								})}
							</Box>
							<Button appearance="subtle" className={styles.addCustomRoleButton} icon={<IconPlus />} onClick={addCustomRole} size="md">
								Add custom role
							</Button>
						</Box>

						<Box
							className={styles.manageTypeRightRail}
							display="flex"
							flexDirection="column"
							gap="32"
							style={{
								borderLeft: "var(--manage-type-rail-border-left, 1px solid var(--ax-colors-border-tertiary))",
								borderTop: "var(--manage-type-rail-border-top, 0)",
								paddingLeft: "var(--manage-type-rail-padding-left, 32px)",
								paddingTop: "var(--manage-type-rail-padding-top, 0)",
							}}
						>
							<Box display="flex" flexDirection="column" gap="16">
								<SectionLabel>Role preview</SectionLabel>
								<Box
									className={styles.rolePreviewCard}
									style={{
										border: "1px solid var(--ax-colors-border-tertiary)",
										borderRadius: "var(--ax-borderRadius-lg)",
										display: "flex",
										flexDirection: "column",
										gap: 16,
										padding: 20,
									}}
								>
									<Text color="fg.success" fontSize="xs" fontWeight="700">
										{roles.find((role) => role.key === activeRole)?.label.toUpperCase()} · {activeFont?.family.toUpperCase()}
									</Text>
									<Text
										className={styles.rolePreviewDisplay}
										style={{
											fontFamily: fontStack(displayFont),
											fontSize: 34,
											fontWeight: displayFont?.weight ?? 800,
											letterSpacing: 0,
											lineHeight: 1.08,
											maxWidth: 420,
										}}
									>
										The quick brown fox jumps over the lazy dog.
									</Text>
									<Box style={{ background: "var(--ax-colors-border-tertiary)", height: 1 }} />
									<Box
										className={styles.rolePreviewSamples}
										display="grid"
										gap="24"
										style={{ gridTemplateColumns: "var(--role-preview-samples-columns, minmax(0, 1fr) minmax(0, 1fr))" }}
									>
										<Box display="flex" flexDirection="column" gap="10">
											<Text color="fg.success" fontSize="xs" fontWeight="700">HEADING · {headingFont?.family.toUpperCase()}</Text>
											<Text style={{ fontFamily: fontStack(headingFont), fontSize: 19, fontWeight: headingFont?.weight ?? 700, lineHeight: 1.25 }}>
												The quick brown fox jumps over the lazy dog.
											</Text>
										</Box>
										<Box display="flex" flexDirection="column" gap="10">
											<Text color="fg.secondary" fontSize="xs" fontWeight="700">BODY · {bodyFont?.family.toUpperCase()}</Text>
											<Text style={{ fontFamily: fontStack(bodyFont), fontSize: 14, lineHeight: 1.55 }}>
												The quick brown fox jumps over the lazy dog. A quick movement of the zebra finches baffled the watching zoo keepers.
											</Text>
										</Box>
									</Box>
									<Box display="flex" flexDirection="column" gap="10">
										<Text color="fg.secondary" fontSize="xs" fontWeight="700">MONO · {monoFont?.family.toUpperCase()}</Text>
										<Box bg="bg.secondary" rounded="md" style={{ padding: "6px 10px", width: "fit-content" }}>
											<Text style={{ fontFamily: fontStack(monoFont), fontSize: 13 }}>
												const brand = 'Stride';
											</Text>
										</Box>
									</Box>
								</Box>
							</Box>

							<Box
								className={styles.aiGuidanceCard}
								display="flex"
								flexDirection="column"
								gap="10"
								style={{
									background: "var(--ax-colors-bg-secondary)",
									borderRadius: "var(--ax-borderRadius-lg)",
									padding: 16,
								}}
							>
								<Box alignItems="center" display="flex" gap="8">
									<IconSparkles size={15} style={{ color: "var(--ax-colors-fg-success)" }} />
									<Text color="fg.success" fontSize="xs" fontWeight="700">AI USAGE GUIDANCE</Text>
								</Box>
								<Text fontSize="sm" style={{ lineHeight: 1.5 }}>
									These typefaces work together to create clarity, hierarchy, and consistency across all brand touchpoints.
								</Text>
								{["Built for digital-first experiences", "Optimised for readability and performance", "Balanced personality and clarity"].map((item) => (
									<Box key={item} alignItems="center" display="flex" gap="10">
										<Box alignItems="center" bg="bg.success" color="fg.black" display="flex" justifyContent="center" rounded="full" style={{ height: 16, width: 16 }}>
											<IconCheck size={10} />
										</Box>
										<Text fontSize="sm">{item}</Text>
									</Box>
								))}
							</Box>
						</Box>
					</Box>
				</DialogBody>

				<DialogFooter className={styles.manageTypeFooter}>
					<Button appearance="default" icon={<IconArrowRotateLeft />} onClick={resetAssignments} size="md">
						Reset to defaults
					</Button>
					<Box alignItems="center" className={styles.manageTypeFooterActions} display="flex" gap="12">
						<DialogClose appearance="default" size="md" style={{ minWidth: 84 }}>Cancel</DialogClose>
						<Button appearance="primary" onClick={saveChanges} size="md" style={{ minWidth: 128 }}>
							Save changes
						</Button>
					</Box>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
