"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, Button, Switch, Textarea, Field, DateInput, Link, Avatar, Menu, MenuTrigger, MenuContent, type MenuOption } from "@optiaxiom/react";
import { DetailsPanel, DetailsPanelHeader, DetailsPanelBody, DetailsPanelFooter } from "@optiaxiom/react/unstable";
import {
  IconXmark,
  IconArrowLeft,
  IconThumbtack,
  IconThumbtackSolid,
  IconBell,
  IconCalendar,
  IconArrowsRepeat,
  IconListCheck,
  IconDiagramSubtask,
  IconBoxArchive,
  IconTrashCan,
  IconAngleDown,
  IconComments,
} from "@optiaxiom/icons";
import { useTrayDesign } from "../useTrayDesign";
import type { Task } from "../types";
import { WORKFLOW_TEMPLATES } from "../types";
import { ChecklistDetail } from "./ChecklistDetail";
import { useSessionString, useSessionPin, useSessionApproval } from "../useSessionTasks";

const REPEAT_OPTIONS = ["Daily", "Weekly", "Monthly", "Never"];

function MetaRow({ icon, label, active, children }: { icon: React.ReactNode; label: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="center" gap="12" py="10" borderB="1" borderColor="border.secondary">
      <Box display="inline-flex" alignItems="center" justifyContent="center" color="fg.tertiary">
        {icon}
      </Box>
      <Text flex="1" fontSize="md" color={active ? "fg.default" : "fg.secondary"}>
        {label}
      </Text>
      {children}
    </Box>
  );
}

// Right-hand detail for a selected item. For checklists it shows the full
// grouped checklist; for tasks/notes it shows editable metadata + workflow + note.
export function DetailPanel({ task, autoFocusBody, onBack, onClose, onDelete }: { task: Task; autoFocusBody?: boolean; onBack?: () => void; onClose: () => void; onDelete: (t: Task) => void }) {
  const noteRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocusBody) noteRef.current?.focus();
  }, [autoFocusBody]);
  const [pinned, togglePin] = useSessionPin(task.id);
  const [reminder, setReminder] = useState(false);
  const [dueDate, setDueDate] = useState<string>(task.due ? "2026-07-07" : "");
  const [repeat, setRepeat] = useState<string | null>(null);
  const [note, setNote] = useSessionString(`tracker-note-${task.id}`, "");
  const [workflow, setWorkflow] = useState<string | null>(null);
  const [approval, setApproval] = useSessionApproval(task.id);

  const isChecklist = task.itemType === "checklist";
  const isApproval = task.type === "approval";
  // The Fun design calls it "Toss" (trashcan); other designs "Archive".
  const isFun = useTrayDesign() === "fun";
  // Author of the item — Chat items are Opal-authored (Opal avatar), IM items
  // carry the person's photo/initials. Drives the top attribution line.
  const fromChat = (task.createdIn ?? "Chat") === "Chat";
  const isMe = task.createdBy === "You" || task.avatarName === "You" || task.avatarSrc === "/avatars/avatar-3.png";
  const isOpal = !isMe && !task.avatarSrc && fromChat;
  const actorName = isMe ? "You" : isOpal ? "Opal" : (task.createdBy ?? task.avatarName ?? "Opal");
  const actorSrc = isMe ? "/avatars/avatar-3.png" : task.avatarSrc ?? (isOpal ? "/opal-icon-nav.png" : undefined);
  const attributionAvatar = actorSrc ? (
    <img src={actorSrc} alt="" width={24} height={24} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <Avatar size="xs" colorScheme="purple" name={actorName} />
  );
  const workflowTpl = WORKFLOW_TEMPLATES.find((t) => t.id === workflow);

  const repeatOptions: MenuOption[] = REPEAT_OPTIONS.map((o) => ({
    label: o,
    execute: () => setRepeat(o === "Never" ? null : o),
  }));
  const workflowOptions: MenuOption[] = WORKFLOW_TEMPLATES.map((t) => ({
    label: t.name,
    detail: t.meta,
    addon: <IconDiagramSubtask size="16" />,
    execute: () => setWorkflow(t.id),
  }));

  // Shared metadata configuration — used by both tasks and checklists.
  const configRows = (
    <>
      <MetaRow icon={<IconBell size="18" />} label={reminder ? "9:00 AM tomorrow" : "Remind me"} active={reminder}>
        <Switch checked={reminder} onCheckedChange={setReminder} />
      </MetaRow>

      <MetaRow icon={<IconCalendar size="18" />} label="Due date" active={!!dueDate}>
        <Box style={{ width: 170 }}>
          <DateInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" />
        </Box>
      </MetaRow>

      <MetaRow icon={<IconArrowsRepeat size="18" />} label="Repeat" active={!!repeat}>
        <Menu options={repeatOptions}>
          <MenuTrigger asChild>
            <Button appearance="subtle" size="sm" icon={<IconAngleDown />} iconPosition="end">
              {repeat ?? "Never"}
            </Button>
          </MenuTrigger>
          <MenuContent />
        </Menu>
      </MetaRow>

      <Box py="16">
        <Menu options={workflowOptions}>
          <MenuTrigger asChild>
            <Button appearance="subtle" size="md" icon={<IconDiagramSubtask />} style={{ marginInlineStart: "-6px" }}>
              {workflowTpl ? workflowTpl.name : "Assign workflow"}
            </Button>
          </MenuTrigger>
          <MenuContent />
        </Menu>
        {!workflowTpl && (
          <Text fontSize="sm" color="fg.tertiary" mt="4" pl="32">
            Apply a team process to this task
          </Text>
        )}
      </Box>
    </>
  );

  // Creator + source line — shown below the description/content.
  const createdMeta = (
    <Text fontSize="sm" color="fg.tertiary" pt="4" pb="16">
      Created Jul 7 by {task.createdBy ?? task.vauName ?? "Opal"} in{" "}
      <Link href={(task.createdIn ?? "Chat") === "IM" ? "/opal/messages" : "/opal"}>
        {task.createdIn ?? "Chat"}
      </Link>
    </Text>
  );

  return (
    <DetailsPanel h="full" w="full" bg="bg.default" overflow="hidden">
      <DetailsPanelHeader
        className="planner-detail-header"
        px="16"
        py="12"
        addonBefore={onBack ? <Button appearance="subtle" size="md" aria-label="Back to tasks" icon={<IconArrowLeft />} onClick={onBack} /> : undefined}
        addonAfter={
          <Box display="flex" gap="4" alignItems="center">
            {!isChecklist && (
              <Button
                appearance="subtle"
                size="md"
                aria-label={pinned ? "Unpin" : "Pin"}
                onClick={togglePin}
                icon={pinned ? <IconThumbtackSolid style={{ color: "var(--ax-colors-fg-accent-strong)" }} /> : <IconThumbtack />}
              />
            )}
            <Button appearance="subtle" size="md" aria-label="Close" onClick={onClose} icon={<IconXmark />} />
          </Box>
        }
      >
        <Box display="flex" alignItems="center" gap="8" style={{ minWidth: 0 }}>
          {!onBack && (
            <Box display="inline-flex" color="fg.tertiary" style={{ flexShrink: 0 }}>
              {isChecklist ? <IconListCheck size="20" /> : <IconCalendar size="20" />}
            </Box>
          )}
          <Text fontWeight="500" fontSize="lg" truncate>{task.title}</Text>
        </Box>
      </DetailsPanelHeader>

      <DetailsPanelBody px="24" overflowY="auto">
        {isChecklist ? (
          <>
            <ChecklistDetail task={task} />
            {createdMeta}
            <Box mt="8">{configRows}</Box>
          </>
        ) : (
          <>
            {/* Attribution — who submitted / suggested this */}
            <Box pt="16" display="flex" alignItems="center" gap="8">
              {attributionAvatar}
              <Text fontSize="md" color="fg.secondary" flex="1" style={{ minWidth: 0 }}>
                <Text asChild fontWeight="500" color="fg.default"><span>{actorName}</span></Text>{" "}
                {isApproval ? "submitted work for review." : "suggested to follow up on this."}
              </Text>
            </Box>

            {/* Summary + more info — carried over from the card, read-only */}
            {task.preview ? (
              <Box mt="12" rounded="md" px="12" py="12" display="flex" flexDirection="column" gap="8" style={{ background: "#f9fcf8" }}>
                <Text fontSize="md" fontWeight="500" color="fg.default">
                  {task.preview.emoji ? `${task.preview.emoji} ` : ""}{task.preview.title}
                </Text>
                <Text fontSize="md" color="fg.secondary">{task.preview.body}</Text>
                {task.preview.contents && task.preview.contents.length > 0 && (
                  <Box mt="4" display="flex" flexDirection="column" gap="6">
                    <Text fontFamily="mono" fontSize="xs" fontWeight="400" color="fg.tertiary" textTransform="uppercase">Contents</Text>
                    <Box display="flex" flexDirection="column" gap="4">
                      {task.preview.contents.map((c, i) => (
                        <Text key={i} fontSize="md" color="fg.secondary">{i + 1}. {c}</Text>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : task.description ? (
              <Text mt="12" fontSize="md" color="fg.secondary">{task.description}</Text>
            ) : null}

            {task.previewImage && (
              <Box mt="12" rounded="md" overflow="hidden" border="1" borderColor="border.secondary" style={{ flexShrink: 0 }}>
                <img src={task.previewImage} alt="" style={{ display: "block", width: "100%", height: "auto" }} />
              </Box>
            )}

            <Box mt="12">
              <Link href={fromChat ? "/opal" : "/opal/messages"}>
                {isApproval ? "View work →" : "View conversation →"}
              </Link>
            </Box>

            {/* Approval actions */}
            {isApproval && (
              <Box pt="16">
                {approval === "pending" ? (
                  <Box display="flex" gap="8">
                    <Button appearance="primary" size="md" onClick={() => setApproval("approved")}>Approve</Button>
                    <Button appearance="subtle" size="md" onClick={() => setApproval("rejected")}>Request change</Button>
                  </Box>
                ) : (
                  <Text fontSize="md" fontWeight="500" color={approval === "approved" ? "fg.success" : "fg.error"}>
                    {approval === "approved" ? "Approved" : "Change requested"}
                  </Text>
                )}
              </Box>
            )}

            {/* Note — separate editable field */}
            <Box pt="16">
              <Field label="Note">
                <Textarea ref={noteRef} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" rows={4} />
              </Field>
            </Box>
            <Box pt="4">{createdMeta}</Box>
            {configRows}
          </>
        )}
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
