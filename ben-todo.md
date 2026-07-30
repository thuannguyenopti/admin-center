# Ben's manual review — PR #258 (summer-clean)

Three workstreams landed on this branch. Spot-check via `yarn preview` (NOT `yarn dev` —
Turbopack renders Axiom styles differently from prod). Grouped by risk.

═══════════════════════════════════════════════════════════════════════

## 1. template.tsx refactor — route checks → nav-item flags (COMMITTED)

Shell behavior is now driven by nav flags instead of hardcoded route checks. Each
of these routes exercises a different flag path — confirm the shell renders right:

- [ ] /opal/agents/workflow — `fullscreen`: no sidebar/GlobalBar, canvas owns viewport
- [ ] /cmp/opal-studio — `hideSidebar` + `customLayout` + `opalCloseReturnTo`; closing
      Opal should return to /cmp/library (the fallback), not error
- [ ] /opal?artifacts=1 — `chromeless` canvas via `query: {artifacts:"1"}` match; plain
      /opal should still show normal chrome (query-scoped highlight)
- [ ] /cmp/task/<id> — `customLayout`; the Plan sidebar item should highlight for BOTH
      /cmp/plan-view AND /cmp/task/ (highlight array)
- [ ] web-ex optimizations — `instantShell`: shell transition disabled on that route
- [ ] Any sidebar item that previously showed a red "Notifications" count — that badge
      block was DEAD CODE and was removed; confirm nothing visually regressed (should be
      nothing, no nav item had that label). Generic `badge:<n>` flag replaces it.

## 2. Icon migration — @tabler → sanctioned sources, 170 files (COMMITTED)

- [ ] The ~21 RENAMED icons (IconDots→IconEllipsisSolid, IconX→IconXmark, IconSettings→
      IconGear, IconPencil→IconPen, etc.) are the SAME glyph by construction — low risk,
      quick pass only.
- [ ] GENUINE visual swaps — these names now resolve to real Axiom V2 art (per migration
      summary): IconTrash, IconMail, IconShare, IconGitBranch, IconDeviceDesktop,
      IconSunFilled. Eyeball anywhere these appear (delete buttons, share actions,
      device toggles, the visual-editor desktop icon).
- [ ] web-ex visual-editor: numeric `stroke` was dropped from IconTrash + IconDeviceDesktop
      (V2 icons are fill-based, stroke ignored). Confirm they don't look off.
- [ ] Opal brand/connectivity icons that fell back to the shim (IconBrandSlack, IconBrandFigma,
      IconBrandGithub, IconWifi, etc. in tools / opal-v3 / virtual-teammates / notification-catalog).

═══════════════════════════════════════════════════════════════════════

## 3. DropdownMenu → Menu conversion (THIS PR's new work)

### 🔴 Behavior changed — review first

- [ ] app/opal/settings/notifications/page.tsx — channel selector: staged "Done" apply
      REMOVED, toggles apply instantly. Confirm channels persist + "Select all" works.
- [ ] app/opal/notification-catalog/NotificationCatalog.tsx — demo channel selector:
      "Done" footer removed, instant multi-select. Visual/demo only.

### 🟡 Judgment calls — verify parity

- [ ] app/components/vb/FieldWithAIActions.tsx — group separator semantics (labelled groups
      vs trailing separators) in the property-editor AI actions menu
- [ ] app/opal/activities/page.tsx — "Triggered by" + "Agent" filters: custom checkbox
      dropdowns w/ manual search → Menu multi-select w/ built-in search. Confirm search +
      multi-select + "Clear all".
- [ ] app/opal/artifacts/page.tsx — "Download as" sub-menu + shared getArtifactMenuOptions
      helper reused across 3 call sites (list card, workspace card, table row)

### 🟢 Mechanical — quick visual pass

- [ ] agents/page.tsx, agents/setup/page.tsx, agents/setup/components/VersionHistory.tsx
- [ ] agents/workflow/page.tsx + components/WorkflowNodes.tsx, virtual-teammates/VAUCard.tsx
- [ ] tools/page.tsx, context/FilesPage.tsx + components/FileTree.tsx + FileTreeItem.tsx
- [ ] brand-packs/components/BrandPacksOverview.tsx, im/components/UserSwitcher.tsx
- [ ] im/layouts/LayoutB-Erika.tsx + messages/page.tsx, components/HeadlessTaskPanel.tsx
- [ ] cms/settings/categories/{page,components/CategoryRow}.tsx
- [ ] cms/settings/tags/{page,components/TagRow}.tsx, fe-hosting/applications/apps/page.tsx

### General notes on the Menu conversion (may cause subtle style shifts)

- Ellipsis triggers: raw <button> replaced with Axiom `Button appearance="subtle"` —
  slightly larger hit area (~32px) + subtle hover instead of the old custom Tailwind hover.
- Secondary text (was hand-rolled <Text> stacks) now uses Menu's built-in `description`
  rendering — visually equivalent secondary text, not pixel-identical typography.
- Multi-select rows now use Menu's built-in check/checkbox instead of an inline <Checkbox>.

═══════════════════════════════════════════════════════════════════════

## 4. Accent-token cleanup — manual accent removed repo-wide (THIS PR's new work)

**What changed:** manual accent (`fg.accent` / `bg.accent` / `border.accent`, raw
`#0037ff`/`#2457ff`, and — the big one earlier sweeps MISSED — the CSS-var form
`var(--ax-colors-*-accent*)` inside inline `style={}`) is gone from all product UI.
Went from ~286 occurrences → ~18, and those 18 are deliberate (see "Left on purpose").

**Mapping used (so you know what to expect visually):**

- hover surface → `bg.default.hovered`; selected/active/pressed → `bg.default.pressed`
- selection / drag / active-tab borders → `border.default`; focus rings → `border.focus`
- Opal/AI indicators, "current" step, mention/required chips → `information` tokens
- checkmarks / "Approved" / "Completed" → `success` tokens
- decorative icons/text → `fg.default` / `fg.secondary`
- real links → Axiom `Link`; primary buttons/toggles → Axiom `Button` / `Switch`

> Review with `yarn preview`. Accent is a green in V3 — so "before" = green highlight,
> "after" = grey pressed/neutral or blue (information) where the state is meaningful.

### 🔴 Component swaps — behavior/markup changed, review first

- [ ] Opal panel `AgentBar` resume bar — the **Yes** button is now Axiom `Button`
      appearance="primary" (was a raw accent `<button>`); **No** unchanged. Confirm Enter/
      focus still lands on Yes and both click through.
- [ ] Opal chat send button (`OpalInput`) — now Axiom `Button` primary (neutral "stop"
      state while generating). Confirm send + stop-generating both work and it's disabled
      when empty.
- [ ] /cmp/opal-studio → Advanced tab — **Text Overlay** toggle is now Axiom `Switch`
      (was a raw slide toggle). Confirm on/off toggles the overlay.
- [ ] /cmp/opal-studio → reference panel + generate panel — **Preview / Add to** and
      **Regenerate / Generate Pack** are now Axiom `Button`s (primary for the accent ones).
      Reference-strength `<input type=range>` thumb is now neutral (was green).

### 🟡 Semantic recolors — verify the new colour reads right

- [ ] /opal/brand-packs/<id> → Brief tab — connection **"Approved"** pill is now GREEN
      (success), was green-accent. Assets tab logo swatch is neutral.
- [ ] /opal/brand-packs/new/figma — Preview step **checkmark** circle is now success-green.
- [ ] /opal/artifacts — the "You approved" check is success; card/tab active underline neutral.
- [ ] /cmp/plan-view — status **"Completed"** is success-green (was accent); "today" cell
      keeps its tint but neutral border.
- [ ] /opal/agents/setup — prompt-template highlighting: `[[variables]]` still warning,
      `{ directives }` are now **information-blue** (were accent). "View full guide" links neutral.
- [ ] Opal notifications (bell dropdown) + toast — "collaboration" / VAU / memory icons are
      now information-blue; loaders are grey.

### 🟢 Neutralised surfaces — quick visual pass (selected = grey pressed, not green)

- [ ] CMS settings: /cms/settings/tags + /cms/settings/categories — selected-row highlight,
      usage-count links, add/delete row icons, Delete/Merge-tag modal buttons.
- [ ] /cms/content detail panes ("Suggested" badges) + content-tree drag/drop indicators;
      /cms/settings/opal-actions location schematic ("you-are-here" marker now info-blue).
- [ ] Visual Builder (edit a CMS page → /cms/edit/<id>): outline tree selection + insertion
      bar, Col/Row/Section selected rows, the ←Properties / outline panel toggles.
- [ ] /cmp/opal-studio canvas: tool rail active state, selection borders, alignment guides.
- [ ] /cmp/task/<id> + /cmp/task-plt/<id>: asset cards, workflow tab underline, content
      edit-pen toggle, step indicators, brief blockquote borders.
- [ ] /cmp/resource-management: planner "today" pill, workload grid selected cell/row, resize
      handle. /cmp/dashboard + /cmp/work-request filter-count badges; /cmp/reports metric tiles.
- [ ] /web-experimentation/home/\* builders + /optimizations/<id> (+ results, visual-editor):
      "Back to Home"/"Back to Optimizations" links (now Axiom `Link`), nav buttons, preview thumbs.
- [ ] /opal/opal-v3 library tabs; /opal/im-catalog demo cards/inputs; /opal/messages;
      /opal/im layout A/B/C (selection bgs, bubbles, VAU presence dots, reaction pills).
- [ ] /opal/context/stride-ds-setup: DS token swatches, category colours, rule callouts.

### ⚪ Left on purpose (NOT changed — don't flag these)

- Opal brand identity: `OpalMessage` shimmer/`PURPLE` constants, `opalStyles.css` `--opal-*`
  token layer, `opal/styles.css` sparkle-green hover — belong to the `--opal-gradient-*` TODO.
- `mermaid-renderer.ts` diagram theme colours (data-viz, not UI chrome).
- Files you had checked out during the sweep were skipped to avoid entangling WIP:
  `NotificationCatalog.tsx`, `agents/workflow/page.tsx` (+ `WorkflowNodes.tsx`),
  `settings/notifications/page.tsx`, `virtual-teammates/VAUCard.tsx` — these still contain
  manual accent; re-run the sweep on them once your edits land.

### Detection command (should return only the "left on purpose" set)

```
grep -rn "var(--ax-colors-\(bg\|fg\|border\)-accent\|fg\.accent\|bg\.accent\|border\.accent\|#0037ff\|#2457ff" app/
```
