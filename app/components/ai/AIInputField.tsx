"use client";

import React, { forwardRef, useRef, useImperativeHandle, useMemo, useCallback, useLayoutEffect, useState, useEffect } from "react";
import type { InputProps } from "@optiaxiom/react";
import { useProofreading } from "./useProofreading";
import { textToNodes } from "./utils/textToNodes";
import { getCursorOffset, setCursorOffset } from "./utils/cursorUtils";
import type { GrammarError } from "./ProofreadingProvider";
import styles from "./AIInputField.module.css";

export interface AIInputFieldProps extends Omit<InputProps, "onChange" | "value"> {
	value: string;
	onChange: (e: { currentTarget: { value: string }; target: { value: string } }) => void;
	placeholder?: string;
	disabled?: boolean;
	error?: boolean;
	size?: "md" | "lg" | "xl";
	enableGrammarCheck?: boolean;
}

export const AIInputField = forwardRef<HTMLDivElement, AIInputFieldProps>(
	(props, ref) => {
		const {
			value,
			onChange,
			placeholder,
			disabled,
			error,
			size = "lg",
			enableGrammarCheck = true,
			className,
			style,
			...restProps
		} = props;

		const editorRef = useRef<HTMLDivElement>(null);
		const [isTyping, setIsTyping] = useState(false);
		const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

		// Only check for errors when not actively typing
		const { errors, checkNow } = useProofreading(enableGrammarCheck && !isTyping ? value : "");
		const cursorPosRef = useRef<number | null>(null);
		const isInputtingRef = useRef(false);
		const previousValueRef = useRef(value);

		// Expose ref to parent
		useImperativeHandle(ref, () => editorRef.current!);

		// Cleanup typing timeout on unmount
		useEffect(() => {
			return () => {
				if (typingTimeoutRef.current) {
					clearTimeout(typingTimeoutRef.current);
				}
			};
		}, []);

		// Restore cursor position after React updates content
		useLayoutEffect(() => {
			// Only restore cursor if value actually changed (not just errors)
			const valueChanged = previousValueRef.current !== value;
			previousValueRef.current = value;

			if (isInputtingRef.current && valueChanged && cursorPosRef.current !== null && editorRef.current) {
				// Restore cursor synchronously before browser paint
				setCursorOffset(editorRef.current, cursorPosRef.current);
				cursorPosRef.current = null;
				isInputtingRef.current = false;
			}
		}, [value, errors]);

		const handleFocus = useCallback(() => {
			// Run proofreading check when focused
			if (enableGrammarCheck && value) {
				checkNow();
			}
		}, [enableGrammarCheck, value, checkNow]);

		const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
			if (!editorRef.current) return;

			// Save cursor position before updating
			cursorPosRef.current = getCursorOffset(editorRef.current);
			isInputtingRef.current = true;

			// Mark as typing to disable error checking
			setIsTyping(true);

			// Clear any existing timeout
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}

			// Set timeout to re-enable error checking after user stops typing
			typingTimeoutRef.current = setTimeout(() => {
				setIsTyping(false);
			}, 500);

			const newValue = e.currentTarget.textContent || "";

			// Prevent line breaks in single-line input
			const sanitizedValue = newValue.replace(/[\r\n]/g, "");

			if (sanitizedValue !== newValue) {
				editorRef.current.textContent = sanitizedValue;
				// Update cursor position for the sanitized text
				cursorPosRef.current = Math.min(cursorPosRef.current, sanitizedValue.length);
			}

			onChange({
				currentTarget: { value: sanitizedValue },
				target: { value: sanitizedValue }
			});
		}, [onChange]);

		const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
			// Prevent Enter key in single-line input
			if (e.key === "Enter") {
				e.preventDefault();
			}
		}, []);

		const handlePaste = useCallback((e: React.ClipboardEvent) => {
			e.preventDefault();
			const text = e.clipboardData.getData("text/plain").replace(/[\r\n]/g, " ");
			document.execCommand("insertText", false, text);
		}, []);

		const handleApplySuggestion = useCallback((error: GrammarError) => {
			if (!editorRef.current) return;

			// Get current cursor position
			const cursorOffset = getCursorOffset(editorRef.current);

			// Get current value from DOM to avoid stale closure
			const currentValue = editorRef.current.textContent || "";
			const newValue = currentValue.substring(0, error.start) + error.suggestion + currentValue.substring(error.end);

			// Calculate new cursor position
			let newCursorOffset = cursorOffset;
			if (cursorOffset > error.end) {
				const lengthDiff = error.suggestion.length - (error.end - error.start);
				newCursorOffset = cursorOffset + lengthDiff;
			} else if (cursorOffset >= error.start && cursorOffset <= error.end) {
				newCursorOffset = error.start + error.suggestion.length;
			}

			// Apply change
			onChange({
				currentTarget: { value: newValue },
				target: { value: newValue }
			});

			// Restore cursor after React updates DOM
			requestAnimationFrame(() => {
				if (editorRef.current) {
					setCursorOffset(editorRef.current, newCursorOffset);
				}
			});
		}, [onChange]);

		// Render content with error highlighting
		const contentNodes = useMemo(
			() => textToNodes(value, errors, handleApplySuggestion),
			[value, errors, handleApplySuggestion]
		);

		const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

		return (
			<div
				ref={editorRef}
				contentEditable={!disabled}
				suppressContentEditableWarning
				spellCheck={true}
				className={`${styles.editor} ${styles[`size${capitalize(size)}`]} ${error ? styles.error : ""} ${disabled ? styles.disabled : ""} ${className || ""}`}
				style={style}
				data-placeholder={!value ? placeholder : undefined}
				onInput={handleInput}
				onKeyDown={handleKeyDown}
				onPaste={handlePaste}
				onFocus={handleFocus}
				role="textbox"
				aria-multiline="false"
				aria-disabled={disabled}
				aria-invalid={error}
				{...restProps}
			>
				{contentNodes}
			</div>
		);
	}
);

AIInputField.displayName = "AIInputField";
