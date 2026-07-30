"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, Button, Tooltip, Link } from "@optiaxiom/react";
import { DetailsPanel, DetailsPanelHeader, DetailsPanelBody, DetailsPanelFooter } from "@optiaxiom/react/unstable";
import {
  IconXmark,
  IconArrowLeft,
  IconThumbtack,
  IconThumbtackSolid,
  IconBoxArchive,
  IconTrashCan,
  IconFileLines,
  IconBold,
  IconItalic,
  IconListUl,
  IconListCheck,
  IconHeading,
  IconPaperclip,
  IconSparkles,
  IconComments,
} from "@optiaxiom/icons";
import type { Task } from "../types";
import { useSessionString, useSessionPin } from "../useSessionTasks";
import { useTrayDesign } from "../useTrayDesign";

// Note editor — a lightweight rich surface (Notion / Apple Notes / Keep style)
// for note-type items: text formatting, checklists, attachments, and Ask Opal.
// The body uses a contentEditable region (no Axiom rich-text primitive exists);
// the surrounding chrome is all Axiom.
export function NoteEditor({ task, autoFocusBody, onBack, onClose, onDelete }: { task: Task; autoFocusBody?: boolean; onBack?: () => void; onClose: () => void; onDelete: (t: Task) => void }) {
  const [pinned, togglePin] = useSessionPin(task.id);
  const isFun = useTrayDesign() === "fun";
  const [title, setTitle] = useSessionString(`tracker-title-${task.id}`, task.title);
  const [attachments, setAttachments] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const [body, setBody] = useSessionString(`tracker-note-${task.id}`, "");

  // Restore saved body once on mount, then focus if requested.
  useEffect(() => {
    if (editorRef.current && body) editorRef.current.innerHTML = body;
    if (autoFocusBody) editorRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    if (editorRef.current) setBody(editorRef.current.innerHTML);
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    save();
  };

  const insertChecklist = () => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, '<div class="note-todo"><input type="checkbox" />&nbsp;</div>');
    save();
  };

  const askOpal = () => {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      '<p><span class="note-ai">✨ Opal:</span> Here’s a quick summary of your note with suggested next steps…</p>',
    );
    save();
  };

  const addAttachment = () => setAttachments((prev) => [...prev, `Attachment ${prev.length + 1}.png`]);

  const tools: { key: string; icon: React.ReactNode; label: string; onClick: () => void }[] = [
    { key: "bold", icon: <IconBold size={16} />, label: "Bold", onClick: () => exec("bold") },
    { key: "italic", icon: <IconItalic size={16} />, label: "Italic", onClick: () => exec("italic") },
    { key: "heading", icon: <IconHeading size={16} />, label: "Heading", onClick: () => exec("formatBlock", "h3") },
    { key: "bullet", icon: <IconListUl size={16} />, label: "Bulleted list", onClick: () => exec("insertUnorderedList") },
    { key: "checklist", icon: <IconListCheck size={16} />, label: "Checklist", onClick: insertChecklist },
    { key: "attach", icon: <IconPaperclip size={16} />, label: "Attach", onClick: addAttachment },
  ];

  return (
    <DetailsPanel h="full" w="full" bg="bg.default" overflow="hidden">
      <DetailsPanelHeader
        className="planner-detail-header"
        px="16"
        py="12"
        addonBefore={onBack ? <Button appearance="subtle" size="md" aria-label="Back to tasks" icon={<IconArrowLeft />} onClick={onBack} /> : undefined}
        addonAfter={
          <Box display="flex" gap="4" alignItems="center">
            <Button
              appearance="subtle"
              size="md"
              aria-label={pinned ? "Unpin" : "Pin"}
              onClick={togglePin}
              icon={pinned ? <IconThumbtackSolid style={{ color: "var(--ax-colors-fg-accent-strong)" }} /> : <IconThumbtack />}
            />
            <Button appearance="subtle" size="md" aria-label="Close" onClick={onClose} icon={<IconXmark />} />
          </Box>
        }
      >
        <Box display="flex" alignItems="center" gap="8" style={{ minWidth: 0 }}>
          {!onBack && (
            <Box display="inline-flex" color="fg.warning" style={{ flexShrink: 0 }}>
              <IconFileLines size="20" />
            </Box>
          )}
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Note title" className="note-title-input" />
        </Box>
      </DetailsPanelHeader>

      <DetailsPanelBody p="0" overflowY="auto">
        {/* Formatting toolbar */}
        <Box display="flex" alignItems="center" gap="2" px="12" py="8" borderB="1" borderColor="border.secondary" bg="bg.default" style={{ flexWrap: "wrap", position: "sticky", top: 0, zIndex: 10 }}>
          {tools.map((t) => (
            <Tooltip key={t.key} content={t.label}>
              <Button appearance="subtle" size="sm" aria-label={t.label} icon={t.icon} onClick={t.onClick} />
            </Tooltip>
          ))}
          <Box style={{ width: 1, height: 20, background: "var(--ax-colors-border-secondary)" }} mx="4" />
          <Button appearance="subtle" size="sm" icon={<IconSparkles size={16} style={{ color: "var(--ax-colors-fg-accent-strong)" }} />} onClick={askOpal}>
            Ask Opal
          </Button>
        </Box>

        <Box px="16" py="16">
          <Box
            ref={editorRef}
            className="note-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={save}
            data-placeholder="Start writing…"
            style={{ minHeight: 200, outline: "none", fontSize: 14, lineHeight: 1.6, color: "var(--ax-colors-fg-default)" }}
          />

          {attachments.length > 0 && (
            <Box display="flex" flexDirection="column" gap="6" mt="16">
              {attachments.map((name, i) => (
                <Box key={i} display="flex" alignItems="center" gap="8" px="10" py="8" rounded="md" border="1" borderColor="border.secondary" bg="bg.page">
                  <Box display="inline-flex" color="fg.tertiary">
                    <IconPaperclip size={14} />
                  </Box>
                  <Text flex="1" fontSize="xs" color="fg.default" truncate>
                    {name}
                  </Text>
                  <Button appearance="subtle" size="sm" aria-label="Remove" icon={<IconXmark size={12} />} onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} />
                </Box>
              ))}
            </Box>
          )}

          <Text fontSize="sm" color="fg.tertiary" mt="16">
            Created Jul 7 by {task.createdBy ?? task.vauName ?? "Opal"} in{" "}
            <Link href={(task.createdIn ?? "Chat") === "IM" ? "/opal/messages" : "/opal"}>
              {task.createdIn ?? "Chat"}
            </Link>
          </Text>
        </Box>
      </DetailsPanelBody>

      <DetailsPanelFooter px="16" py="12" alignItems="center">
        <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
          <Button appearance="danger-outline" size="sm" onClick={() => onDelete(task)} icon={isFun ? <IconTrashCan /> : <IconBoxArchive />}>
            {isFun ? "Toss" : "Archive"}
          </Button>
          <Button appearance="default" size="sm" icon={<IconComments />}>
            Message
          </Button>
        </Box>
      </DetailsPanelFooter>
    </DetailsPanel>
  );
}
