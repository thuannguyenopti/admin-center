import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export type CollabCursor = {
  id: string;
  name: string;
  color: string;
  position: number;
};

export const collabCursorKey = new PluginKey<{ cursors: CollabCursor[]; decorations: DecorationSet }>('collab-cursor');

function createCursorDOM(cursor: CollabCursor): HTMLElement {
  const wrapper = document.createElement('span');
  wrapper.style.cssText = 'position: relative; display: inline; pointer-events: none; user-select: none;';

  const caret = document.createElement('span');
  caret.style.cssText = `
    display: inline-block;
    position: absolute;
    width: 2px;
    height: 1.3em;
    background: ${cursor.color};
    left: 0;
    top: 0;
    transform: translateX(-1px);
    animation: collab-blink 1.1s ease-in-out infinite;
    border-radius: 1px;
  `;

  const label = document.createElement('span');
  label.textContent = cursor.name;
  label.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 0;
    background: ${cursor.color};
    color: #fff;
    padding: 1px 5px 2px;
    border-radius: 3px 3px 3px 0;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    line-height: 1.6;
    letter-spacing: 0.01em;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  `;

  wrapper.appendChild(caret);
  wrapper.appendChild(label);
  return wrapper;
}

function buildDecorations(doc: Parameters<typeof DecorationSet.create>[0], cursors: CollabCursor[]): DecorationSet {
  const maxPos = doc.content.size;
  const widgets = cursors
    .filter(c => c.position > 0 && c.position < maxPos)
    .map(c =>
      Decoration.widget(c.position, () => createCursorDOM(c), {
        key: `cursor-${c.id}`,
        side: 1,
      })
    );
  return DecorationSet.create(doc, widgets);
}

export function createCollabCursorPlugin(initialCursors: CollabCursor[]): Plugin {
  return new Plugin({
    key: collabCursorKey,
    state: {
      init(_, { doc }) {
        return { cursors: initialCursors, decorations: buildDecorations(doc, initialCursors) };
      },
      apply(tr, prev) {
        const meta = tr.getMeta(collabCursorKey) as CollabCursor[] | undefined;
        const cursors = meta ?? prev.cursors;
        if (!tr.docChanged && !meta) return prev;
        return { cursors, decorations: buildDecorations(tr.doc, cursors) };
      },
    },
    props: {
      decorations(state) {
        return collabCursorKey.getState(state)?.decorations ?? DecorationSet.empty;
      },
    },
  });
}
