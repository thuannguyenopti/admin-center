"use client";

import React, { forwardRef, useRef, useImperativeHandle, useCallback, useLayoutEffect, useState, useEffect } from "react";
import type { TextareaProps } from "@optiaxiom/react";
import { useProofreading } from "./useProofreading";
import { useAutoComplete } from "./useAutoComplete";
import { getCursorOffset, setCursorOffset } from "./utils/cursorUtils";
import type { GrammarError } from "./ProofreadingProvider";
import { renderTextWithErrors } from "./utils/renderTextWithErrors";
import styles from "./AITextArea.module.css";

export interface AITextAreaProps extends Omit<TextareaProps, "onChange" | "value" | "resize" | "onInput" | "onKeyDown" | "onPaste" | "onFocus"> {
	value: string;
	onChange: (e: { currentTarget: { value: string }; target: { value: string } }) => void;
	placeholder?: string;
	disabled?: boolean;
	error?: boolean;
	rows?: number;
	resize?: "none" | "vertical" | "horizontal" | "both";
	enableGrammarCheck?: boolean;
	enableAutoComplete?: boolean;
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
				console.log("[AITextArea] User stopped typing - enabling proofreading for:", currentText);
				setTextToCheck(currentText);
			} else if (isTyping && textToCheck !== "") {
				console.log("[AITextArea] User is typing - clearing proofreading text");
				setTextToCheck("");
			}
		}, [isTyping, currentText, enableGrammarCheck]);

		// Debug: Log when proofreading is triggered
		useEffect(() => {
			if (textToCheck && textToCheck.trim().length > 0) {
				console.log("[AITextArea] Proofreading triggered:", { textToCheck, errorCount: errors.length, errors });
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

			// Update current text immediately for proofreading later
			setCurrentText(newValue);

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

			// Set timeout to mark typing as complete and trigger proofreading
			typingTimeoutRef.current = setTimeout(() => {
				isUserTypingRef.current = false;
				setIsTyping(false);
				console.log("[AITextArea] Typing stopped - proofreading will trigger");
			}, 500);
		}, [onChange]);

		const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
			// Handle Tab to accept completion
			if (e.key === "Tab" && completion && !e.shiftKey) {
				e.preventDefault();
				// Add space if needed before appending completion
				const needsSpace = currentText && !currentText.endsWith(" ") && !completion.startsWith(" ");
				const newValue = currentText + (needsSpace ? " " : "") + completion;
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
		const resizeClass = styles[`resize${capitalize(resize)}`] || styles.resizeVertical;

		const minHeight = rows * 24;

		return (
			<div style={{ position: "relative", ...style, minHeight: `${minHeight}px` }}>
				<div
					ref={editorRef}
					contentEditable={!disabled}
					suppressContentEditableWarning
					spellCheck={true}
					className={`${styles.editor} ${resizeClass} ${error ? styles.error : ""} ${disabled ? styles.disabled : ""} ${className || ""}`}
					style={{
					position: "relative",
					minHeight: `${minHeight}px`,
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
					aria-multiline="true"
					aria-disabled={disabled}
					aria-invalid={error}
				/>
				{showErrors && (
					<div
						className={`${styles.editor} ${resizeClass}`}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							pointerEvents: "none",
							zIndex: 1,
							background: "transparent",
							minHeight: `${minHeight}px`,
						}}
					>
						{renderTextWithErrors(currentText, errors, handleApplySuggestion)}
					</div>
				)}
				{completion && !showErrors && (
					<div
						className={`${styles.editor} ${resizeClass}`}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							pointerEvents: "none",
							zIndex: 1,
							color: "rgba(0, 0, 0, 0.4)",
							whiteSpace: "pre-wrap",
							overflow: "hidden",
							minHeight: `${minHeight}px`,
							background: "transparent",
							border: "none",
						}}
					>
						<span style={{ visibility: "hidden" }}>{currentText}</span>
						<span>
							{/* Add space if current text doesn't end with space and completion doesn't start with space */}
							{currentText && !currentText.endsWith(" ") && !completion.startsWith(" ") ? " " : ""}
							{completion}
						</span>
					</div>
				)}
			</div>
		);
	}
);

AITextArea.displayName = "AITextArea";
