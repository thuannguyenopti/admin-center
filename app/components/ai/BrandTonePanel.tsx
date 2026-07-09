"use client";

import React, {useState, useEffect} from "react";
import {
	Box,
	Text,
	Heading,
	Badge,
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Checkbox,
	Spinner,
	Skeleton,
	Card,
	Alert,
} from "@optiaxiom/react";
import {IconCheck, IconCircleExclamation, IconSparkles} from "@/app/lib/axiom-icons";

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

interface BrandTonePanelProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	result: BrandToneResult | null;
	isLoading: boolean;
	onApply?: (suggestion: string, fieldId?: string) => void;
	onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void;
}

export const BrandTonePanel: React.FC<BrandTonePanelProps> = ({
	open,
	onOpenChange,
	result,
	isLoading,
	onApply,
	onApplyAll,
}) => {
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
	const sortedIssues = result?.issues
		? [...result.issues].sort((a, b) => {
				return getSeverityOrder(a.severity) - getSeverityOrder(b.severity);
			})
		: [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent style={{width: "720px", maxWidth: "100%"}}>
				<DialogHeader>
					<Box display="flex" alignItems="center" gap="8">
						<IconSparkles size={20} />
						Brand Tone of Voice Analysis
					</Box>
				</DialogHeader>
				<DialogBody>
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
							{/* Score */}
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
									}}
								>
									<Text fontSize="2xl" fontWeight="600">
										{result.score}
									</Text>
								</Box>
								<Box flex="1" display="flex" flexDirection="column" gap="8">
									<Heading level="4" fontSize="md" fontWeight="700">
										Brand Alignment Score:
									</Heading>
									<Text fontSize="sm" color="fg.secondary">
										{result.summary}
									</Text>
								</Box>
							</Card>

							{/* Strengths */}
							{result.strengths.length > 0 && (
								<Box>
									<Heading level="4" mb="8">
										Strengths
									</Heading>
									<ul
										style={{
											listStyleType: "disc",
											display: "block",
											paddingLeft: "20px",
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
								</Box>
							)}

							{/* Issues */}
							{sortedIssues.length > 0 && (
								<Box>
									<Heading level="4" mb="8">
										Issues & Suggestions
									</Heading>
									<Box display="flex" flexDirection="column" gap="12">
										{sortedIssues.map((issue, index) => {
											const originalIndex = result!.issues.indexOf(issue);
											const isChecked = checkedIssues.has(originalIndex);
											return (
												<Card
													key={index}
													p="12"
													border="1"
													borderColor="border.default"
													bg={
														isChecked ? "bg.default.pressed" : undefined
													}
												>
													<Box
														display="flex"
														alignItems="center"
														gap="8"
														mb="8"
													>
														{canApplyAll && (
															<Checkbox
																checked={isChecked}
																onChange={(e) => {
																	const newChecked = new Set(
																		checkedIssues
																	);
																	if (e.currentTarget.checked) {
																		newChecked.add(
																			originalIndex
																		);
																	} else {
																		newChecked.delete(
																			originalIndex
																		);
																	}
																	setCheckedIssues(newChecked);
																}}
															/>
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
																bg="bg.error.subtle"
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
																		onClick={() =>
																			onApply(
																				issue.suggestion,
																				issue.fieldId
																			)
																		}
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
								</Box>
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
									<Text color="fg.secondary">
										No issues found. Your content matches the brand voice
										guidelines.
									</Text>
								</Box>
							)}
						</Box>
					)}
				</DialogBody>
				<DialogFooter>
					<Box display="flex" justifyContent="flex-end" gap="8" w="full">
						<Button appearance="subtle" onClick={() => onOpenChange(false)}>
							Close
						</Button>
						{canApplyAll && (
							<Button
								appearance="primary"
								disabled={checkedIssues.size === 0}
								onClick={() => {
									const changes = result!.issues
										.filter(
											(issue, index) =>
												issue.fieldId && checkedIssues.has(index)
										)
										.map((issue) => ({
											fieldId: issue.fieldId!,
											suggestion: issue.suggestion,
										}));
									onApplyAll!(changes);
									onOpenChange(false);
								}}
							>
								Apply {checkedIssues.size > 0 ? `${checkedIssues.size} ` : ""}Change
								{checkedIssues.size !== 1 ? "s" : ""}
							</Button>
						)}
					</Box>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
