"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Field,
  Heading,
  Input,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Textarea,
  Tooltip,
  toaster,
} from "@optiaxiom/react";
import { IconAngleDown, IconCheck, IconCircleInfo, IconTrashCan } from "@optiaxiom/icons";
import { PanelShell } from "@/app/admin-center/components/PanelShell";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
  UserSearchInput,
  lookupUserByEmail,
  type SearchableUser,
} from "../../../user-management/users/components/UserSearchInput";
import { BULK_IMPORT_USERS } from "../../../user-management/users/data";
import { GROUPS_DATA, type GroupMember } from "../../../user-management/groups/data";

// ── Constants ──────────────────────────────────────────────────────────────────

const ORG_CREDITS = 12000;
const STEP_LABELS = ["Group info and members", "Setup credits", "Review"] as const;

type Step = 1 | 2 | 3;
type AllocMode = "credits" | "percentage";
type BehaviorMode = "notify" | "org-credits" | "stop";

export type NewGroupAllocationPayload = {
  name: string;
  description: string;
  members: GroupMember[];
  credits: number;
  behavior: BehaviorMode;
};

// ── Stepper ────────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: Step }) {
  return (
    <Box display="flex" alignItems="center" gap="8">
      {STEP_LABELS.map((label, i) => {
        const n = (i + 1) as Step;
        const state = n < step ? "done" : n === step ? "current" : "todo";
        return (
          <Box key={label} display="flex" alignItems="center" gap="8" flex="1">
            <Box
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              rounded="full"
              style={{
                width: 24,
                height: 24,
                flexShrink: 0,
                background:
                  state === "done" ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-default)",
                border:
                  state === "current"
                    ? "5px solid var(--ax-colors-fg-accent)"
                    : state === "done"
                      ? "none"
                      : "2px solid var(--ax-colors-border-default)",
              }}
            >
              {state === "done" && <IconCheck size={14} />}
            </Box>
            <Text
              fontSize="sm"
              fontWeight={state === "current" ? "600" : "500"}
              color={state === "todo" ? "fg.tertiary" : "fg.default"}
            >
              {label}
            </Text>
            {i < STEP_LABELS.length - 1 && (
              <Box
                flex="1"
                style={{
                  height: 2,
                  background:
                    n < step
                      ? "var(--ax-colors-bg-accent)"
                      : "var(--ax-colors-border-default)",
                  minWidth: 16,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Radio button ───────────────────────────────────────────────────────────────

function RadioOption({
  selected,
  onSelect,
  label,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
}) {
  return (
    <Box display="flex" alignItems="start" gap="12" cursor="pointer" onClick={onSelect}>
      <Box
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: selected
            ? "6px solid var(--ax-colors-fg-accent-strong)"
            : "2px solid var(--ax-colors-border-default)",
          flexShrink: 0,
          marginTop: 2,
          transition: "border 150ms ease",
        }}
      />
      <Box>
        <Text fontWeight={selected ? "600" : "400"} color="fg.default">
          {label}
        </Text>
        {description && (
          <Text fontSize="sm" color="fg.tertiary">
            {description}
          </Text>
        )}
      </Box>
    </Box>
  );
}

// ── Step 1: Group info and members ─────────────────────────────────────────────

function StepGroupInfoAndMembers({
  name,
  setName,
  description,
  setDescription,
  members,
  setMembers,
}: {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  members: GroupMember[];
  setMembers: (m: GroupMember[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [existingOpen, setExistingOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

  const addUser = (user: SearchableUser) => {
    if (members.some((m) => m.email === user.email)) { setQuery(""); return; }
    setMembers([...members, { email: user.email, first: user.first, last: user.last, sourceGroupId: null }]);
    setQuery("");
  };

  const addManual = (raw: string) => {
    const email = raw.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || members.some((m) => m.email === email)) {
      setQuery(""); return;
    }
    const existing = lookupUserByEmail(email);
    setMembers([...members, { email, first: existing?.first ?? "", last: existing?.last ?? "", sourceGroupId: null }]);
    setQuery("");
  };

  const toggleGroup = (groupId: string, count: number) => {
    const next = new Set(selectedGroupIds);
    if (next.has(groupId)) {
      next.delete(groupId);
      setMembers(members.filter((m) => m.sourceGroupId !== groupId));
    } else {
      next.add(groupId);
      const existing = new Set(members.map((m) => m.email));
      const added = BULK_IMPORT_USERS.slice(0, Math.min(count, BULK_IMPORT_USERS.length))
        .filter((u) => !existing.has(u.email))
        .map((u) => ({ ...u, sourceGroupId: groupId }));
      setMembers([...members, ...added]);
    }
    setSelectedGroupIds(next);
  };

  const removeMember = (idx: number) => setMembers(members.filter((_, i) => i !== idx));

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {/* Group info */}
      <Box>
        <Heading level="4" mb="16">Group info</Heading>
        <Box display="flex" flexDirection="column" gap="16">
          <Field
            label={
              <Box display="inline-flex" alignItems="center" gap="4">
                <span>Group name</span>
                <Text asChild color="fg.error"><span> *</span></Text>
              </Box>
            }
          >
            <Input value={name} placeholder="Group name" onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea value={description} placeholder="Enter description" rows={3} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </Box>
      </Box>

      {/* User list */}
      <Box>
        <Heading level="4" mb="16">User list</Heading>
        <Box display="flex" flexDirection="column" gap="16">
          {/* Info banner */}
          <Box
            display="flex"
            alignItems="center"
            gap="12"
            px="16"
            py="12"
            rounded="md"
            style={{ background: "rgba(14, 116, 144, 0.08)", border: "1px solid rgba(14, 116, 144, 0.15)" }}
          >
            <Box
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              rounded="full"
              style={{ width: 24, height: 24, flexShrink: 0, background: "#0e7490" }}
            >
              <IconCircleInfo size={14} style={{ color: "white" }} />
            </Box>
            <Text fontSize="sm" fontWeight="500">
              Each user can only be in one group for credit tracking
            </Text>
          </Box>

          {/* Label row: search label left, existing group link right */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="inline-flex" alignItems="center" gap="4">
              <Text fontSize="md" color="fg.secondary">Search and select user to add</Text>
              <Tooltip content="Search by name or email to find and add an existing user.">
                <span style={{ display: "inline-flex" }}>
                  <IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
                </span>
              </Tooltip>
            </Box>
            <Box display="inline-flex" alignItems="center" gap="4">
              <Link
                href="#"
                fontWeight="400"
                onClick={(e) => { e.preventDefault(); setExistingOpen((o) => !o); }}
              >
                Or add users from existing group
              </Link>
              <Tooltip content="Copy members from an existing group. Duplicate users are added only once.">
                <span style={{ display: "inline-flex" }}>
                  <IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
                </span>
              </Tooltip>
            </Box>
          </Box>

          <UserSearchInput
            value={query}
            onChange={setQuery}
            onSelectUser={addUser}
            excludeEmails={members.map((m) => m.email)}
            placeholder="Search by name or email"
            onEnterManual={addManual}
          />

          {existingOpen && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
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
                >
                  <Text color={selectedGroupIds.size > 0 ? "fg.default" : "fg.tertiary"}>
                    {selectedGroupIds.size > 0
                      ? `${selectedGroupIds.size} group${selectedGroupIds.size === 1 ? "" : "s"} selected`
                      : "Select group"}
                  </Text>
                  <Box style={{ display: "inline-flex", transform: popoverOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}>
                    <IconAngleDown size={16} color="var(--ax-colors-fg-secondary)" />
                  </Box>
                </Box>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                sideOffset={4}
                align="start"
                style={{ minWidth: "var(--radix-popover-trigger-width)" }}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Box display="flex" flexDirection="column" py="2" overflow="auto" style={{ maxHeight: 280 }}>
                  {GROUPS_DATA.map((g) => (
                    <Box
                      key={g.id}
                      display="flex"
                      alignItems="start"
                      gap="12"
                      px="12"
                      py="10"
                      cursor="pointer"
                      rounded="sm"
                      bg="transparent"
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
                        <Text fontWeight="500" color="fg.default">{g.name}</Text>
                        <Text fontSize="sm" color="fg.tertiary">{g.users} users</Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </PopoverContent>
            </Popover>
          )}

          {members.length > 0 && (
            <Table>
              <thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>First name</Th>
                  <Th>Last name</Th>
                  <Th style={{ width: 48 }} />
                </Tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <Tr key={`${m.email}-${i}`}>
                    <Td>{m.email}</Td>
                    <Td>{m.first || <Text asChild color="fg.tertiary"><span>—</span></Text>}</Td>
                    <Td>{m.last || <Text asChild color="fg.tertiary"><span>—</span></Text>}</Td>
                    <Td type="raw" style={{ width: 48, textAlign: "right" }}>
                      <Button appearance="subtle" size="sm" icon={<IconTrashCan size={16} />} aria-label={`Remove ${m.email}`} onClick={() => removeMember(i)} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Step 2: Setup credits ──────────────────────────────────────────────────────

function StepSetupCredits({
  allocMode,
  setAllocMode,
  credits,
  setCredits,
  percentage,
  setPercentage,
  behavior,
  setBehavior,
}: {
  allocMode: AllocMode;
  setAllocMode: (v: AllocMode) => void;
  credits: number;
  setCredits: (v: number) => void;
  percentage: number;
  setPercentage: (v: number) => void;
  behavior: BehaviorMode;
  setBehavior: (v: BehaviorMode) => void;
}) {
  const derivedCredits =
    allocMode === "credits" ? credits : Math.round((ORG_CREDITS * percentage) / 100);
  const barPct = Math.min(100, Math.round((derivedCredits / ORG_CREDITS) * 100));
  const unallocated = Math.max(0, ORG_CREDITS - derivedCredits);

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {/* Org availability bar */}
      <Box>
        <Text fontWeight="600" mb="12">
          Organization credit availability: {ORG_CREDITS.toLocaleString()} credits
        </Text>
        <Box rounded="md" overflow="hidden" display="flex" style={{ height: 40 }}>
          <Box
            style={{
              width: `${barPct}%`,
              minWidth: derivedCredits > 0 ? 90 : 0,
              background: "var(--ax-colors-fg-accent-strong)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              transition: "width 200ms ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Text fontSize="sm" fontWeight="600" style={{ color: "var(--ax-colors-bg-default)" }}>
              This group  {derivedCredits.toLocaleString()}
            </Text>
          </Box>
          <Box
            style={{
              flex: 1,
              background: "var(--ax-colors-bg-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 12,
              overflow: "hidden",
            }}
          >
            <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "nowrap" }}>
              Unallocated: {unallocated.toLocaleString()} credits
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Allocation mode */}
      <Box>
        <Heading level="4" mb="4">Set this group&apos;s allocation</Heading>
        <Text fontSize="sm" color="fg.secondary" mb="16">
          Choose how you want to set the credit limit.
        </Text>
        <Box display="flex" flexDirection="column" gap="16">
          <Box>
            <RadioOption
              selected={allocMode === "credits"}
              onSelect={() => setAllocMode("credits")}
              label="Credits"
            />
            {allocMode === "credits" && (
              <Box mt="8" ml="32">
                <Input
                  value={String(credits)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                    setCredits(isNaN(v) ? 0 : v);
                  }}
                  style={{ width: 160 }}
                />
              </Box>
            )}
          </Box>
          <Box>
            <RadioOption
              selected={allocMode === "percentage"}
              onSelect={() => setAllocMode("percentage")}
              label="Percentage (%) of available organization credits"
            />
            {allocMode === "percentage" && (
              <Box mt="8" ml="32" display="flex" flexDirection="column" gap="8">
                <Box display="flex" alignItems="center" gap="8">
                  <Input
                    value={String(percentage)}
                    onChange={(e) => {
                      const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                      setPercentage(isNaN(v) ? 0 : Math.min(100, v));
                    }}
                    style={{ width: 80 }}
                  />
                  <Text>%</Text>
                  <Text color="fg.tertiary">→</Text>
                  <Text fontWeight="700">
                    {Math.round((ORG_CREDITS * percentage) / 100).toLocaleString()} credits
                  </Text>
                </Box>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--ax-colors-fg-accent-strong)", height: 6 }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Allocation behavior */}
      <Box>
        <Heading level="4" mb="4">Allocation behavior</Heading>
        <Text fontSize="sm" color="fg.secondary" mb="16">
          When this group reaches its allocation
        </Text>
        <Box display="flex" flexDirection="column" gap="16">
          <RadioOption
            selected={behavior === "notify"}
            onSelect={() => setBehavior("notify")}
            label="Notify only"
            description="Usage continues and admins are notified."
          />
          <RadioOption
            selected={behavior === "org-credits"}
            onSelect={() => setBehavior("org-credits")}
            label="Use organization credits"
            description="Usage can continue if unallocated credits are available."
          />
          <RadioOption
            selected={behavior === "stop"}
            onSelect={() => setBehavior("stop")}
            label="Stop new usage"
            description="New eligible actions are blocked."
          />
        </Box>
      </Box>
    </Box>
  );
}

// ── Step 3: Review ─────────────────────────────────────────────────────────────

function StepReview({
  name,
  description,
  members,
  allocMode,
  credits,
  percentage,
}: {
  name: string;
  description: string;
  members: GroupMember[];
  allocMode: AllocMode;
  credits: number;
  percentage: number;
}) {
  const finalCredits =
    allocMode === "credits" ? credits : Math.round((ORG_CREDITS * percentage) / 100);
  const remaining = Math.max(0, ORG_CREDITS - finalCredits);
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 5;
  const shown = showAll ? members : members.slice(0, LIMIT);

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {/* Group info */}
      <Box>
        <Heading level="4" mb="12">Group info</Heading>
        <Box display="grid" gap="12" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Box>
            <Text fontSize="sm" color="fg.secondary">Group name</Text>
            <Text fontWeight="600">{name || "—"}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="fg.secondary">Description</Text>
            <Text fontWeight="600">{description || "—"}</Text>
          </Box>
        </Box>
      </Box>

      {/* Credit allocation */}
      <Box>
        <Heading level="4" mb="12">Credit allocation</Heading>
        <Box px="16" py="12" rounded="md" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="4">
          <Text fontWeight="600">Allocation: {finalCredits.toLocaleString()} credits</Text>
          {allocMode === "percentage" && (
            <Text fontSize="sm" color="fg.secondary">
              {percentage}% of the {ORG_CREDITS.toLocaleString()} credits currently available
            </Text>
          )}
          <Text fontSize="sm" color="fg.secondary">
            Organization credits remaining: {remaining.toLocaleString()}
          </Text>
        </Box>
      </Box>

      {/* Members */}
      <Box>
        <Heading level="4" mb="12">Group Members ({members.length})</Heading>
        {members.length > 0 ? (
          <>
            <Table>
              <thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>First name</Th>
                  <Th>Last name</Th>
                </Tr>
              </thead>
              <tbody>
                {shown.map((m, i) => (
                  <Tr key={`${m.email}-${i}`}>
                    <Td>{m.email}</Td>
                    <Td>{m.first || "—"}</Td>
                    <Td>{m.last || "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            {members.length > LIMIT && (
              <Box display="flex" justifyContent="center" mt="8">
                <Button appearance="subtle" size="sm" onClick={() => setShowAll((s) => !s)}>
                  {showAll ? "View less" : `View all ${members.length}`}
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Text fontSize="sm" color="fg.tertiary">No members added.</Text>
        )}
      </Box>
    </Box>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

export function NewGroupAllocationPanel({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: NewGroupAllocationPayload) => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [allocMode, setAllocMode] = useState<AllocMode>("credits");
  const [credits, setCredits] = useState(3000);
  const [percentage, setPercentage] = useState(25);
  const [behavior, setBehavior] = useState<BehaviorMode>("notify");

  useEffect(() => {
    if (open) {
      setStep(1);
      setName("");
      setDescription("");
      setMembers([]);
      setAllocMode("credits");
      setCredits(3000);
      setPercentage(25);
      setBehavior("notify");
    }
  }, [open]);

  const canContinue =
    step === 1
      ? name.trim().length > 0
      : step === 2
        ? allocMode === "credits" ? credits > 0 : percentage > 0
        : true;

  const handleCreate = () => {
    const finalCredits =
      allocMode === "credits" ? credits : Math.round((ORG_CREDITS * percentage) / 100);
    onSubmit?.({ name: name.trim(), description: description.trim(), members, credits: finalCredits, behavior });
    toaster.create("Group allocation created", { intent: "success" });
    onClose();
  };

  return (
    <PanelShell
      open={open}
      onClose={onClose}
      title="New Group Allocation"
      subHeader={<Box py="20"><Stepper step={step} /></Box>}
      footer={
        <>
          {step > 1 ? (
            <Button appearance="subtle" onClick={() => setStep((s) => (s - 1) as Step)}>
              Back
            </Button>
          ) : (
            <Button appearance="subtle" onClick={onClose}>
              Cancel
            </Button>
          )}
          {step < 3 ? (
            <Button
              appearance="primary"
              disabled={!canContinue}
              onClick={() => setStep((s) => (s + 1) as Step)}
            >
              Continue
            </Button>
          ) : (
            <Button appearance="primary" onClick={handleCreate}>
              Create group
            </Button>
          )}
        </>
      }
    >
      {step === 1 && (
        <StepGroupInfoAndMembers
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          members={members}
          setMembers={setMembers}
        />
      )}
      {step === 2 && (
        <StepSetupCredits
          allocMode={allocMode}
          setAllocMode={setAllocMode}
          credits={credits}
          setCredits={setCredits}
          percentage={percentage}
          setPercentage={setPercentage}
          behavior={behavior}
          setBehavior={setBehavior}
        />
      )}
      {step === 3 && (
        <StepReview
          name={name}
          description={description}
          members={members}
          allocMode={allocMode}
          credits={credits}
          percentage={percentage}
        />
      )}
    </PanelShell>
  );
}
