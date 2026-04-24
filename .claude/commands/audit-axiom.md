# Audit Axiom

Reviews an existing component file for Axiom design system violations and optionally fixes them.

**Usage:** `/audit-axiom` (will ask for inputs)

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **File to check** — path to the component (e.g. `app/components/MyCard.tsx`), or "current" to check all files changed on this branch
2. **Action if violations found** — fix automatically, or just report

---

## Agent 1 — Compliance Reviewer

If the user said "current", run:
```
git diff main --name-only | grep -E '\.(tsx|ts)$'
```
to get the list of changed files. Otherwise use the provided path.

For each file, spawn a sub-agent with:

> Read this file: `FILE_PATH`
>
> Review it for Axiom design system violations:
> 1. `@tabler/icons-react` imported directly (must use `@optimizely/axiom-icons`)
> 2. Arbitrary spacing — e.g. `p="17"`, `gap="11"` (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64)
> 3. Hex or rgb colors (must use `fg.*`, `bg.*`, `border.*` tokens)
> 4. `size="sm"` on Input or SearchInput (only md, lg, xl)
> 5. Raw HTML elements (`div`, `span`, `p`, `button`, `input`, `label`) used as product UI
> 6. Manual `<Text>` or `<label>` beside an input instead of `<Field label="...">`
> 7. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 8. `@media (prefers-color-scheme: dark)` (must use `[data-theme="dark"]`)
>
> Respond with ONLY JSON:
> `{"pass": true, "violations": []}` or `{"pass": false, "violations": [{"line": 12, "rule": "...", "code": "..."}]}`

---

## Agent 2 — Fixer (only if violations found and user chose "fix")

For each file that failed, spawn a sub-agent with:

> Fix all Axiom compliance violations in this file.
>
> **File:** `FILE_PATH`
> **Violations:**
> `VIOLATIONS`
>
> Read the file, fix every violation listed, and write the corrected version back.
> Do not change anything beyond what's needed to fix the violations.

---

## Output

Print a compliance report:

```
✓ app/components/Foo.tsx — PASS
✗ app/components/Bar.tsx — 3 violations
  • Line 12: @tabler/icons-react import
  • Line 34: p="17" (not a valid spacing token)
  • Line 56: style={{ borderRadius: "8px" }}
```

If fixes were applied, confirm which files were updated.
