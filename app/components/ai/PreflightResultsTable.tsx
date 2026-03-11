"use client";

import React, {useState, useCallback, useEffect} from "react";
import {Box, Button, Checkbox, Badge, Text, Group, toaster} from "@optiaxiom/react";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import {usePreflightContext} from "./PreflightContext";
import {useLayout} from "@/app/context/LayoutContext";
import type {
	PreflightAuditResult,
	PreflightAuditIssue,
} from "./PreflightAuditTypes";
import {SeverityIntent, AuditTypeLabels} from "./PreflightAuditTypes";
import {IconCheck} from "@tabler/icons-react";

interface PreflightResultsTableProps {
	result: PreflightAuditResult;
	messageId: string;
}

/**
 * Truncate text to a maximum length
 */
function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + "...";
}

/**
 * Interactive table component displaying preflight audit results
 * Supports checkbox selection and batch applying changes
 * Groups issues by type for better organization
 */
export function PreflightResultsTable({result, messageId}: PreflightResultsTableProps) {
	const {contextData, clearContext, scrollToField} = usePreflightContext();
	const {opalPanelControls} = useLayout();
	const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
	const [appliedIssues, setAppliedIssues] = useState<Set<number>>(new Set());

	// Group issues by type
	const groupedIssues = result.issues.reduce((acc, issue, idx) => {
		const type = issue.type;
		if (!acc[type]) {
			acc[type] = [];
		}
		acc[type].push({issue, originalIndex: idx});
		return acc;
	}, {} as Record<string, Array<{issue: PreflightAuditIssue; originalIndex: number}>>);

	// Log component mount and context data
	useEffect(() => {
		console.log('[PreflightResultsTable] Component mounted', {
			hasContextData: !!contextData,
			hasOnApplyAll: !!contextData?.onApplyAll,
			hasOnApplyField: !!contextData?.onApplyField,
			fieldsCount: contextData?.fields?.length || 0,
			issuesCount: result.issues.length,
			hasOpalControls: !!opalPanelControls,
		});
	}, []);

	// Disable input when results are shown, enable when dismissed or all applied
	useEffect(() => {
		opalPanelControls?.setInputDisabled(true);
		return () => {
			opalPanelControls?.setInputDisabled(false);
		};
	}, [opalPanelControls]);

	// Select all selectable issues by default on mount
	useEffect(() => {
		const allSelectable = result.issues
			.map((_, idx) => idx)
			.filter((idx) => result.issues[idx].fieldId && !appliedIssues.has(idx));
		setSelectedIssues(new Set(allSelectable));
	}, [result.issues, appliedIssues]);

	// Check if all issues have been applied
	const allIssuesApplied = result.issues.every((issue, idx) =>
		!issue.fieldId || appliedIssues.has(idx)
	);

	// Re-enable input when all issues are applied
	useEffect(() => {
		if (allIssuesApplied) {
			opalPanelControls?.setInputDisabled(false);
		}
	}, [allIssuesApplied, opalPanelControls]);

	// Toggle individual issue selection
	const handleToggleIssue = useCallback((index: number) => {
		setSelectedIssues((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	}, []);

	// Toggle all issues selection
	const handleToggleAll = useCallback(() => {
		const allSelectable = result.issues
			.map((_, idx) => idx)
			.filter((idx) => result.issues[idx].fieldId && !appliedIssues.has(idx));

		if (selectedIssues.size === allSelectable.length && selectedIssues.size > 0) {
			// All selected, clear selection
			setSelectedIssues(new Set());
		} else {
			// Select all selectable issues
			setSelectedIssues(new Set(allSelectable));
		}
	}, [result.issues, selectedIssues.size, appliedIssues]);

	// Apply selected changes
	const handleApplySelected = useCallback(() => {
		console.log('[PreflightResultsTable] Apply selected clicked', {
			hasContextData: !!contextData,
			hasOnApplyAll: !!contextData?.onApplyAll,
			selectedCount: selectedIssues.size,
		});

		if (!contextData?.onApplyAll) {
			console.error('[PreflightResultsTable] No onApplyAll callback available');
			return;
		}

		const changes = Array.from(selectedIssues)
			.filter((idx) => !appliedIssues.has(idx) && result.issues[idx].fieldId)
			.map((idx) => ({
				fieldId: result.issues[idx].fieldId!,
				suggestion: result.issues[idx].suggestion,
			}));

		console.log('[PreflightResultsTable] Applying changes:', changes);

		if (changes.length > 0) {
			contextData.onApplyAll(changes);

			// Show success toast
			toaster.create(`Applied ${changes.length} change${changes.length !== 1 ? 's' : ''}`, { intent: "success" });

			// Mark selected issues as applied
			setAppliedIssues((prev) => {
				const newApplied = new Set(prev);
				selectedIssues.forEach((idx) => {
					if (result.issues[idx].fieldId) {
						newApplied.add(idx);
					}
				});

				// Update message content with new applied count
				const totalApplied = newApplied.size;
				const totalIssues = result.issues.filter(issue => issue.fieldId).length;
				const remainingIssues = totalIssues - totalApplied;

				if (totalApplied === totalIssues) {
					// All issues applied
					opalPanelControls?.updateMessage(messageId, {
						content: `Applied ${totalApplied} change${totalApplied !== 1 ? 's' : ''}.`
					});
				} else {
					// Some issues still pending
					const criticalRemaining = result.issues.filter((issue, idx) =>
						issue.severity === "critical" && !newApplied.has(idx)
					).length;
					const highRemaining = result.issues.filter((issue, idx) =>
						issue.severity === "high" && !newApplied.has(idx)
					).length;

					opalPanelControls?.updateMessage(messageId, {
						content: `Found ${remainingIssues} issue${remainingIssues !== 1 ? 's' : ''} (${criticalRemaining} critical, ${highRemaining} high). Applied ${totalApplied} change${totalApplied !== 1 ? 's' : ''}.`
					});
				}

				return newApplied;
			});

			// Clear selection
			setSelectedIssues(new Set());
		} else {
			console.log('[PreflightResultsTable] No changes to apply');
		}
	}, [contextData, selectedIssues, appliedIssues, result.issues, opalPanelControls, messageId]);

	// Dismiss results and re-enable input
	const handleDismiss = useCallback(() => {
		console.log('[PreflightResultsTable] Dismiss clicked', {
			messageId,
			hasOpalControls: !!opalPanelControls,
		});
		opalPanelControls?.setInputDisabled(false);
		opalPanelControls?.removeMessage(messageId);
		clearContext();
	}, [opalPanelControls, messageId, clearContext]);

	// Handle row click to scroll to element
	const handleRowClick = useCallback((issue: PreflightAuditIssue) => {
		if (issue.fieldId) {
			console.log('[PreflightResultsTable] Row clicked, scrolling to field:', issue.fieldId);
			scrollToField(issue.fieldId);
		}
	}, [scrollToField]);

	// Calculate selection state for header checkbox
	const selectableIssues = result.issues.filter(
		(issue, idx) => issue.fieldId && !appliedIssues.has(idx)
	);
	const allSelected =
		selectableIssues.length > 0 &&
		selectableIssues.every((_, idx) => {
			const originalIdx = result.issues.findIndex((iss) => iss === selectableIssues[idx]);
			return selectedIssues.has(originalIdx);
		});
	const someSelected = selectedIssues.size > 0 && !allSelected;

	if (result.issues.length === 0) {
		return (
			<Box p="12" bg="bg.secondary" style={{borderRadius: "8px"}}>
				<Text fontSize="sm" style={{color: "#6B7280"}}>
					No issues found! Your content is ready to publish.
				</Text>
			</Box>
		);
	}

	return (
		<Box>
			{/* Select All Header - only show if there are selectable issues */}
			{!allIssuesApplied && (
				<Group mb="12" gap="8">
					<Checkbox
						checked={allSelected}
						indeterminate={someSelected}
						onCheckedChange={handleToggleAll}
					/>
					<Text fontSize="sm" fontWeight="500">
						Select all issues
					</Text>
				</Group>
			)}

			{/* Grouped Issues */}
			{Object.entries(groupedIssues).map(([type, issuesInGroup]) => (
				<Box key={type} mb="16">
					<Text fontSize="sm" fontWeight="600" mb="8" style={{color: "#374151"}}>
						{AuditTypeLabels[type as keyof typeof AuditTypeLabels]}
					</Text>
					<Table>
						<thead>
							<Tr>
								<Th></Th>
								<Th>Severity</Th>
								<Th>Issue</Th>
								<Th>Current</Th>
								<Th>Suggestion</Th>
							</Tr>
						</thead>
						<tbody>
							{issuesInGroup.map(({issue, originalIndex}) => {
								const isApplied = appliedIssues.has(originalIndex);
								const isSelectable = !!issue.fieldId && !isApplied;
								const isSelected = selectedIssues.has(originalIndex);

								return (
									<Tr
										key={originalIndex}
										onClick={() => handleRowClick(issue)}
										style={{cursor: issue.fieldId ? 'pointer' : 'default'}}
									>
										<Td>
											{isApplied ? (
												<IconCheck size={16} style={{color: "#22c55e"}} />
											) : (
												<Checkbox
													checked={isSelected}
													disabled={!isSelectable}
													onCheckedChange={() => handleToggleIssue(originalIndex)}
												/>
											)}
										</Td>
										<Td>
											<Badge
												intent={SeverityIntent[issue.severity as keyof typeof SeverityIntent]}
												variant="subtle"
											>
												{issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
											</Badge>
										</Td>
										<Td>
											<Text fontSize="sm">{truncate(issue.message, 60)}</Text>
										</Td>
										<Td>
											<Text fontSize="sm" fontFamily="mono" color="fg.secondary">
												{truncate(issue.original || "—", 40)}
											</Text>
										</Td>
										<Td>
											<Text fontSize="sm" fontFamily="mono" color="fg.secondary">
												{truncate(issue.suggestion, 40)}
											</Text>
										</Td>
									</Tr>
								);
							})}
						</tbody>
					</Table>
				</Box>
			))}

			{/* Action Buttons - only show if there are selectable issues */}
			{!allIssuesApplied && (
				<Group mt="12" gap="8">
					<Button
						onClick={handleApplySelected}
						disabled={selectedIssues.size === 0}
						appearance="primary-opal"
					>
						Apply {selectedIssues.size} Change{selectedIssues.size !== 1 ? "s" : ""}
					</Button>
					<Button onClick={handleDismiss} appearance="subtle">
						Dismiss
					</Button>
				</Group>
			)}
		</Box>
	);
}
