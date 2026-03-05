"use client";

import React, {useState, useCallback} from "react";
import {Box, Button, Checkbox, Badge, Text} from "@optiaxiom/react";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import {usePreflightContext} from "./PreflightContext";
import type {
	PreflightAuditResult,
	PreflightAuditIssue,
} from "./PreflightAuditTypes";
import {SeverityIntent, AuditTypeLabels} from "./PreflightAuditTypes";

interface PreflightResultsTableProps {
	result: PreflightAuditResult;
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
 */
export function PreflightResultsTable({result}: PreflightResultsTableProps) {
	const {contextData} = usePreflightContext();
	const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
	const [appliedIssues, setAppliedIssues] = useState<Set<number>>(new Set());

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
		if (!contextData?.onApplyAll) return;

		const changes = Array.from(selectedIssues)
			.filter((idx) => !appliedIssues.has(idx) && result.issues[idx].fieldId)
			.map((idx) => ({
				fieldId: result.issues[idx].fieldId!,
				suggestion: result.issues[idx].suggestion,
			}));

		if (changes.length > 0) {
			contextData.onApplyAll(changes);

			// Mark selected issues as applied
			setAppliedIssues((prev) => {
				const newApplied = new Set(prev);
				selectedIssues.forEach((idx) => {
					if (result.issues[idx].fieldId) {
						newApplied.add(idx);
					}
				});
				return newApplied;
			});

			// Clear selection
			setSelectedIssues(new Set());
		}
	}, [contextData, selectedIssues, appliedIssues, result.issues]);

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
			<Table>
				<thead>
					<Tr>
						<Th style={{width: "56px"}}>
							<Checkbox
								checked={allSelected}
								indeterminate={someSelected}
								onCheckedChange={handleToggleAll}
							/>
						</Th>
						<Th>Type</Th>
						<Th>Field</Th>
						<Th>Issue</Th>
						<Th>Current</Th>
						<Th>Suggestion</Th>
					</Tr>
				</thead>
				<tbody>
					{result.issues.map((issue, idx) => {
						const isApplied = appliedIssues.has(idx);
						const isSelectable = !!issue.fieldId && !isApplied;
						const isSelected = selectedIssues.has(idx);

						return (
							<Tr key={idx} style={{opacity: isApplied ? 0.5 : 1}}>
								<Td>
									<Checkbox
										checked={isSelected}
										disabled={!isSelectable}
										onCheckedChange={() => handleToggleIssue(idx)}
									/>
								</Td>
								<Td>
									<Badge
										intent={SeverityIntent[issue.severity as keyof typeof SeverityIntent]}
										variant="subtle"
									>
										{AuditTypeLabels[issue.type]}
									</Badge>
								</Td>
								<Td>
									<Text fontSize="sm">{issue.fieldLabel || "—"}</Text>
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
			<Box mt="12">
				<Button onClick={handleApplySelected} disabled={selectedIssues.size === 0}>
					Apply {selectedIssues.size} Change{selectedIssues.size !== 1 ? "s" : ""}
				</Button>
			</Box>
		</Box>
	);
}
