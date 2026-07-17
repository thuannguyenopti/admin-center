import { useRef } from "react";
import * as Y from "yjs";

export type CollabDoc = {
  ydoc: Y.Doc;
  /** XML fragment that Tiptap's Collaboration extension binds to */
  xmlFragment: Y.XmlFragment;
  /** Plain-text fragment that CodeMirror / y-codemirror.next binds to */
  ytext: Y.Text;
};

/**
 * Creates a stable shared Yjs document for the lifetime of the component.
 * Both Tiptap (xmlFragment) and CodeMirror (ytext) bind to the same ydoc,
 * so content is preserved when switching between WYSIWYG and Source modes.
 *
 * Pass `initialContent` to pre-seed the source editor on first mount.
 */
export function useCollabDoc(initialContent?: string): CollabDoc {
  const ref = useRef<CollabDoc | null>(null);

  if (!ref.current) {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("codemirror");
    if (initialContent && ytext.toString() === "") {
      ytext.insert(0, initialContent);
    }
    ref.current = {
      ydoc,
      xmlFragment: ydoc.getXmlFragment("prosemirror"),
      ytext,
    };
  }

  return ref.current;
}
