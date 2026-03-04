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
} from "@optiaxiom/react";
import {IconCheck, IconAlertCircle, IconSparkles} from "@tabler/icons-react";

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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<Box display="flex" alignItems="center" gap="8">
						<IconSparkles size={20} />
						Brand Tone of Voice Analysis
					</Box>
				</DialogHeader>
				<DialogBody>
					{isLoading && (
						<Box display="flex" alignItems="center" justifyContent="center" py="32">
							<Text color="fg.secondary">Analyzing brand tone...</Text>
						</Box>
					)}

					{!isLoading && result && (
						<Box display="flex" flexDirection="column" gap="16">
							{/* Score */}
							<Box
								display="flex"
								alignItems="center"
								gap="16"
								p="16"
								bg="bg.secondary"
								rounded="md"
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
								<Box flex="1">
									<Heading level="4" mb="4">
										Brand Alignment Score
									</Heading>
									<Text fontSize="sm" color="fg.secondary">
										{result.summary}
									</Text>
								</Box>
							</Box>

							{/* Strengths */}
							{result.strengths.length > 0 && (
								<Box>
									<Heading level="4" mb="8">
										Strengths
									</Heading>
									<Box display="flex" flexDirection="column" gap="4">
										{result.strengths.map((strength, index) => (
											<Box
												key={index}
												display="flex"
												alignItems="start"
												gap="8"
												p="8"
												bg="bg.success.subtle"
												rounded="sm"
											>
												<IconCheck size={16} color="var(--ax-fg-success)" />
												<Text fontSize="sm">{strength}</Text>
											</Box>
										))}
									</Box>
								</Box>
							)}

							{/* Issues */}
							{result.issues.length > 0 && (
								<Box>
									<Heading level="4" mb="8">
										Issues & Suggestions
									</Heading>
									<Box display="flex" flexDirection="column" gap="12">
										{result.issues.map((issue, index) => (
											<Box
												key={index}
												p="12"
												border="1"
												borderColor="border.tertiary"
												rounded="md"
											>
												<Box display="flex" alignItems="center" gap="8" mb="8">
													{canApplyAll && (
														<Checkbox
															checked={checkedIssues.has(index)}
															onChange={(e) => {
																const newChecked = new Set(checkedIssues);
																if (e.currentTarget.checked) {
																	newChecked.add(index);
																} else {
																	newChecked.delete(index);
																}
																setCheckedIssues(newChecked);
															}}
														/>
													)}
													<Badge intent={getSeverityIntent(issue.severity) as any}>
														{issue.severity}
													</Badge>
													<Badge variant="subtle">{issue.type}</Badge>
													{issue.fieldLabel && (
														<Badge variant="subtle" intent="information">
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
														<Box
															p="8"
															bg="bg.error.subtle"
															rounded="sm"
															fontFamily="mono"
															fontSize="sm"
														>
															{issue.original}
														</Box>
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
															<Box
																flex="1"
																p="8"
																bg="bg.success.subtle"
																rounded="sm"
																fontFamily="mono"
																fontSize="sm"
															>
																{issue.suggestion}
															</Box>
															{onApply && (
																<Button
																	size="sm"
																	appearance="primary"
																	onClick={() => onApply(issue.suggestion, issue.fieldId)}
																>
																	Apply
																</Button>
															)}
														</Box>
													</Box>
												</Box>
											</Box>
										))}
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
										No issues found. Your content matches the brand voice guidelines.
									</Text>
								</Box>
							)}
						</Box>
					)}
				</DialogBody>
				<DialogFooter>
					<Box display="flex" justifyContent="flex-end" gap="8" w="full">
						<Button
							appearance="subtle"
							onClick={() => onOpenChange(false)}
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
									onOpenChange(false);
								}}
							>
								Apply {checkedIssues.size > 0 ? `${checkedIssues.size} ` : ""}Change{checkedIssues.size !== 1 ? "s" : ""}
							</Button>
						)}
					</Box>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
