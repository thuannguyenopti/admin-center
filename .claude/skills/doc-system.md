---
name: doc-system
description: >
  Rules for managing LLM-facing documentation in this repo. Invoke automatically
  whenever creating, editing, moving, or deleting any .md file that is meant to
  guide Claude — CLAUDE.md files, skill files, reference docs, or any file another
  doc points to. Also invoke when a user asks Claude to "remember" something for
  future sessions or to document a pattern.
---

# LLM Documentation System

This repo uses four distinct mechanisms to get context in front of Claude. Choose
the right one — wrong choices either waste tokens every session or make docs
invisible.

## The four mechanisms

### 1. Root `CLAUDE.md` — always loaded, every session
**Use for:** Cross-cutting constraints that must be active in every session regardless
of what the user is working on. Build rules, git rules, architecture overview, design
system critical rules, recurring code patterns.

**Cost:** Every line here burns tokens on every session. Keep it lean. If a rule only
matters for one product area or one type of task, it does not belong here.

### 2. Subdirectory `CLAUDE.md` — auto-loaded when working in that directory
**Use for:** Feature-specific implementation notes, component architecture, and gotchas
that only matter when touching a specific area of the codebase.

Place the file at the root of the relevant directory:
- `app/cmp/opal-studio/CLAUDE.md` → loaded when working on Opal Studio
- `app/components/ai/CLAUDE.md` → loaded when working on AI components

**Cost:** Zero unless Claude is working in that directory. This is the best pattern
for co-locating docs with the code they describe.

### 3. `.claude/skills/*.md` with frontmatter — proactively triggered by task type
**Use for:** Cross-cutting behavioral rules or domain knowledge that apply to a *type
of work* rather than a specific directory. The `description` field tells Claude when
to load the full body.

```markdown
---
name: my-skill
description: >
  Brief trigger condition written as: "Invoke automatically when [condition].
  Covers [topics]."
---
```

Claude reads every skill description at session start (one line each) and loads the
full body when the description matches the current task. Users never need to type
anything — Claude loads it proactively.

**Current skills:**
- `frontend-design.md` — triggers before any UI code work
- `cmp.md` — triggers when working in `app/cmp/`
- `doc-system.md` — triggers when managing LLM-facing docs (this file)

### 4. Slash commands — only for explicit user-initiated workflows
A skill becomes a slash command when the user types `/skill-name`. This is only
appropriate when:
- The workflow is explicitly user-initiated (not something Claude should do
  automatically)
- AND it involves a structured multi-step process that benefits from a named entry
  point
- AND the users are likely to know the command exists and remember to use it

**The users of this repo are product designers and engineers who are highly unlikely
to type slash commands manually.** Do not create slash commands for things Claude
should be doing proactively. Prefer frontmatter with a clear description trigger.

## Decision guide

| Question | Answer → Mechanism |
|---|---|
| Must this be active in every session? | Root `CLAUDE.md` |
| Does this only matter in one directory? | Subdirectory `CLAUDE.md` |
| Does this apply to a type of task across the whole codebase? | Skill with frontmatter trigger |
| Is this a large reference doc pointed to from CLAUDE.md? | Standalone `.md` at root or in `app/` |
| Is this a user-initiated multi-step workflow? | Slash command (rare in this repo) |

## Writing good frontmatter descriptions

The description is the only part loaded at session start. Write it so Claude can
decide whether to load the full body without reading it.

**Good:**
```
description: >
  CMP (Content Marketing Platform) domain knowledge. Invoke automatically when
  working in app/cmp/ or when the user asks about CMP concepts: Content Models,
  Tasks, Campaigns, DAM, or publishing workflows.
```

**Bad (too vague — Claude won't know when to trigger it):**
```
description: CMP reference guide.
```

## Where things currently live

| File | Mechanism | Loads when |
|---|---|---|
| `CLAUDE.md` | Root | Always |
| `OPAL_DESIGN_SYSTEM.md` | Referenced from CLAUDE.md | Opal work |
| `app/DATA_VISUALIZATION_COLORS.md` | Referenced from CLAUDE.md | Data viz work |
| `app/cmp/opal-studio/CLAUDE.md` | Subdirectory | Working in Opal Studio |
| `app/components/ai/CLAUDE.md` | Subdirectory | Working in AI components |
| `.claude/skills/frontend-design.md` | Skill (proactive) | Any UI code work |
| `.claude/skills/cmp.md` | Skill (proactive) | CMP work |
| `.claude/skills/doc-system.md` | Skill (proactive) | Managing LLM docs |

## What not to do

- Do not put product-specific rules in root `CLAUDE.md` — they cost tokens on every
  session even when irrelevant
- Do not create a slash command for something Claude should do automatically
- Do not put docs in `app/` without either a subdirectory `CLAUDE.md` name or a
  reference from another loaded doc — plain `.md` files in `app/` are invisible
- Do not duplicate rules across multiple files — pick one owner and reference the
  other if needed
- Do not leave stale docs in place; delete or update them. A wrong doc is worse
  than no doc.
