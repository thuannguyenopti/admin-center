"use client";

import React, { forwardRef, useRef, useImperativeHandle, useCallback, useLayoutEffect, useState, useEffect } from "react";
import type { TextareaProps } from "@optiaxiom/react";
import { useProofreading } from "./useProofreading";
import { getCursorOffset, setCursorOffset } from "./utils/cursorUtils";
import type { GrammarError } from "./ProofreadingProvider";
import styles from "./AITextArea.module.css";

export interface AITextAreaProps extends Omit<TextareaProps, "onChange" | "value"> {
	value: string;
	onChange: (e: { currentTarget: { value: string }; target: { value: string } }) => void;
	placeholder?: string;
	disabled?: boolean;
	error?: boolean;
	rows?: number;
	resize?: "none" | "vertical" | "horizontal" | "both";
	enableGrammarCheck?: boolean;
}

export const AITextArea = forwardRef<HTMLDivElement, AITextAreaProps>(
	(props, ref) => {
		const {
			value,
			onChange,
			placeholder,
			disabled,
			error,
			rows = 4,
			resize = "vertical",
			enableGrammarCheck = true,
			className,
			style,
			...restProps
		} = props;

		const editorRef = useRef<HTMLDivElement>(null);
		const [isTyping, setIsTyping] = useState(false);
		const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
		const isUserTypingRef = useRef(false);
		const onChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
		const pendingValueRef = useRef<string | null>(null);

		// Only check for errors when not actively typing
		const { errors, checkNow } = useProofreading(enableGrammarCheck && !isTyping ? value : "");

		// Expose ref to parent
		useImperativeHandle(ref, () => editorRef.current!);

		// Cleanup timeouts on unmount
		useEffect(() => {
			return () => {
				if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
				if (onChangeTimeoutRef.current) clearTimeout(onChangeTimeoutRef.current);
			};
		}, []);

		// Initialize and sync DOM content
		useLayoutEffect(() => {
			if (!editorRef.current) return;

			// Never update DOM while user is actively typing
			if (isUserTypingRef.current) return;

			const currentText = editorRef.current.textContent || "";

			// Update if value changed
			if (currentText !== value) {
				editorRef.current.textContent = value;
			}
		}, [value]);

		const handleFocus = useCallback(() => {
			if (enableGrammarCheck && value) {
				checkNow();
			}
		}, [enableGrammarCheck, value, checkNow]);

		const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
			if (!editorRef.current) return;

			// Set typing flags
			isUserTypingRef.current = true;
			setIsTyping(true);

			// Clear any existing timeouts
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			if (onChangeTimeoutRef.current) {
				clearTimeout(onChangeTimeoutRef.current);
			}

			const newValue = e.currentTarget.textContent || "";

			// Store the pending value
			pendingValueRef.current = newValue;

			// Debounce onChange calls to avoid blocking main thread
			onChangeTimeoutRef.current = setTimeout(() => {
				if (pendingValueRef.current !== null) {
					onChange({
						currentTarget: { value: pendingValueRef.current },
						target: { value: pendingValueRef.current }
					});
					pendingValueRef.current = null;
				}
			}, 150);

			// Set timeout to mark typing as complete
			typingTimeoutRef.current = setTimeout(() => {
				isUserTypingRef.current = false;
				setIsTyping(false);
			}, 500);
		}, [onChange]);

		const handlePaste = useCallback((e: React.ClipboardEvent) => {
			e.preventDefault();
			const text = e.clipboardData.getData("text/plain");
			document.execCommand("insertText", false, text);
		}, []);

		const handleApplySuggestion = useCallback((error: GrammarError) => {
			if (!editorRef.current) return;

			const cursorOffset = getCursorOffset(editorRef.current);
			const currentValue = editorRef.current.textContent || "";
			const newValue = currentValue.substring(0, error.start) + error.suggestion + currentValue.substring(error.end);

			let newCursorOffset = cursorOffset;
			if (cursorOffset > error.end) {
				const lengthDiff = error.suggestion.length - (error.end - error.start);
				newCursorOffset = cursorOffset + lengthDiff;
			} else if (cursorOffset >= error.start && cursorOffset <= error.end) {
				newCursorOffset = error.start + error.suggestion.length;
			}

			onChange({
				currentTarget: { value: newValue },
				target: { value: newValue }
			});

			requestAnimationFrame(() => {
				if (editorRef.current) {
					setCursorOffset(editorRef.current, newCursorOffset);
				}
			});
		}, [onChange]);

		const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
		const resizeClass = styles[`resize${capitalize(resize)}`] || styles.resizeVertical;

		const minHeight = rows * 24;

		return (
			<div
				ref={editorRef}
				contentEditable={!disabled}
				suppressContentEditableWarning
				spellCheck={true}
				className={`${styles.editor} ${resizeClass} ${error ? styles.error : ""} ${disabled ? styles.disabled : ""} ${className || ""}`}
				style={{ ...style, minHeight: `${minHeight}px` }}
				data-placeholder={!value ? placeholder : undefined}
				onInput={handleInput}
				onPaste={handlePaste}
				onFocus={handleFocus}
				role="textbox"
				aria-multiline="true"
				aria-disabled={disabled}
				aria-invalid={error}
				{...restProps}
			/>
		);
	}
);

AITextArea.displayName = "AITextArea";
