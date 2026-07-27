"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Field,
  Heading,
  Input,
  Link,
  Text,
  Textarea,
  Tooltip,
  toaster,
} from "@optiaxiom/react";
import {
  IconAngleDown,
  IconCircleInfo,
  IconPenToSquare,
  IconTrashCan,
} from "@optiaxiom/icons";
import { PanelShell } from "@/app/admin-center/components/PanelShell";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
  UserSearchInput,
  type SearchableUser,
} from "../../../user-management/users/components/UserSearchInput";
import { BULK_IMPORT_USERS } from "../../../user-management/users/data";
import { GROUPS_DATA, type GroupMember } from "../../../user-management/groups/data";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GroupPanelData = {
  id: string;
  name: string;
  assigned: number;
  consumed: number;
  members: number;
};

type PanelTab = "Credit usage" | "Members" | "Group details";
const TABS: PanelTab[] = ["Credit usage", "Members", "Group details"];

// ── Mock data ─────────────────────────────────────────────────────────────────

const MEMBERS_INITIAL: GroupMember[] = [
  { email: "olivia.bennett@optimizely.com", first: "Olivia", last: "Bennett", sourceGroupId: null },
  { email: "liam.carter@optimizely.com",    first: "Liam",   last: "Carter",  sourceGroupId: null },
  { email: "emma.dawson@optimizely.com",    first: "Emma",   last: "Dawson",  sourceGroupId: null },
  { email: "noah.ellis@optimizely.com",     first: "Noah",   last: "Ellis",   sourceGroupId: null },
  { email: "ava.fischer@optimizely.com",    first: "Ava",    last: "Fischer", sourceGroupId: null },
  { email: "james.gray@optimizely.com",     first: "James",  last: "Gray",    sourceGroupId: null },
  { email: "sofia.harris@optimizely.com",   first: "Sofia",  last: "Harris",  sourceGroupId: null },
];

const ALLOCATION_HISTORY = [
  {
    type: "increase" as const,
    label: "Allocation increased",
    user: "olivia.bennett@optimizely.com",
    date: "Jul 25, 2026, 10:32 AM",
    credits: 15000,
    delta: 3000,
  },
  {
    type: "created" as const,
    label: "Group created",
    user: "olivia.bennett@optimizely.com",
    date: "Jul 20, 2026, 2:15 PM",
    credits: 12000,
    delta: null,
  },
];

// ── Credit usage tab ──────────────────────────────────────────────────────────

function CreditUsageTab({ group }: { group: GroupPanelData }) {
  const pct = Math.min(100, Math.round((group.consumed / group.assigned) * 100));
  const barColor =
    pct >= 90
      ? "var(--ax-colors-fg-error)"
      : pct >= 75
        ? "var(--ax-colors-fg-warning)"
        : "var(--ax-colors-fg-accent-strong)";

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
        <Heading level="4">Credit usage summary</Heading>
        <Button appearance="default" size="sm" icon={<IconPenToSquare size={14} />}>
          Edit allocation
        </Button>
      </Box>

      <Box p="20" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default" mb="32">
        <Box display="flex" gap="10" mb="10" style={{ alignItems: "baseline" }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pct}%
          </Text>
          <Text fontSize="sm" color="fg.secondary">
            {group.consumed.toLocaleString()} of {group.assigned.toLocaleString()} credits used
          </Text>
        </Box>
        <Box rounded="full" bg="bg.tertiary" mb="10" style={{ height: 8, overflow: "hidden" }}>
          <Box
            style={{
              height: "100%",
              width: `${pct}%`,
              background: barColor,
              transition: "width 200ms ease",
            }}
          />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Badge intent="success" variant="subtle">
            ON TRACK
          </Badge>
          <Text fontSize="sm" color="fg.tertiary">
            Resets August 1, 2026
          </Text>
        </Box>
      </Box>

      <Heading level="4" mb="16">
        Allocation history
      </Heading>
      <Box display="flex" flexDirection="column">
        {ALLOCATION_HISTORY.map((ev, i) => (
          <Box
            key={i}
            display="flex"
            alignItems="start"
            justifyContent="space-between"
            pb="20"
          >
            <Box display="flex" alignItems="start" gap="12">
              <Box
                rounded="full"
                style={{
                  width: 10,
                  height: 10,
                  flexShrink: 0,
                  marginTop: 4,
                  background:
                    ev.type === "increase"
                      ? "var(--ax-colors-fg-accent-strong)"
                      : "var(--ax-colors-fg-tertiary)",
                }}
              />
              <Box>
                <Text fontWeight="500" fontSize="sm">
                  {ev.label}
                </Text>
                <Text fontSize="sm" color="fg.tertiary">
                  {ev.user}
                </Text>
                <Text fontSize="sm" color="fg.tertiary">
                  {ev.date}
                </Text>
              </Box>
            </Box>
            <Box style={{ textAlign: "right", flexShrink: 0 }}>
              {ev.delta && (
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{
                    color: "var(--ax-colors-fg-accent-strong)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  +{ev.delta.toLocaleString()} credits
                </Text>
              )}
              <Text
                fontSize="sm"
                color="fg.secondary"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {ev.credits.toLocaleString()} {ev.delta ? "total" : "credits"}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Members tab ───────────────────────────────────────────────────────────────

function MembersTab({
  totalCount,
  markDirty,
}: {
  totalCount: number;
  markDirty: () => void;
}) {
  const [members, setMembers] = useState<GroupMember[]>(MEMBERS_INITIAL);
  const [query, setQuery] = useState("");
  const [existingOpen, setExistingOpen] = useState(false);
  const [listOpen, setListOpen] = useState(true);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

  const updateMembers = (next: GroupMember[]) => {
    setMembers(next);
    markDirty();
  };

  const addUser = (user: SearchableUser) => {
    if (members.some((m) => m.email === user.email)) return;
    updateMembers([
      ...members,
      { email: user.email, first: user.first, last: user.last, sourceGroupId: null },
    ]);
  };

  const toggleGroup = (groupId: string, count: number) => {
    const next = new Set(selectedGroupIds);
    if (next.has(groupId)) {
      next.delete(groupId);
      updateMembers(members.filter((m) => m.sourceGroupId !== groupId));
    } else {
      next.add(groupId);
      const existing = new Set(members.map((m) => m.email));
      const added = BULK_IMPORT_USERS.slice(0, Math.min(count, BULK_IMPORT_USERS.length))
        .filter((u) => !existing.has(u.email))
        .map((u) => ({
          email: u.email,
          first: u.first,
          last: u.last,
          sourceGroupId: groupId,
        }));
      updateMembers([...members, ...added]);
    }
    setSelectedGroupIds(next);
  };

  const removeMember = (idx: number) => {
    const m = members[idx];
    if (m.sourceGroupId) {
      const next = new Set(selectedGroupIds);
      next.delete(m.sourceGroupId);
      setSelectedGroupIds(next);
    }
    updateMembers(members.filter((_, i) => i !== idx));
  };

  const displayCount = members.length + Math.max(0, totalCount - MEMBERS_INITIAL.length);

  return (
    <Box display="flex" flexDirection="column" gap="16">
      {/* Info banner */}
      <Box
        display="flex"
        alignItems="start"
        gap="10"
        p="12"
        rounded="md"
        style={{
          background: "rgba(6,150,180,0.08)",
          border: "1px solid rgba(6,150,180,0.2)",
        }}
      >
        <IconCircleInfo
          size={16}
          style={{ color: "#0696b4", flexShrink: 0, marginTop: 1 }}
        />
        <Text fontSize="sm" style={{ color: "#0a5a6e" }}>
          Each user can only be in one group for credit tracking
        </Text>
      </Box>

      {/* Search */}
      <Field
        label={
          <Box display="inline-flex" alignItems="center" gap="4">
            <span>Search and select user to add</span>
            <Tooltip content="Search by name or email to find and add an existing user.">
              <span style={{ display: "inline-flex" }}>
                <IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
              </span>
            </Tooltip>
          </Box>
        }
      >
        <UserSearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name or email"
          excludeEmails={members.map((m) => m.email)}
          onSelectUser={(user) => { addUser(user); setQuery(""); }}
        />
      </Field>

      {/* Add from existing group */}
      <Box display="flex" alignItems="center" gap="8">
        <Link
          href="#"
          fontWeight="600"
          onClick={(e) => {
            e.preventDefault();
            setExistingOpen((o) => !o);
          }}
        >
          Or add users from existing group
        </Link>
        <Tooltip content="Select one or more existing groups to copy their members into this group. Duplicate users will be added only once.">
          <span style={{ display: "inline-flex" }}>
            <IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
          </span>
        </Tooltip>
      </Box>

      {existingOpen && (
        <Box display="flex" flexDirection="column" gap="8">
          {/* Trigger */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px="16"
            py="12"
            rounded="md"
            border="1"
            borderColor="border.default"
            cursor="pointer"
            onClick={() => setListOpen((o) => !o)}
          >
            <Text color={selectedGroupIds.size > 0 ? "fg.default" : "fg.tertiary"}>
              {selectedGroupIds.size > 0
                ? `${selectedGroupIds.size} group${selectedGroupIds.size === 1 ? "" : "s"} selected`
                : "Select group"}
            </Text>
            <Box
              style={{
                display: "inline-flex",
                transform: listOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 150ms ease",
              }}
            >
              <IconAngleDown size={16} color="var(--ax-colors-fg-secondary)" />
            </Box>
          </Box>

          {/* Group list */}
          {listOpen && (
            <Box
              rounded="md"
              border="1"
              borderColor="border.default"
              overflow="auto"
              style={{ maxHeight: 320 }}
            >
              {GROUPS_DATA.map((g) => (
                <Box
                  key={g.id}
                  display="flex"
                  alignItems="start"
                  gap="12"
                  px="16"
                  py="12"
                  cursor="pointer"
                  borderB="1"
                  borderColor="border.tertiary"
                  onClick={() => toggleGroup(g.id, g.users)}
                >
                  <Box mt="2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedGroupIds.has(g.id)}
                      onCheckedChange={() => toggleGroup(g.id, g.users)}
                      aria-label={g.name}
                    />
                  </Box>
                  <Box display="flex" flexDirection="column" gap="2">
                    <Text fontWeight="500" color="fg.default">
                      {g.name}
                    </Text>
                    <Text fontSize="sm" color="fg.tertiary">
                      {g.users} users
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Member list */}
      <Box display="flex" flexDirection="column" gap="8">
        <Heading level="4">Group Members ({displayCount})</Heading>
        {members.length > 0 ? (
          <Box
            rounded="md"
            border="1"
            borderColor="border.tertiary"
            bg="bg.default"
            style={{ overflow: "hidden" }}
          >
            <Table>
              <thead>
                <Tr>
                  <Th>Email</Th>
                  <Th style={{ width: 120 }}>First Name</Th>
                  <Th style={{ width: 120 }}>Last Name</Th>
                  <Th style={{ width: 48 }} />
                </Tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <Tr key={`${m.email}-${i}`}>
                    <Td>{m.email}</Td>
                    <Td>{m.first || "—"}</Td>
                    <Td>{m.last || "—"}</Td>
                    <Td type="raw" style={{ width: 48, textAlign: "right" }}>
                      <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconTrashCan size={16} />}
                        aria-label={`Remove ${m.email}`}
                        onClick={() => removeMember(i)}
                      />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Box>
        ) : (
          <Box py="32" textAlign="center">
            <Text color="fg.tertiary">No users added</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Group details tab ─────────────────────────────────────────────────────────

function GroupDetailsTab({
  group,
  markDirty,
}: {
  group: GroupPanelData;
  markDirty: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState("Account-level editor group");

  return (
    <Box display="flex" flexDirection="column" gap="16">
      <Field
        label={
          <>
            Group name{" "}
            <span style={{ color: "var(--ax-colors-fg-error)" }}>*</span>
          </>
        }
      >
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            markDirty();
          }}
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={description}
          rows={4}
          onChange={(e) => {
            setDescription(e.target.value);
            markDirty();
          }}
        />
      </Field>

      <Box>
        <Text fontSize="sm" color="fg.tertiary">
          Created date
        </Text>
        <Text fontSize="sm" fontWeight="500">
          Oct 6, 2025, 9:31 PM
        </Text>
      </Box>
      <Box>
        <Text fontSize="sm" color="fg.tertiary">
          Created by
        </Text>
        <Text fontSize="sm" fontWeight="500">
          olivia.bennett@optimizely.com
        </Text>
      </Box>

      <Box display="flex" gap="12" mt="16" justifyContent="flex-end">
        <Button
          appearance="default"
          size="md"
          style={{ borderColor: "#be185d", color: "#be185d" }}
        >
          Deactivate group
        </Button>
        <Button
          appearance="primary"
          size="md"
          style={{ background: "#A95A77", borderColor: "#9f1239" }}
        >
          Delete group
        </Button>
      </Box>
    </Box>
  );
}

// ── Panel shell ───────────────────────────────────────────────────────────────

type Props = { group: GroupPanelData | null; onClose: () => void };

export function GroupDetailPanel({ group, onClose }: Props) {
  const [tab, setTab] = useState<PanelTab>("Credit usage");
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => setIsDirty(true);
  const handleClose = () => { setIsDirty(false); onClose(); };
  const handleSave = () => {
    toaster.create("Group updated", { intent: "success" });
    handleClose();
  };

  const tabsRow = (
    <Box display="flex" gap="24">
      {TABS.map((t) => (
        <Box
          key={t}
          py="12"
          cursor="pointer"
          borderB={tab === t ? "2" : "0"}
          onClick={() => setTab(t)}
          style={tab === t ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
        >
          <Text
            fontWeight={tab === t ? "500" : "400"}
            color={tab === t ? "fg.default" : "fg.tertiary"}
          >
            {t}
          </Text>
        </Box>
      ))}
    </Box>
  );

  const titleNode = (
    <Box>
      <Heading level="2">{group?.name}</Heading>
      <Box mt="6">
        <Badge intent="success" variant="subtle">ACTIVE</Badge>
      </Box>
    </Box>
  );

  return (
    <PanelShell
      open={!!group}
      onClose={handleClose}
      title={titleNode}
      ariaLabel={group?.name}
      subHeader={tabsRow}
      footer={
        <>
          <Button appearance="subtle" onClick={handleClose}>Cancel</Button>
          <Button appearance="primary" disabled={!isDirty} onClick={handleSave}>Save</Button>
        </>
      }
    >
      {group && (
        <>
          {tab === "Credit usage"  && <CreditUsageTab group={group} />}
          {tab === "Members"       && <MembersTab totalCount={group.members} markDirty={markDirty} />}
          {tab === "Group details" && <GroupDetailsTab group={group} markDirty={markDirty} />}
        </>
      )}
    </PanelShell>
  );
}
