/**
 * Utilities for managing cursor position in contentEditable elements
 */

/**
 * Get the current cursor position as a character offset from the start of the contentEditable element
 * @param element The contentEditable element
 * @returns Character offset, or 0 if no selection
 */
export function getCursorOffset(element: HTMLElement): number {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return 0;

	const range = sel.getRangeAt(0);
	const preCaretRange = range.cloneRange();
	preCaretRange.selectNodeContents(element);
	preCaretRange.setEnd(range.endContainer, range.endOffset);

	return preCaretRange.toString().length;
}

/**
 * Set the cursor position to a specific character offset
 * @param element The contentEditable element
 * @param offset Character offset from start
 */
export function setCursorOffset(element: HTMLElement, offset: number): void {
	const range = document.createRange();
	const sel = window.getSelection();

	let charCount = 0;
	let found = false;

	// Walk through all text nodes to find the position
	const walker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_TEXT,
		null
	);

	let node: Node | null = walker.nextNode();
	while (node) {
		const textNode = node as Text;
		const textLength = textNode.length;

		if (charCount + textLength >= offset) {
			// Found the node containing our offset
			const nodeOffset = offset - charCount;
			range.setStart(textNode, Math.min(nodeOffset, textLength));
			range.collapse(true);
			found = true;
			break;
		}

		charCount += textLength;
		node = walker.nextNode();
	}

	if (!found && charCount < offset) {
		// Offset is beyond all text, place at end
		const lastNode = walker.currentNode as Text | null;
		if (lastNode) {
			range.setStart(lastNode, lastNode.length);
			range.collapse(true);
		}
	}

	sel?.removeAllRanges();
	sel?.addRange(range);
}

/**
 * Get the current selection range (start and end offsets)
 * @param element The contentEditable element
 * @returns Object with start and end offsets
 */
export function getSelectionRange(element: HTMLElement): { start: number; end: number } {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) {
		return { start: 0, end: 0 };
	}

	const range = sel.getRangeAt(0);
	const preCaretRange = range.cloneRange();
	preCaretRange.selectNodeContents(element);
	preCaretRange.setEnd(range.startContainer, range.startOffset);
	const start = preCaretRange.toString().length;

	preCaretRange.setEnd(range.endContainer, range.endOffset);
	const end = preCaretRange.toString().length;

	return { start, end };
}
