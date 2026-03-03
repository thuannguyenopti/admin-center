"use client";

import React, { forwardRef, useRef, useImperativeHandle, useCallback, useLayoutEffect, useState, useEffect } from "react";
import type { TextareaProps } from "@optiaxiom/react";
import { useProofreading } from "./useProofreading";
import { useAutoComplete } from "./useAutoComplete";
import { getCursorOffset, setCursorOffset } from "./utils/cursorUtils";
import type { GrammarError } from "./ProofreadingProvider";
import { renderTextWithErrors } from "./utils/renderTextWithErrors";
import styles from "./AIInputField.module.css";

export interface AIInputFieldProps extends Omit<TextareaProps, "onChange" | "value"> {
	value: string;
	onChange: (e: { currentTarget: { value: string }; target: { value: string } }) => void;
	placeholder?: string;
	disabled?: boolean;
	error?: boolean;
	size?: "md" | "lg" | "xl";
	enableGrammarCheck?: boolean;
	enableAutoComplete?: boolean;
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
			enableAutoComplete = false,
			className,
			style,
			...restProps
		} = props;

		const editorRef = useRef<HTMLDivElement>(null);
		const [isTyping, setIsTyping] = useState(false);
		const [currentText, setCurrentText] = useState(value);
		const [textToCheck, setTextToCheck] = useState("");
		const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
		const isUserTypingRef = useRef(false);
		const onChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
		const pendingValueRef = useRef<string | null>(null);

		// Only check for errors when not actively typing
		const { errors, checkNow } = useProofreading(textToCheck);

		// Auto-completion (only when not typing and enabled)
		const { completion, clearCompletion } = useAutoComplete(
			currentText,
			enableAutoComplete && !isTyping
		);

		// Update textToCheck only when typing stops
		useEffect(() => {
			if (!isTyping && currentText && enableGrammarCheck) {
				console.log("[AIInputField] User stopped typing - enabling proofreading for:", currentText);
				setTextToCheck(currentText);
			} else if (isTyping && textToCheck !== "") {
				console.log("[AIInputField] User is typing - clearing proofreading text");
				setTextToCheck("");
			}
		}, [isTyping, currentText, enableGrammarCheck]);

		// Debug: Log when proofreading is triggered
		useEffect(() => {
			if (textToCheck && textToCheck.trim().length > 0) {
				console.log("[AIInputField] Proofreading triggered:", { textToCheck, errorCount: errors.length, errors });
			}
		}, [textToCheck, errors]);

		// Expose ref to parent
		useImperativeHandle(ref, () => editorRef.current!);

		// Cleanup timeouts on unmount
		useEffect(() => {
			return () => {
				if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
				if (onChangeTimeoutRef.current) clearTimeout(onChangeTimeoutRef.current);
			};
		}, []);

		// Track if we should show error underlines
		const showErrors = !isTyping && errors.length > 0;

		// Initialize and sync DOM content
		useLayoutEffect(() => {
			if (!editorRef.current) return;

			// Never update DOM while user is actively typing
			if (isUserTypingRef.current) return;

			const currentDOMText = editorRef.current.textContent || "";

			// Update if value changed
			if (currentDOMText !== value) {
				editorRef.current.textContent = value;
				setCurrentText(value);
			}
		}, [value]);

		const handleFocus = useCallback(() => {
			if (enableGrammarCheck && currentText) {
				checkNow();
			}
		}, [enableGrammarCheck, currentText, checkNow]);

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

			// Prevent line breaks in single-line input
			const sanitizedValue = newValue.replace(/[\r\n]/g, "");

			if (sanitizedValue !== newValue && editorRef.current) {
				const cursorPos = getCursorOffset(editorRef.current);
				editorRef.current.textContent = sanitizedValue;
				setCursorOffset(editorRef.current, Math.min(cursorPos, sanitizedValue.length));
			}

			// Update current text immediately for proofreading later
			setCurrentText(sanitizedValue);

			// Store the pending value
			pendingValueRef.current = sanitizedValue;

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

			// Set timeout to mark typing as complete and trigger proofreading
			typingTimeoutRef.current = setTimeout(() => {
				isUserTypingRef.current = false;
				setIsTyping(false);
				console.log("[AIInputField] Typing stopped - proofreading will trigger");
			}, 500);
		}, [onChange]);

		const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
			}

			// Handle Tab to accept completion
			if (e.key === "Tab" && completion && !e.shiftKey) {
				e.preventDefault();
				const newValue = currentText + completion;
				setCurrentText(newValue);
				onChange({
					currentTarget: { value: newValue },
					target: { value: newValue }
				});
				clearCompletion();
				// Update DOM
				if (editorRef.current) {
					editorRef.current.textContent = newValue;
				}
			}

			// Handle Esc to dismiss completion
			if (e.key === "Escape" && completion) {
				e.preventDefault();
				clearCompletion();
			}
		}, [completion, currentText, onChange, clearCompletion]);

		const handlePaste = useCallback((e: React.ClipboardEvent) => {
			e.preventDefault();
			const text = e.clipboardData.getData("text/plain");
			const sanitized = text.replace(/[\r\n]/g, " ");
			document.execCommand("insertText", false, sanitized);
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

			// Update currentText immediately
			setCurrentText(newValue);

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

		return (
			<div style={{ position: "relative", ...style }}>
				<div
					ref={editorRef}
					contentEditable={!disabled}
					suppressContentEditableWarning
					spellCheck={true}
					className={`${styles.editor} ${styles[`size${capitalize(size)}`]} ${error ? styles.error : ""} ${disabled ? styles.disabled : ""} ${className || ""}`}
					style={{
					position: "relative",
					zIndex: showErrors ? 0 : 1,
					color: showErrors ? "transparent" : undefined,
					caretColor: showErrors ? "black" : undefined,
				}}
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
				/>
				{showErrors && (
					<div
						className={`${styles.editor} ${styles[`size${capitalize(size)}`]}`}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							pointerEvents: "none",
							zIndex: 1,
							background: "transparent",
						}}
					>
						{renderTextWithErrors(currentText, errors, handleApplySuggestion)}
					</div>
				)}
				{completion && !showErrors && (
					<div
						className={`${styles.editor} ${styles[`size${capitalize(size)}`]}`}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							pointerEvents: "none",
							zIndex: 1,
							color: "rgba(0, 0, 0, 0.4)",
							whiteSpace: "nowrap",
							overflow: "hidden",
							background: "transparent",
							border: "none",
						}}
					>
						<span style={{ visibility: "hidden" }}>{currentText}</span>
						<span>{completion}</span>
					</div>
				)}
			</div>
		);
	}
);

AIInputField.displayName = "AIInputField";
