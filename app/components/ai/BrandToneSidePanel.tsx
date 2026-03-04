"use client";

import React, {useState, useEffect, useCallback} from "react";
import {
	Box,
	Text,
	Heading,
	Badge,
	Button,
	Checkbox,
	Spinner,
	Skeleton,
	Card,
	Disclosure,
	DisclosureTrigger,
	DisclosureContent,
} from "@optiaxiom/react";
import {IconCheck, IconAlertCircle, IconSparkles, IconX} from "@tabler/icons-react";
import usePersistentState from "@/app/usePersistentState";

export interface BrandToneIssue {
	fieldId?: string;
	fieldLabel?: string;
	type: "tone" | "voice" | "clarity" | "style";
	severity: "high" | "medium" | "low";
	message: string;
	original: string;
	suggestion: string;
}

export interface BrandToneResult {
	score: number;
	issues: BrandToneIssue[];
	summary: string;
	strengths: string[];
}

interface BrandToneSidePanelProps {
	result: BrandToneResult | null;
	isLoading: boolean;
	onClose: () => void;
	onApply?: (suggestion: string, fieldId?: string) => void;
	onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void;
	onSelectField?: (fieldId: string) => void;
}

export const BrandToneSidePanel: React.FC<BrandToneSidePanelProps> = ({
	result,
	isLoading,
	onClose,
	onApply,
	onApplyAll,
	onSelectField,
}) => {
	const [panelWidth, setPanelWidth] = usePersistentState("brandTonePanelWidth", 384);
	const [isResizing, setIsResizing] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const hasFieldLevelIssues = result?.issues.some((issue) => issue.fieldId);
	const canApplyAll = hasFieldLevelIssues && onApplyAll && result && result.issues.length > 0;

	// Checkbox state - default all to checked
	const [checkedIssues, setCheckedIssues] = useState<Set<number>>(new Set());

	// Initialize all checkboxes as checked when result changes
	useEffect(() => {
		if (result?.issues) {
			setCheckedIssues(new Set(result.issues.map((_, index) => index)));
		}
	}, [result]);

	const getScoreColor = (score: number) => {
		if (score >= 80) return "#10b981";
		if (score >= 60) return "#f59e0b";
		return "#ef4444";
	};

	const getSeverityIntent = (severity: string) => {
		switch (severity) {
			case "high":
				return "danger";
			case "medium":
				return "warning";
			case "low":
				return "information";
			default:
				return "neutral";
		}
	};

	const getSeverityOrder = (severity: string) => {
		switch (severity) {
			case "high":
				return 0;
			case "medium":
				return 1;
			case "low":
				return 2;
			default:
				return 3;
		}
	};

	// Sort issues by severity (most severe first)
	const sortedIssues = result?.issues ? [...result.issues].sort((a, b) => {
		return getSeverityOrder(a.severity) - getSeverityOrder(b.severity);
	}) : [];

	// Resize handlers
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
	}, []);

	useEffect(() => {
		if (!isResizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			const newWidth = window.innerWidth - e.clientX;
			// Constrain width between 320-480px
			const constrainedWidth = Math.min(Math.max(newWidth, 320), 480);
			setPanelWidth(constrainedWidth);
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, setPanelWidth]);

	const handleIssueCardClick = useCallback((fieldId?: string) => {
		console.log("[BrandToneSidePanel] Issue card clicked:", {
			fieldId,
			hasOnSelectField: !!onSelectField,
		});

		if (fieldId && onSelectField) {
			console.log("[BrandToneSidePanel] Calling onSelectField with:", fieldId);
			onSelectField(fieldId);
		} else {
			console.log("[BrandToneSidePanel] Not calling onSelectField:", {
				hasFieldId: !!fieldId,
				hasOnSelectField: !!onSelectField,
			});
		}
	}, [onSelectField]);

	return (
		<Box
			borderL="1"
			borderColor="border.tertiary"
			bg="bg.default"
			h="full"
			display="flex"
			flexDirection="column"
			style={{
				width: isMobile ? "100vw" : `${panelWidth}px`,
				minWidth: isMobile ? "100vw" : `${panelWidth}px`,
				position: isMobile ? "fixed" : "relative",
				top: isMobile ? 0 : undefined,
				left: isMobile ? 0 : undefined,
				zIndex: isMobile ? 1000 : undefined,
			}}
		>
			{/* Resize Handle - hidden on mobile */}
			{!isMobile && (
				<Box
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						bottom: 0,
						width: "4px",
						cursor: "ew-resize",
						zIndex: 100,
					}}
					onMouseDown={handleMouseDown}
				>
					<Box
						style={{
							position: "absolute",
							left: "1px",
							top: 0,
							bottom: 0,
							width: "2px",
							backgroundColor: isResizing ? "var(--ax-colors-border-accent)" : "transparent",
							transition: "background-color 0.2s",
						}}
						_hover={{
							backgroundColor: "var(--ax-colors-border-accent)",
						}}
					/>
				</Box>
			)}

			{/* Header */}
			<Box
				p="16"
				borderB="1"
				borderColor="border.tertiary"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				flexShrink={0}
			>
				<Box display="flex" alignItems="center" gap="8">
					{result && (
						<Badge
							variant="subtle"
							intent={
								result.score >= 80
									? "success"
									: result.score >= 60
									? "warning"
									: "danger"
							}
						>
							{result.score}
						</Badge>
					)}
					<Box display="flex" alignItems="center" gap="8">
						<IconSparkles size={20} />
						<Text fontWeight="600">Brand Tone Analysis</Text>
					</Box>
				</Box>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconX size={16} />}
					onClick={onClose}
					aria-label="Close"
				/>
			</Box>

			{/* Body (scrollable) */}
			<Box flex="1" overflow="auto" p="16">
				{isLoading && (
					<Box display="flex" flexDirection="column" gap="16">
						<Box display="flex" alignItems="center" justifyContent="center" gap="12" py="24">
							<Spinner />
							<Text color="fg.secondary">Analyzing brand tone...</Text>
						</Box>
						<Skeleton h="80" rounded="md" />
						<Skeleton h="64" rounded="md" />
						<Skeleton h="224" rounded="md" />
					</Box>
				)}

				{!isLoading && result && (
					<Box display="flex" flexDirection="column" gap="24">
						{/* Score Summary */}
						<Card
							display="flex"
							flexDirection="row"
							alignItems="start"
							gap="16"
							p="16"
							bg="bg.secondary"
						>
							<Box
								style={{
									width: "80px",
									height: "80px",
									borderRadius: "50%",
									border: `4px solid ${getScoreColor(result.score)}`,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<Text fontSize="2xl" fontWeight="600">
									{result.score}
								</Text>
							</Box>
							<Box flex="1" display="flex" flexDirection="column" gap="8">
								<Heading level="4" fontSize="md" fontWeight="700">
									Brand Alignment Score
								</Heading>
								<Text fontSize="sm" color="fg.secondary">
									{result.summary}
								</Text>
							</Box>
						</Card>

						{/* Strengths */}
						{result.strengths.length > 0 && (
							<Disclosure defaultOpen>
								<DisclosureTrigger asChild>
									<Button appearance="subtle" w="full" justifyContent="start">
										<Heading level="4" fontSize="md">
											Strengths
										</Heading>
									</Button>
								</DisclosureTrigger>
								<DisclosureContent>
									<Box as="ul" pl="20" mt="8" style={{listStyleType: 'disc', display: 'block'}}>
										{result.strengths.map((strength, index) => (
											<Box as="li" key={index} mb="4" style={{display: 'list-item'}}>
												<Text fontSize="sm">{strength}</Text>
											</Box>
										))}
									</Box>
								</DisclosureContent>
							</Disclosure>
						)}

						{/* Issues */}
						{sortedIssues.length > 0 && (
							<Disclosure defaultOpen>
								<DisclosureTrigger asChild>
									<Button appearance="subtle" w="full" justifyContent="start">
										<Heading level="4" fontSize="md">
											Issues & Suggestions ({sortedIssues.length})
										</Heading>
									</Button>
								</DisclosureTrigger>
								<DisclosureContent>
									<Box display="flex" flexDirection="column" gap="12" mt="8">
										{sortedIssues.map((issue, index) => {
											const originalIndex = result!.issues.indexOf(issue);
											const isChecked = checkedIssues.has(originalIndex);
											const isClickable = issue.fieldId && onSelectField;
											return (
												<Card
													key={index}
													p="12"
													border="1"
													borderColor={isChecked ? "border.accent" : "border.default"}
													style={{
														cursor: isClickable ? "pointer" : "default",
													}}
													onClick={() => handleIssueCardClick(issue.fieldId)}
													_hover={isClickable ? {
														boxShadow: "var(--ax-shadow-sm)",
													} : undefined}
												>
													<Box display="flex" alignItems="center" gap="8" mb="8">
														{canApplyAll && (
															<Checkbox
																checked={isChecked}
																onClick={(e) => e.stopPropagation()}
																onChange={(e) => {
																	e.stopPropagation();
																	const newChecked = new Set(checkedIssues);
																	if (e.currentTarget.checked) {
																		newChecked.add(originalIndex);
																	} else {
																		newChecked.delete(originalIndex);
																	}
																	setCheckedIssues(newChecked);
																}}
															/>
														)}
														<Badge variant="subtle" intent={getSeverityIntent(issue.severity) as any}>
															{issue.severity}
														</Badge>
														<Badge variant="subtle" intent="neutral">{issue.type}</Badge>
														{issue.fieldLabel && (
															<Badge variant="subtle" intent="neutral">
																{issue.fieldLabel}
															</Badge>
														)}
													</Box>
													<Box mb="12">
														<Text fontSize="sm" fontWeight="500" mb="4">
															<IconAlertCircle
																size={14}
																style={{display: "inline", marginRight: "4px"}}
															/>
															{issue.message}
														</Text>
													</Box>
													<Box display="flex" flexDirection="column" gap="8">
														<Box>
															<Text fontSize="xs" color="fg.secondary" mb="2">
																Original:
															</Text>
															<Card
																p="8"
																bg="bg.error.subtle"
																fontSize="md"
																color="fg.default"
															>
																{issue.original}
															</Card>
														</Box>
														<Box>
															<Text fontSize="xs" color="fg.secondary" mb="2">
																Suggestion:
															</Text>
															<Box
																display="flex"
																alignItems="center"
																justifyContent="space-between"
																gap="8"
															>
																<Card
																	flex="1"
																	p="8"
																	bg="bg.success.subtle"
																	fontSize="md"
																	color="fg.default"
																>
																	{issue.suggestion}
																</Card>
																{onApply && (
																	<Button
																		size="sm"
																		appearance="primary"
																		onClick={(e) => {
																			e.stopPropagation();
																			onApply(issue.suggestion, issue.fieldId);
																		}}
																	>
																		Apply
																	</Button>
																)}
															</Box>
														</Box>
													</Box>
												</Card>
											);
										})}
									</Box>
								</DisclosureContent>
							</Disclosure>
						)}

						{result.issues.length === 0 && (
							<Box
								display="flex"
								flexDirection="column"
								alignItems="center"
								gap="8"
								py="32"
							>
								<IconCheck size={48} color="var(--ax-fg-success)" />
								<Heading level="4">Perfect Brand Alignment!</Heading>
								<Text color="fg.secondary" textAlign="center">
									No issues found. Your content matches the brand voice guidelines.
								</Text>
							</Box>
						)}
					</Box>
				)}
			</Box>

			{/* Footer (sticky) */}
			{!isLoading && result && (
				<Box
					p="16"
					borderT="1"
					borderColor="border.tertiary"
					bg="bg.default"
					display="flex"
					justifyContent="flex-end"
					gap="8"
					flexShrink={0}
				>
					<Button
						appearance="subtle"
						onClick={onClose}
					>
						Close
					</Button>
					{canApplyAll && (
						<Button
							appearance="primary"
							disabled={checkedIssues.size === 0}
							onClick={() => {
								const changes = result!.issues
									.filter((issue, index) => issue.fieldId && checkedIssues.has(index))
									.map((issue) => ({
										fieldId: issue.fieldId!,
										suggestion: issue.suggestion,
									}));
								onApplyAll!(changes);
							}}
						>
							Apply {checkedIssues.size > 0 ? `${checkedIssues.size} ` : ""}Change{checkedIssues.size !== 1 ? "s" : ""}
						</Button>
					)}
				</Box>
			)}
		</Box>
	);
};
