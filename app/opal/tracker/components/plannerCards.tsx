"use client";

import { useState } from "react";
import { Box, Text, Avatar, Badge, Checkbox, Button } from "@optiaxiom/react";
import { IconBell, IconComments, IconFileLines, IconTrashCan } from "@optiaxiom/icons";
import type { Task } from "../types";
import { RowPin, LeadingSlot } from "./cards";
import { useSessionDone } from "../useSessionTasks";

// ── Rich tray design (Option 1) ───────────────────────────────────────────────
// Avatar-led cards with a rounded accent bar, a subtle content-block preview,
// embedded images, and a badge + comment-count footer. Mirrors the Figma
// "Planner — List" section. Flat rows and checklist cards keep their checkboxes.
//
// Colours are taken straight from the Figma file (colors/fg/feedback/*): the app's
// V3 `bg.success` token renders lime, which does not match the design — so the
// accent bar and content block use the design's exact green/orange values.
const FIGMA_GREEN = "#3ab533"; // agent "working" status dot only
const FIGMA_BLOCK_BG = "#f9fcf8"; // colors/bg/page-bg — the subtle block tint

// Left accent bar — flush to the card's left edge, full height. Encodes item
// TYPE via Axiom semantic tokens (no custom colors): notes = border.control,
// to-dos/everything else = fg.information. (The card clips it to its corners.)
function AccentBar({ task }: { task: Task }) {
  const isNote = task.itemType === "note";
  return (
    <Box
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        background: isNote ? "var(--ax-colors-border-control)" : "var(--ax-colors-fg-information)",
      }}
    />
  );
}

// Two-line clamp for descriptions / block bodies.
const clamp2 = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
};

// How the card is "cleared". "flip": avatar flips to a completion checkbox on
// hover (default). "toss": no flip — a hover-revealed Toss button crumples the
// card into the footer trash can (the "good to go" design).
export type CardInteraction = "flip" | "toss";

// Leading avatar (or bell) that flips to a completion checkbox on row hover, and
// stays a checkbox once checked. The swap is driven by CSS in app/opal/styles.css
// (.planner-lead / :hover / .is-done). In "toss" mode it stays a plain avatar.
function Lead({ visual, done, setDone, interaction = "flip" }: { visual: React.ReactNode; done: boolean; setDone: (v: boolean) => void; interaction?: CardInteraction }) {
  if (interaction === "toss") {
    return <Box style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>{visual}</Box>;
  }
  return (
    <Box className={done ? "planner-lead is-done" : "planner-lead"} style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
      <Box className="planner-lead-avatar">{visual}</Box>
      <Box className="planner-lead-check" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={done} onCheckedChange={(v) => setDone(v === true)} aria-label="Complete" />
      </Box>
    </Box>
  );
}

// Cards created in Chat are Opal-authored → show the Opal avatar. Cards from IM
// show the person's photo (rendered like the IM sidebar: raw img + object-fit
// cover, so it stays crisp). People without a photo fall back to purple initials.
function CardAvatar({ task, size = 32 }: { task: Task; size?: number }) {
  const fromChat = (task.createdIn ?? "Chat") === "Chat";
  // Explicit avatar (VAU / me / person photo) wins; otherwise Chat items get Opal.
  const src = task.avatarSrc ?? (fromChat ? "/opal-icon-nav.png" : undefined);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return <Avatar size={size <= 20 ? "xs" : "md"} colorScheme="purple" name={task.avatarName ?? task.title} />;
}

function BellVisual() {
  return (
    <Box display="inline-flex" alignItems="center" justifyContent="center" rounded="full" bg="bg.secondary" color="fg.tertiary" style={{ width: 32, height: 32 }}>
      <IconBell size={16} />
    </Box>
  );
}

function DueDate({ task }: { task: Task }) {
  if (!task.due) return null;
  return (
    <Text fontSize="sm" color={task.overdue ? "fg.warning.strong" : "fg.secondary"} style={{ flexShrink: 0 }}>
      {task.due}
    </Text>
  );
}

function CardShell({ task, onSelect, interaction = "flip", onToss, children }: { task: Task; onSelect: () => void; interaction?: CardInteraction; onToss?: (t: Task) => void; children: React.ReactNode }) {
  const [tossing, setTossing] = useState(false);
  const isToss = interaction === "toss";
  const hasBody = Boolean(task.description || task.preview || task.previewImage || task.checklistGroups?.length);
  // Empty (title-only) toss cards collapse to a single compact row — no reserved
  // height; the pin + Toss sit side-by-side, vertically centered on the right.
  const compact = isToss && !hasBody;
  const doToss = (e: React.MouseEvent) => { e.stopPropagation(); setTossing(true); };
  return (
    <Box
      className={`tracker-row planner-card${isToss ? " planner-card-toss" : ""}${tossing ? " fun-crumpling" : ""}`}
      rounded="md"
      py="12"
      // Toss cards ("good to go") are discrete cards on the secondary bg → full
      // border; flip cards ("rich") are divider rows → bottom border only.
      border={isToss ? "1" : undefined}
      borderB={isToss ? undefined : "1"}
      borderColor="border.secondary"
      overflow="hidden"
      onClick={tossing ? undefined : onSelect}
      onAnimationEnd={() => { if (tossing) onToss?.(task); }}
      // Cards WITH a body reserve enough height that the bottom-right Toss button
      // never collides with the pin at the first description line. Empty cards
      // size to their single title row.
      style={{ cursor: "pointer", position: "relative", paddingLeft: 20, paddingRight: 12, ...(isToss && hasBody ? { minHeight: 140 } : {}) }}
    >
      <AccentBar task={task} />
      {/* Hover pin — aligned to the first description line for cards with a body,
          centered for empty flip cards. Empty toss cards render the pin inside
          the compact action group below instead. */}
      {hasBody ? <RowPin id={task.id} top={44} /> : compact ? null : <RowPin id={task.id} center />}
      {isToss && (
        compact ? (
          // Empty toss card — pin + Toss together, vertically centered on the right.
          <Box className="fun-doc-actions" style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4, zIndex: 2 }}>
            <RowPin id={task.id} inline />
            <Button className="fun-done-btn" appearance="danger-outline" size="sm" icon={<IconTrashCan />} onClick={doToss}>Toss</Button>
          </Box>
        ) : (
          // "Good to go" — hover reveals a Toss button (bottom-right) that crumples
          // the card into the footer bin, in place of the checkbox flip.
          <Box className="fun-doc-actions" style={{ position: "absolute", bottom: 12, right: 12, zIndex: 2 }}>
            <Button className="fun-done-btn" appearance="danger-outline" size="sm" icon={<IconTrashCan />} onClick={doToss}>Toss</Button>
          </Box>
        )
      )}
      {children}
    </Box>
  );
}

// ── Rich card (follow-up / campaign) ──────────────────────────────────────────

export function RichPlannerCard({ task, onSelect, interaction = "flip", onToss }: { task: Task; onSelect: () => void; interaction?: CardInteraction; onToss?: (t: Task) => void }) {
  const [done, setDone] = useSessionDone(task.id);
  return (
    <CardShell task={task} onSelect={onSelect} interaction={interaction} onToss={onToss}>
      <Box display="flex" gap="12" alignItems={done ? "center" : "start"}>
        <Lead done={done} setDone={setDone} interaction={interaction} visual={task.reminder ? <BellVisual /> : <CardAvatar task={task} />} />

        <Box flex="1" display="flex" flexDirection="column" gap="6" style={{ minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap="8">
            <Text className="planner-card-title" flex="1" fontSize="md" fontWeight="500" color={done ? "fg.tertiary" : "fg.default"} truncate style={{ textDecoration: done ? "line-through" : "none" }}>
              {task.title}
            </Text>
            {!done && <DueDate task={task} />}
          </Box>

          {/* When completed, the card collapses to just the checkbox + title. */}
          {!done && task.preview && (
            <Box rounded="md" px="12" py="8" display="flex" flexDirection="column" gap="4" style={{ background: FIGMA_BLOCK_BG }}>
              <Text fontSize="sm" fontWeight="500" color="fg.default">
                {task.preview.emoji ? `${task.preview.emoji} ` : ""}{task.preview.title}
              </Text>
              <Text fontSize="sm" color="fg.secondary" style={clamp2}>
                {task.preview.body}
              </Text>
            </Box>
          )}

          {!done && task.description && !task.preview && (
            <Text fontSize="sm" color="fg.tertiary" style={clamp2}>
              {task.description}
            </Text>
          )}

          {!done && task.previewImage && (
            <Box rounded="md" overflow="hidden" border="1" borderColor="border.secondary" style={{ maxWidth: 244 }}>
              <img src={task.previewImage} alt="" style={{ display: "block", width: "100%", height: "auto" }} />
            </Box>
          )}

          {/* Agent status sits below the description. */}
          {task.type === "agent" && task.vauName && !done && (
            <Box display="flex" alignItems="center" gap="6">
              <Box rounded="full" style={{ width: 6, height: 6, flexShrink: 0, background: FIGMA_GREEN }} />
              <Text fontSize="sm" fontWeight="500" style={{ color: FIGMA_GREEN }}>{task.vauName} working</Text>
            </Box>
          )}

          {!done && <CardFooter task={task} />}
        </Box>
      </Box>
    </CardShell>
  );
}

// Badge + comment count, or a small avatar for reminder items (per the Figma).
function CardFooter({ task }: { task: Task }) {
  if (task.reminder) {
    return (
      <Box display="flex" alignItems="center">
        <Avatar size="xs" colorScheme="purple" name={task.avatarName ?? "You"} {...(task.avatarSrc ? { src: task.avatarSrc } : {})} />
      </Box>
    );
  }
  // Threads only make sense for items from a conversation (IM); Opal-authored
  // (Chat) cards don't show the thread count.
  const fromChat = (task.createdIn ?? "Chat") === "Chat";
  const showComments = !fromChat && task.commentCount != null;
  if (!task.badgeLabel && !showComments) return null;
  return (
    <Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
      {task.badgeLabel && (
        <Badge intent={task.badgeIntent ?? "neutral"} variant="subtle">
          {task.badgeLabel}
        </Badge>
      )}
      {showComments && (
        <Box display="flex" alignItems="center" gap="4" color="fg.tertiary">
          <IconComments size={16} />
          <Text fontSize="sm" color="fg.tertiary">{task.commentCount}</Text>
        </Box>
      )}
    </Box>
  );
}

// ── Note card (file icon, no checkbox — notes aren't "completed") ─────────────

export function NotePlannerCard({ task, onSelect, interaction = "flip", onToss }: { task: Task; onSelect: () => void; interaction?: CardInteraction; onToss?: (t: Task) => void }) {
  // One-line notes center the icon + title + pin on a single row; notes with a
  // body top-align them.
  return (
    <CardShell task={task} onSelect={onSelect} interaction={interaction} onToss={onToss}>
      <Box display="flex" gap="12" alignItems={task.description ? "start" : "center"}>
        <Box color="fg.warning" display="inline-flex" alignItems="center" justifyContent="center" style={{ width: 32, height: 32, flexShrink: 0 }}>
          <IconFileLines size={18} />
        </Box>
        <Box flex="1" display="flex" flexDirection="column" gap="6" style={{ minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap="8">
            <Text flex="1" fontSize="md" fontWeight="500" color="fg.default" truncate>{task.title}</Text>
            <DueDate task={task} />
          </Box>
          {task.description && (
            <Text fontSize="sm" color="fg.tertiary" style={clamp2}>{task.description}</Text>
          )}
        </Box>
      </Box>
    </CardShell>
  );
}

// ── Flat row (actionable task, leading checkbox) ──────────────────────────────

export function FlatPlannerRow({ task, onSelect }: { task: Task; onSelect: () => void }) {
  const [done, setDone] = useState(false);
  const isAgent = task.type === "agent";
  const multiLine = Boolean(task.badgeLabel || isAgent);
  return (
    <CardShell task={task} onSelect={onSelect}>
      <Box display="flex" gap="12" alignItems={multiLine ? "start" : "center"}>
        <LeadingSlot onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={done} onCheckedChange={setDone} aria-label="Complete" />
        </LeadingSlot>
        <Box flex="1" display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap="8">
            <Text flex="1" fontSize="md" color={done ? "fg.tertiary" : "fg.default"} truncate style={{ textDecoration: done ? "line-through" : "none" }}>
              {task.title}
            </Text>
            <DueDate task={task} />
          </Box>
          {isAgent && !done && (
            <Box display="flex" alignItems="center" gap="6">
              <Box rounded="full" style={{ width: 6, height: 6, flexShrink: 0, background: FIGMA_GREEN }} />
              <Text fontSize="sm" fontWeight="500" style={{ color: FIGMA_GREEN }}>{task.vauName} working</Text>
            </Box>
          )}
          {task.badgeLabel && (
            <Box display="flex" alignItems="center">
              <Badge intent={task.badgeIntent ?? "neutral"} variant="subtle">{task.badgeLabel}</Badge>
            </Box>
          )}
        </Box>
      </Box>
    </CardShell>
  );
}

// ── Checklist card (rich treatment: avatar + title, inline checkable items) ───

export function ChecklistPlannerCard({ task, onSelect, interaction = "flip", onToss }: { task: Task; onSelect: () => void; interaction?: CardInteraction; onToss?: (t: Task) => void }) {
  const groups = task.checklistGroups ?? [];
  const allItems = groups.flatMap((g) => g.items);
  const [done, setDone] = useSessionDone(task.id);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(allItems.map((i) => [i.id, i.checked])),
  );
  const preview = allItems.slice(0, 3);
  const remaining = allItems.length - preview.length;

  return (
    <CardShell task={task} onSelect={onSelect} interaction={interaction} onToss={onToss}>
      <Box display="flex" gap="12" alignItems={done ? "center" : "start"}>
        <Lead done={done} setDone={setDone} interaction={interaction} visual={<CardAvatar task={task} />} />
        <Box flex="1" display="flex" flexDirection="column" gap="6" style={{ minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap="8">
            <Text className="planner-card-title" flex="1" fontSize="md" fontWeight="500" color={done ? "fg.tertiary" : "fg.default"} truncate style={{ textDecoration: done ? "line-through" : "none" }}>{task.title}</Text>
            {!done && <DueDate task={task} />}
          </Box>

          {!done && (
          <Box display="flex" flexDirection="column" gap="4">
            {preview.map((item) => (
              <Box key={item.id} display="flex" gap="8" alignItems="start">
                <Box onClick={(e) => e.stopPropagation()} pt="2">
                  <Checkbox
                    checked={checked[item.id]}
                    onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [item.id]: v === true }))}
                    aria-label={item.bold ? item.bold + item.text : item.text}
                  />
                </Box>
                <Text fontSize="sm" color={checked[item.id] ? "fg.tertiary" : "fg.secondary"} style={{ ...clamp2, textDecoration: checked[item.id] ? "line-through" : "none" }}>
                  {item.bold && <Text asChild fontWeight="500" color="fg.default"><span>{item.bold}</span></Text>}
                  {item.text}
                </Text>
              </Box>
            ))}
            {remaining > 0 && (
              <Text fontSize="sm" color="fg.tertiary">+{remaining} more items</Text>
            )}
          </Box>
          )}

          {!done && (task.badgeLabel || task.checklistSource) && (
            <Box display="flex" alignItems="center">
              <Badge intent="neutral" variant="subtle">{task.badgeLabel ?? task.checklistSource}</Badge>
            </Box>
          )}
        </Box>
      </Box>
    </CardShell>
  );
}
