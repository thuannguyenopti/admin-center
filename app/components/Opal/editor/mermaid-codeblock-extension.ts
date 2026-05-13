/**
 * Tiptap node view that renders a CodeBlock with `language="mermaid"` as
 * a Mermaid SVG diagram. Other languages fall through to the lowlight
 * syntax-highlighted rendering from CodeBlockLowlight.
 *
 * Extends CodeBlockLowlight (not CodeBlock) so non-mermaid fenced code
 * blocks still get full syntax highlighting via lowlight.
 *
 * The node view never mutates the document directly. The pencil button
 * fires a DOM-level `mermaid-edit-request` CustomEvent (bubbles + composed
 * so it crosses shadow-DOM boundaries) carrying { from, to, source }. The
 * host can listen, open an edit dialog, and on Save dispatch a single
 * ProseMirror transaction that replaces the block's children.
 *
 * The renderer is dynamically imported (see mermaid-renderer.ts), so docs
 * without Mermaid pay no bundle cost.
 */

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import type { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import {
  renderMermaid,
  getThemeGeneration,
} from './mermaid-renderer';

export interface MermaidEditRequestDetail {
  from: number;
  to: number;
  source: string;
}

const RENDER_DEBOUNCE_MS = 250;

const PENCIL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 20h9"/>
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
</svg>`;

function buildNodeView(props: NodeViewRendererProps) {
  const { node, editor, getPos } = props;
  let currentNode = node;

  const dom = document.createElement('div');
  dom.className = 'me-mermaid-block';
  dom.setAttribute('data-mermaid', 'true');
  dom.contentEditable = 'false';

  const renderArea = document.createElement('div');
  renderArea.className = 'me-mermaid-render';
  renderArea.setAttribute('part', 'mermaid-render');
  renderArea.textContent = 'Loading diagram…';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'me-mermaid-edit-btn';
  editBtn.setAttribute('part', 'mermaid-edit-btn');
  editBtn.setAttribute('aria-label', 'Edit Mermaid source');
  editBtn.title = 'Edit source';
  editBtn.innerHTML = PENCIL_SVG;

  // ProseMirror would otherwise interpret a click on a non-editable
  // element as "select node" and steal focus before our click handler.
  editBtn.addEventListener('mousedown', (e) => e.preventDefault());
  editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = typeof getPos === 'function' ? getPos() : null;
    if (pos == null) return;
    const from = pos;
    const to = pos + currentNode.nodeSize;
    const detail: MermaidEditRequestDetail = {
      from,
      to,
      source: currentNode.textContent,
    };
    dom.dispatchEvent(
      new CustomEvent<MermaidEditRequestDetail>('mermaid-edit-request', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  });

  const updateEditableUI = () => {
    editBtn.style.display = editor.isEditable ? '' : 'none';
  };
  updateEditableUI();
  editor.on('update', updateEditableUI);
  editor.on('transaction', updateEditableUI);

  dom.appendChild(renderArea);
  dom.appendChild(editBtn);

  let renderTimer: ReturnType<typeof setTimeout> | null = null;
  let renderSeq = 0;
  let lastRenderedSource = ' '; // sentinel that won't match any real source
  let lastRenderedThemeGen = -1;

  function scheduleRender(immediate: boolean): void {
    if (renderTimer) clearTimeout(renderTimer);
    const run = () => {
      const seq = ++renderSeq;
      const code = currentNode.textContent;
      const themeGen = getThemeGeneration();
      lastRenderedSource = code;
      lastRenderedThemeGen = themeGen;
      renderMermaid(code).then((out) => {
        if (seq !== renderSeq) return; // superseded
        renderArea.replaceChildren();
        if (out.ok) {
          renderArea.classList.remove('me-mermaid-error');
          renderArea.appendChild(out.svg);
        } else {
          renderArea.classList.add('me-mermaid-error');
          const err = document.createElement('pre');
          err.className = 'me-mermaid-error-text';
          err.textContent = out.message;
          renderArea.appendChild(err);
        }
      });
    };
    if (immediate) run();
    else renderTimer = setTimeout(run, RENDER_DEBOUNCE_MS);
  }

  scheduleRender(/*immediate*/ true);

  return {
    dom,
    // contentDOM is omitted — the rendered SVG is the entire visible
    // representation; source is edited through the modal dialog.
    update(updatedNode: typeof node) {
      if (updatedNode.type !== currentNode.type) return false;
      if (updatedNode.attrs.language !== 'mermaid') return false;
      const sourceChanged = updatedNode.textContent !== lastRenderedSource;
      const themeChanged = getThemeGeneration() !== lastRenderedThemeGen;
      currentNode = updatedNode;
      if (sourceChanged || themeChanged) {
        scheduleRender(/*immediate*/ false);
      }
      return true;
    },
    ignoreMutation() {
      return true;
    },
    selectNode() {
      dom.classList.add('me-mermaid-selected');
    },
    deselectNode() {
      dom.classList.remove('me-mermaid-selected');
    },
    destroy() {
      if (renderTimer) clearTimeout(renderTimer);
      editor.off('update', updateEditableUI);
      editor.off('transaction', updateEditableUI);
    },
  };
}

/**
 * CodeBlockLowlight extended with a Mermaid-aware node view.
 * - language="mermaid" → renders SVG via the node view
 * - other languages    → delegates to lowlight's syntax-highlighted view
 */
export const MermaidCodeBlock = CodeBlockLowlight.extend({
  addNodeView(): NodeViewRenderer {
    // In Tiptap's extend() system, this.parent inside an overridden method
    // IS the parent's implementation of that same method (not the extension
    // object). Calling it gives us the lowlight node view renderer so
    // non-mermaid blocks still get full syntax highlighting.
    const parentNodeView = this.parent ? this.parent.call(this) : null;

    return (props: NodeViewRendererProps) => {
      if (props.node.attrs.language === 'mermaid') {
        return buildNodeView(props);
      }
      if (parentNodeView) {
        return parentNodeView(props);
      }
      return null as unknown as ReturnType<NodeViewRenderer>;
    };
  },
});
