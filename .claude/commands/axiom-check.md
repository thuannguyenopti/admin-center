# /axiom-check

Audit the specified file (or current working file) for Axiom compliance violations and cross-check against Figma.

## Usage
```
/axiom-check [file-path] [figma-node-id]
```

## What this does

### Step 1 — Static scan
Search the target file for common Axiom violations:
```bash
grep -n "#[0-9A-Fa-f]\{3,6\}" $ARGUMENTS          # hardcoded hex colors
grep -n "fontSize:.*[0-9]" $ARGUMENTS              # raw fontSize numbers/strings
grep -n "fontWeight:.*[0-9][0-9][0-9]" $ARGUMENTS # numeric fontWeight
grep -n "style=.*padding\|style=.*margin" $ARGUMENTS # inline spacing
grep -n "<div\|<span\|<p \|<button" $ARGUMENTS     # raw HTML instead of Box/Text/Button
grep -n "className=.*bg-\|className=.*text-\|className=.*p-\|className=.*m-\|className=.*font-" $ARGUMENTS  # Tailwind layout/color/type classes
```

Report every violation with line number and the offending code.

### Step 2 — Figma cross-check (if node ID provided)
Call `mcp__Figma__get_design_context` with the provided node ID to get the Figma spec.
Compare computed styles from the live preview (`mcp__Claude_Preview__preview_inspect`) against Figma values for:
- Typography: font-size, font-weight
- Spacing: padding, gap, margin
- Colors: background-color, color, border-color
- Border radius, border width

Report any mismatches.

### Step 3 — Summary report
Output a table:

| # | File | Line | Violation | Recommended fix |
|---|------|------|-----------|-----------------|
| 1 | ... | ... | `#EF4444` hardcoded color | `var(--ax-colors-fg-error)` |
| 2 | ... | ... | `fontSize: 13` raw value | `<Text fontSize="sm">` |

Then ask: "Fix all violations now?" and apply fixes if confirmed.
