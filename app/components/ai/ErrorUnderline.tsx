"use client";

import React, { useState, useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent, Box, Text, Button } from "@optiaxiom/react";
import { IconCheck } from "@tabler/icons-react";
import type { GrammarError } from "./ProofreadingProvider";
import styles from "./ErrorUnderline.module.css";

interface ErrorUnderlineProps {
	errors: GrammarError[];
	text: string;
	onApply: (error: GrammarError) => void;
}

export const ErrorUnderline: React.FC<ErrorUnderlineProps> = ({ errors, text, onApply }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isResolved, setIsResolved] = useState(false);
	const markRef = useRef<HTMLElement>(null);

	// Only show the primary (first) error
	const primaryError = errors[0];
	if (!primaryError) return <>{text}</>;

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsOpen(true);
	};

	const handleApply = () => {
		// Mark as resolved
		setIsResolved(true);

		// Apply the fix
		onApply(primaryError);

		// Auto-close popover after a short delay
		setTimeout(() => {
			setIsOpen(false);
			// Clear resolved status after closing
			setTimeout(() => {
				setIsResolved(false);
			}, 300);
		}, 500);
	};

	// Determine severity
	const severity = primaryError.severity || "info";
	const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<mark
					ref={markRef}
					className={`${styles.errorMark} ${styles[`errorSeverity${capitalize(severity)}`]}`}
					onClick={handleClick}
					data-error-count={errors.length}
				>
					{text}
				</mark>
			</PopoverTrigger>
			<PopoverContent align="start" side="bottom" style={{ maxWidth: 300, zIndex: 9999 }}>
				<Box p="12" display="flex" flexDirection="column" gap="8">
					<Text fontSize="sm" fontWeight="500" color="fg.default">
						{primaryError.message}
					</Text>
					<Box display="flex" alignItems="center" gap="8">
						<Text
							fontSize="sm"
							color="fg.error.strong"
							style={{ textDecoration: "line-through" }}
						>
							{text}
						</Text>
						<Text fontSize="sm" color="fg.secondary">
							→
						</Text>
						<Text fontSize="sm" fontWeight="500" color="fg.success.strong">
							{primaryError.suggestion}
						</Text>
					</Box>
					{isResolved ? (
						<Box display="flex" alignItems="center" gap="8">
							<IconCheck size={16} color="#10b981" />
							<Text fontSize="sm" fontWeight="600" color="fg.success.strong">
								Resolved
							</Text>
						</Box>
					) : (
						<Button
							size="sm"
							appearance="primary"
							onClick={handleApply}
						>
							Apply Fix
						</Button>
					)}
				</Box>
			</PopoverContent>
				</Popover>
	);
};
