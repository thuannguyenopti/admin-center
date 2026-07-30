"use client";

import React, { useState, useEffect } from "react";
import {
	Box,
	Text,
	Spinner,
	Badge,
} from "@optiaxiom/react";
import {
	IconCircle,
	IconCheck,
	IconXmark,
	IconChevronDown,
} from "@optimizely/axiom-icons";

/**
 * Checklist item representing the status of an individual task
 */
export interface ChecklistItem {
	label: string;
	status: "pending" | "running" | "completed" | "failed";
}

interface PageGenerationProgressProps {
	checklist: ChecklistItem[];
	contextualMessage?: string;
	pageType?: string;
	sections?: string[];
	isCompleted?: boolean;
}

/**
 * Map checklist items to capability tags
 */
function deriveSkills(checklist: ChecklistItem[]): string[] {
	const skills: string[] = [];
	const activeOrCompleted = checklist.filter(
		item => item.status === 'running' || item.status === 'completed'
	);

	activeOrCompleted.forEach(item => {
		if (item.label.includes('Analyzing')) skills.push('AI Planning');
		if (item.label.includes('text content')) skills.push('Content Writing');
		if (item.label.includes('images')) skills.push('Image Generation');
		if (item.label.includes('Populating')) skills.push('Layout Design');
	});

	return [...new Set(skills)]; // Remove duplicates
}

/**
 * Generate friendly contextual message
 */
function generateContextualMessage(
	pageType?: string,
	sections?: string[],
	checklist?: ChecklistItem[]
): string {
	// If we have page type and sections, generate specific message
	if (pageType && sections && sections.length > 0) {
		const sectionList = sections.slice(0, 3).join(', ').toLowerCase();
		const typeLabel = pageType.replace('-', ' ');
		return `Crafting your ${typeLabel} with ${sectionList}${sections.length > 3 ? ', and more' : ''}`;
	}

	// Fallback based on current step
	if (checklist) {
		const current = checklist.find(item => item.status === 'running');
		if (current) {
			if (current.label.includes('Analyzing')) return 'Planning your page structure';
			if (current.label.includes('text')) return 'Writing engaging content for your page';
			if (current.label.includes('images')) return 'Generating beautiful imagery';
			if (current.label.includes('Populating')) return 'Assembling your page elements';
		}
	}

	return 'Crafting fresh content magic to populate your page';
}

/**
 * Component that renders page generation progress with collapsible details
 * Displays a friendly message with expandable technical details
 */
const THINKING_MESSAGES = [
	"Analyzing brief and campaign context",
	"Crafting content structure",
	"Writing engaging copy",
	"Optimizing for target audience",
	"Applying brand voice guidelines",
	"Generating visual assets",
	"Polishing final output",
];

export function PageGenerationProgress({
	checklist,
	contextualMessage,
	pageType,
	sections,
	isCompleted = false
}: PageGenerationProgressProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [thinkingIndex, setThinkingIndex] = useState(0);

	// Rotate thinking messages while generating
	useEffect(() => {
		if (isCompleted) return;
		const interval = setInterval(() => {
			setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
		}, 3000);
		return () => clearInterval(interval);
	}, [isCompleted]);

	// Derive skills from active checklist items
	const activeSkills = deriveSkills(checklist);

	// Generate contextual message if not provided
	const baseMessage = contextualMessage || generateContextualMessage(pageType, sections, checklist);
	const message = isCompleted ? baseMessage : THINKING_MESSAGES[thinkingIndex];

	return (
		<Box
			p="16"
			bg="bg.default"
			rounded="lg"
		>
			{/* Header - always visible */}
			<Box
				display="flex"
				alignItems="center"
				gap="8"
				role="button"
				tabIndex={0}
				aria-expanded={isExpanded}
				style={{ cursor: 'pointer' }}
				onClick={() => setIsExpanded(!isExpanded)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						setIsExpanded(!isExpanded);
					}
				}}
			>
				<IconChevronDown
					size={16}
					color="var(--ax-colors-fg-tertiary)"
					style={{
						transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
						transition: 'transform 0.2s',
						flexShrink: 0
					}}
				/>
				{!isExpanded && (
					<>
						<Box style={{ fontSize: '16px', lineHeight: '1' }} aria-hidden="true">✍️</Box>
						<Text
							key={message}
							fontSize="sm"
							fontWeight="500"
							color="fg.default"
							style={{
								flex: 1,
								animation: isCompleted ? undefined : 'fadeIn 0.4s ease-in',
							}}
						>
							{message}
						</Text>
					</>
				)}
				{isExpanded && (
					<Text fontSize="sm" fontWeight="600" color="fg.secondary">
						{isCompleted ? 'Completed' : 'Working'}
					</Text>
				)}
			</Box>

			{/* Expanded details */}
			{isExpanded && (
				<Box mt="16">
					{/* Skills section with checkmark */}
					{activeSkills.length > 0 && (
						<Box mb="16">
							<Box display="flex" alignItems="center" gap="8" mb="12">
								<IconCheck size={16} style={{ color: 'var(--ax-colors-fg-success)' }} />
								<Text fontSize="sm" fontWeight="500">🎒 Equipping the right skills</Text>
							</Box>
							<Box pl="24">
								<Text
									fontSize="xs"
									fontWeight="500"
									color="fg.tertiary"
									mb="8"
									style={{ letterSpacing: '0.05em' }}
								>
									ORGANIZATION
								</Text>
								<Box display="flex" gap="8" flexWrap="wrap">
									{activeSkills.map((skill, idx) => (
										<Badge
											key={idx}
											variant="subtle"
											style={{
												borderRadius: '12px',
												padding: '4px 12px',
												fontSize: '13px',
											}}
										>
											{skill}
										</Badge>
									))}
								</Box>
							</Box>
						</Box>
					)}

					{/* Main message */}
					<Box display="flex" alignItems="center" gap="8">
						<Box style={{ fontSize: '16px', lineHeight: '1' }} aria-hidden="true">✍️</Box>
						<Text fontSize="sm" color="fg.default">
							{message}
						</Text>
					</Box>

					{/* Technical checklist - collapsible */}
					{checklist.length > 0 && (
						<Box mt="16" pt="16" style={{ borderTop: '1px solid var(--ax-colors-border-secondary)' }}>
							<Text fontSize="xs" fontWeight="500" color="fg.tertiary" mb="8" style={{ letterSpacing: '0.05em' }}>
								PROGRESS DETAILS
							</Text>
							{checklist.map((item, idx) => (
								<Box key={idx} display="flex" alignItems="center" gap="8" py="6">
									{item.status === 'pending' && <IconCircle size={14} color="var(--ax-colors-fg-tertiary)" />}
									{item.status === 'running' && <Spinner size="sm" />}
									{item.status === 'completed' && <IconCheck size={14} style={{ color: '#22c55e' }} />}
									{item.status === 'failed' && <IconXmark size={14} style={{ color: 'var(--ax-colors-fg-error)' }} />}
									<Text fontSize="xs" color={item.status === 'completed' ? 'fg.default' : 'fg.secondary'}>
										{item.label}
									</Text>
								</Box>
							))}
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
}
