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
import {IconCheck, IconCircleExclamation, IconSparkles, IconXmark} from "@/app/lib/axiom-icons";
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
	const [isResizeHandleHovered, setIsResizeHandleHovered] = useState(false);

	// Detect mobile screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const hasFieldLevelIssues = result?.issues.some((issue) => issue.fieldId);
	const canApplyAll = hasFieldLevelIssues && onApplyAll && result && result.issues.length > 0;

	// Checkbox state - start with none checked (user must explicitly select)
	const [checkedIssues, setCheckedIssues] = useState<Set<number>>(new Set());

	// Track which issues have been applied
	const [appliedIssues, setAppliedIssues] = useState<Set<number>>(new Set());

	// Reset checkboxes and applied issues when result changes
	useEffect(() => {
		setCheckedIssues(new Set());
		setAppliedIssues(new Set());
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
	const sortedIssues = result?.issues
		? [...result.issues].sort((a, b) => {
				return getSeverityOrder(a.severity) - getSeverityOrder(b.severity);
			})
		: [];

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

	const handleIssueCardClick = useCallback(
		(fieldId?: string) => {
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
		},
		[onSelectField]
	);

	const handleApplyClick = useCallback(
		(index: number, suggestion: string, fieldId?: string) => {
			if (onApply) {
				onApply(suggestion, fieldId);
				setAppliedIssues((prev) => new Set(prev).add(index));
			}
		},
		[onApply]
	);

	const handleApplyAllClick = useCallback(() => {
		if (!result || !onApplyAll) return;

		const changes = result.issues
			.filter(
				(issue, index) =>
					issue.fieldId && checkedIssues.has(index) && !appliedIssues.has(index)
			)
			.map((issue) => ({
				fieldId: issue.fieldId!,
				suggestion: issue.suggestion,
			}));

		if (changes.length > 0) {
			onApplyAll(changes);

			// Mark all checked issues as applied
			setAppliedIssues((prev) => {
				const newApplied = new Set(prev);
				result.issues.forEach((issue, index) => {
					if (issue.fieldId && checkedIssues.has(index)) {
						newApplied.add(index);
					}
				});
				return newApplied;
			});
		}
	}, [result, onApplyAll, checkedIssues, appliedIssues]);

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
					<div
						style={{
							position: "absolute",
							left: "1px",
							top: 0,
							bottom: 0,
							width: "2px",
							backgroundColor:
								isResizing || isResizeHandleHovered
									? "var(--ax-colors-border-default)"
									: "transparent",
							transition: "background-color 0.2s",
						}}
						onMouseEnter={() => setIsResizeHandleHovered(true)}
						onMouseLeave={() => setIsResizeHandleHovered(false)}
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
				style={{flexShrink: 0}}
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
					icon={<IconXmark size={16} />}
					onClick={onClose}
					aria-label="Close"
				/>
			</Box>

			{/* Body (scrollable) */}
			<Box flex="1" overflow="auto" p="16">
				{isLoading && (
					<Box display="flex" flexDirection="column" gap="16">
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							gap="12"
							py="24"
						>
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
									<ul
										style={{
											listStyleType: "disc",
											display: "block",
											paddingLeft: "20px",
											marginTop: "8px",
										}}
									>
										{result.strengths.map((strength, index) => (
											<li
												key={index}
												style={{display: "list-item", marginBottom: "4px"}}
											>
												<Text fontSize="sm">{strength}</Text>
											</li>
										))}
									</ul>
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
											const isApplied = appliedIssues.has(originalIndex);
											const isClickable = issue.fieldId && onSelectField;
											return (
												<Card
													key={index}
													p="12"
													border="1"
													borderColor={
														isApplied
															? "border.success"
															: "border.default"
													}
													bg={
														isChecked && !isApplied
															? "bg.default.pressed"
															: undefined
													}
													style={{
														cursor: isClickable ? "pointer" : "default",
														opacity: isApplied ? 0.7 : 1,
													}}
													onClick={() =>
														handleIssueCardClick(issue.fieldId)
													}
												>
													<Box
														display="flex"
														alignItems="center"
														gap="8"
														mb="8"
													>
														{isApplied ? (
															<Box
																display="flex"
																alignItems="center"
																gap="4"
															>
																<IconCheck
																	size={16}
																	color="var(--ax-colors-fg-success)"
																/>
																<Badge
																	variant="subtle"
																	intent="success"
																>
																	Applied
																</Badge>
															</Box>
														) : (
															canApplyAll && (
																<Checkbox
																	checked={isChecked}
																	onClick={(e) =>
																		e.stopPropagation()
																	}
																	onChange={(e) => {
																		e.stopPropagation();
																		const newChecked = new Set(
																			checkedIssues
																		);
																		if (
																			e.currentTarget.checked
																		) {
																			newChecked.add(
																				originalIndex
																			);
																		} else {
																			newChecked.delete(
																				originalIndex
																			);
																		}
																		setCheckedIssues(
																			newChecked
																		);
																	}}
																/>
															)
														)}
														<Badge
															variant="subtle"
															intent={
																getSeverityIntent(
																	issue.severity
																) as any
															}
														>
															{issue.severity}
														</Badge>
														<Badge variant="subtle" intent="neutral">
															{issue.type}
														</Badge>
														{issue.fieldLabel && (
															<Badge
																variant="subtle"
																intent="neutral"
															>
																{issue.fieldLabel}
															</Badge>
														)}
													</Box>
													<Box mb="12">
														<Text fontSize="sm" fontWeight="500" mb="4">
															<IconCircleExclamation
																size={14}
																style={{
																	display: "inline",
																	marginRight: "4px",
																}}
															/>
															{issue.message}
														</Text>
													</Box>
													<Box
														display="flex"
														flexDirection="column"
														gap="8"
													>
														<Box>
															<Text
																fontSize="xs"
																color="fg.secondary"
																mb="2"
															>
																Original:
															</Text>
															<Card
																p="8"
																bg={
																	isApplied
																		? "bg.default"
																		: "bg.error.subtle"
																}
																fontSize="md"
																color="fg.default"
															>
																{issue.original}
															</Card>
														</Box>
														<Box>
															<Text
																fontSize="xs"
																color="fg.secondary"
																mb="2"
															>
																{isApplied
																	? "Applied:"
																	: "Suggestion:"}
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
																	bg={
																		isApplied
																			? "bg.default"
																			: "bg.success.subtle"
																	}
																	fontSize="md"
																	color="fg.default"
																>
																	{issue.suggestion}
																</Card>
																{onApply && !isApplied && (
																	<Button
																		size="sm"
																		appearance="primary"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleApplyClick(
																				originalIndex,
																				issue.suggestion,
																				issue.fieldId
																			);
																		}}
																	>
																		Apply
																	</Button>
																)}
																{isApplied && (
																	<Box
																		display="flex"
																		alignItems="center"
																		gap="4"
																		px="8"
																	>
																		<IconCheck
																			size={16}
																			color="var(--ax-colors-fg-success)"
																		/>
																	</Box>
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
									No issues found. Your content matches the brand voice
									guidelines.
								</Text>
							</Box>
						)}
					</Box>
				)}
			</Box>

			{/* Footer (sticky) */}
			{!isLoading &&
				result &&
				(() => {
					// Calculate how many checked issues are not yet applied
					const unappliedCheckedCount = Array.from(checkedIssues).filter(
						(index) => !appliedIssues.has(index)
					).length;

					const showApplyButton = canApplyAll && unappliedCheckedCount > 0;

					return (
						<Box
							p="16"
							borderT="1"
							borderColor="border.tertiary"
							bg="bg.default"
							display="flex"
							justifyContent="flex-end"
							gap="8"
							style={{flexShrink: 0}}
						>
							<Button appearance="subtle" onClick={onClose}>
								Close
							</Button>
							{showApplyButton && (
								<Button appearance="primary" onClick={handleApplyAllClick}>
									Apply {unappliedCheckedCount} Change
									{unappliedCheckedCount !== 1 ? "s" : ""}
								</Button>
							)}
						</Box>
					);
				})()}
		</Box>
	);
};
