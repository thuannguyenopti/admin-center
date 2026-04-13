# Test Plan Design Documentation

## Overview

This documentation package provides a comprehensive interpretation and assessment of the Figma design for the "Social Proof on PDP" test plan interface with Opal AI assistant integration.

**Design Date**: January 2025  
**Project**: Axiom Play - Optimizely Test Plan Manager  
**Tech Stack**: Next.js, TypeScript, Tailwind CSS, @optiaxiom/react

---

## 📋 Documentation Index

### 1. [Design Interpretation](./design-interpretation-test-plan.md)

**Purpose**: Detailed breakdown of the design structure, layout, and specifications.

**Contents**:
- Layout structure with ASCII diagrams
- Section-by-section breakdown
- Typography specifications
- Spacing and sizing measurements
- Border radius and shadows
- Responsive considerations
- Accessibility notes

**Use When**: Understanding the design structure, measuring elements, implementing layouts

---

### 2. [Color Palette](./color-palette-test-plan.md)

**Purpose**: Complete color reference for both light and dark modes.

**Contents**:
- Background colors (light & dark)
- Foreground/text colors (light & dark)
- Border colors (light & dark)
- Accent/brand colors
- Gradient specifications
- Shadow definitions
- Color usage by component
- Custom color variables needed
- Accessibility contrast ratios
- Quick reference tables

**Use When**: Implementing colors, creating custom CSS, verifying accessibility, supporting dark mode

---

### 3. [Component Assessment](./component-assessment-test-plan.md)

**Purpose**: Categorization of all UI components with implementation guidance.

**Contents**:
- **Part 1**: Components from @optiaxiom/react (can use directly)
- **Part 2**: Custom components required (must build)
  - Circular progress chart ⭐ High complexity
  - Horizontal progress bar
  - Stats table component
  - Gradient text component
  - Content card with ring shadow
  - Chat message component
  - Quick action buttons row
  - Suggestion pills
  - Toolbar component
  - Resize handle
- **Part 3**: Composite components (built from Axiom components)
- **Part 4**: Assets & icons listing
- Implementation priority and phasing
- Complexity summary with effort estimates
- Dependencies and libraries

**Use When**: Planning component development, estimating effort, identifying dependencies

---

### 4. [Icon Mapping](./icon-mapping-test-plan.md)

**Purpose**: Complete icon reference with implementation strategy.

**Contents**:
- Icon strategy recommendation
- **Part 1**: UI chrome icons (use Figma SVGs)
- **Part 2**: Semantic icons (use @tabler/icons-react)
- **Part 3**: Final icon mapping table
- SVG configuration for Next.js
- Color application methods
- Asset copy checklist
- Icon size standards
- Accessibility guidelines
- Dark mode support

**Use When**: Implementing icons, copying assets, ensuring accessibility, configuring imports

---

### 5. [Issues & Questions](./issues-and-questions-test-plan.md)

**Purpose**: Critical questions and decisions needed before build.

**Contents**:
- 🔴 **Critical Issues** (must resolve before build)
  1. Font Awesome Pro license
  2. Circular progress chart implementation
  3. Responsive behavior strategy
  4. Data integration approach
- 🟡 **Medium Priority Questions**
  5. Interactive behaviors
  6. Resize panel functionality
  7. Dark mode implementation details
  8. Variation screenshot handling
- 🟢 **Low Priority Questions**
  9. Animation & transitions
  10. Accessibility requirements
  11. Error states
  12. Performance considerations
- Design gaps & assumptions
- Technical constraints
- Recommendations summary
- Decision matrix
- Success criteria

**Use When**: Planning kickoff, stakeholder review, risk assessment, decision making

---

## 🎯 Quick Start Guide

### For Product Managers

1. Read: [Issues & Questions](./issues-and-questions-test-plan.md)
2. Review: Priority 1 decisions (icon library, circular progress, responsive strategy)
3. Schedule: Decision meeting to resolve blockers
4. Approve: Recommended solutions or provide alternatives

### For Designers

1. Read: [Color Palette](./color-palette-test-plan.md)
2. Review: Inferred dark mode colors (verify or correct)
3. Check: [Design Interpretation](./design-interpretation-test-plan.md) for accuracy
4. Clarify: Any inconsistencies noted in Issues doc

### For Developers

1. Read: [Component Assessment](./component-assessment-test-plan.md)
2. Check: Custom components complexity (36-53 hours estimated)
3. Review: [Icon Mapping](./icon-mapping-test-plan.md) for asset setup
4. Plan: Implementation phases based on Priority recommendations

### For QA/Accessibility

1. Read: [Color Palette](./color-palette-test-plan.md) - Contrast ratios section
2. Review: Accessibility notes in [Design Interpretation](./design-interpretation-test-plan.md)
3. Check: [Issues & Questions](./issues-and-questions-test-plan.md) - Accessibility requirements
4. Test: WCAG AA compliance criteria

---

## 📊 Key Metrics

### Design Complexity

| Metric | Value |
|--------|-------|
| Total Components | 35+ |
| Custom Components | 10 |
| Axiom Components | 15+ |
| Unique Colors | 25 (light mode) |
| SVG Assets | 19 icons |
| Image Assets | 2 |
| Estimated Build Time | 36-53 hours |

### Component Breakdown

| Category | Count | Effort |
|----------|-------|--------|
| High Complexity | 1 | 4-6h |
| Medium Complexity | 2 | 3-4h |
| Low Complexity | 7 | 8-12h |
| Composite | 4 | 6-8h |

### Priority Distribution

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 Critical (P0) | 4 | ⏳ Needs decision |
| 🟡 Medium (P1) | 4 | ⏳ Define during build |
| 🟢 Low (P2) | 4 | ✅ Recommended defaults |

---

## 🚦 Status & Decisions

### ✅ Resolved

- **Tech Stack**: Next.js, TypeScript, Tailwind CSS, @optiaxiom/react confirmed
- **Icon Library**: Tabler Icons recommended (no FA Pro dependency)
- **Asset Format**: Figma SVG exports for UI chrome icons
- **Color Tokens**: Axiom design system tokens with custom overrides
- **Accessibility**: WCAG AA compliance target

### ⏳ Pending Decisions

1. **Circular Progress Implementation**: Custom SVG vs library vs simplified
2. **Responsive Strategy**: Drawer pattern vs stacking vs other
3. **Dark Mode Colors**: Approve inferred colors or provide corrections
4. **Data Integration**: Static demo vs API integration timing
5. **Panel Resize**: Functional resize in scope or visual only
6. **Interactive Behaviors**: Confirm suggestion pills, quick actions, etc.

### ⚠️ Blockers

- None currently, but decisions 1-4 should be made before build starts
- Font Awesome Pro license question resolved (using Tabler instead)

---

## 📁 File Structure

```
docs/
├── README-test-plan-design.md          # This file
├── design-interpretation-test-plan.md  # Layout & specifications
├── color-palette-test-plan.md          # Colors (light & dark)
├── component-assessment-test-plan.md   # Component breakdown
├── icon-mapping-test-plan.md           # Icon strategy & assets
└── issues-and-questions-test-plan.md   # Decisions needed
```

---

## 🎨 Design System Integration

### Optimizely Axiom Components Used

The design heavily leverages the Axiom design system:

- **Layout**: Box, Flex, Grid
- **Content**: Heading, Text, Badge, Card, Avatar
- **Forms**: Input, Textarea, Button
- **Interactive**: Disclosure, Menu, Tooltip
- **Utility**: Separator, Skeleton

See [Component Assessment](./component-assessment-test-plan.md) for complete list.

### Custom Overrides Needed

Color variables added to `app/globals.css`:

```css
/* Opal-specific colors */
--opal-text-dark: #080736;
--opal-text-body: #262b37;
--opal-text-placeholder: #868fa4;
--opal-icon-gray: #626a81;

/* Gradient colors */
--purple-gradient-start: #392ecf;
--purple-gradient-end: #7740ec;
```

See [Color Palette](./color-palette-test-plan.md) for complete specifications.

---

## 🔧 Technical Requirements

### Dependencies (Already Installed)

- ✅ Next.js (v16.0.7)
- ✅ React (v19.2.1)
- ✅ TypeScript (v5.9.3)
- ✅ Tailwind CSS (v3.4.1)
- ✅ @optiaxiom/react (v1.9.1)
- ✅ @tabler/icons-react (v3.35.0)
- ✅ Framer Motion (v12.0.1)

### New Dependencies (Recommended)

**Optional** for enhanced functionality:

- `react-resizable-panels` (18kB) - For panel resize functionality
- `react-circular-progressbar` (4.6kB) - Alternative to custom SVG (if preferred)

**Not Needed**:
- ❌ Font Awesome Pro (replaced with Tabler)
- ❌ recharts (too heavy for single chart)

---

## 📱 Responsive Strategy (Recommended)

| Breakpoint | Layout | Opal Panel |
|------------|--------|------------|
| Desktop (1440px+) | Side-by-side | Fixed width (396px) |
| Laptop (1024-1439px) | Side-by-side | Flexible (30%) |
| Tablet (768-1023px) | Canvas full-width | Overlay drawer (right) |
| Mobile (<768px) | Canvas full-width | Bottom drawer |

See [Issues & Questions](./issues-and-questions-test-plan.md) for detailed strategy.

---

## 🎯 Implementation Phases

### Phase 1: Core Layout (Week 1)
- Toolbar component
- Two-panel layout (Canvas + Opal)
- Info cards grid
- Callout cards (Hypothesis, Targeting, Variations)
- Stats tables

### Phase 2: Custom Components (Week 2)
- Circular progress chart
- Horizontal progress bar
- Gradient text
- Content card with ring shadow
- Chat message components

### Phase 3: Opal Panel (Week 3)
- Chat body with messages
- Quick action buttons
- Disclosure components
- Input area
- Suggestion pills

### Phase 4: Polish & Responsive (Week 4)
- Dark mode verification
- Responsive breakpoints
- Animations & transitions
- Accessibility testing
- Performance optimization

**Total Timeline**: 4 weeks (160 hours) for complete implementation

**MVP Timeline**: 2 weeks (80 hours) for Phases 1-2 only

---

## ✅ Pre-Build Checklist

Before starting development:

- [ ] All Priority 1 decisions made (see Issues doc)
- [ ] Stakeholder approval on icon strategy (Tabler vs FA Pro)
- [ ] Circular progress implementation approach chosen
- [ ] Responsive behavior strategy approved
- [ ] Dark mode colors reviewed and approved
- [ ] Assets copied from Figma (`data://assets/` → project)
- [ ] Custom color variables added to globals.css
- [ ] Component file structure planned
- [ ] Development environment setup confirmed

---

## 🤝 Contributing & Feedback

### For Questions or Clarifications

1. Check the relevant documentation file first
2. Review [Issues & Questions](./issues-and-questions-test-plan.md) to see if already addressed
3. Add questions to the Issues doc for tracking
4. Schedule decision meeting if blocking

### For Updates to Docs

When design changes:

1. Update relevant doc file(s)
2. Update this README if structure changes
3. Note changes in git commit message
4. Notify team of updates

---

## 📚 Additional Resources

### Design Files
- Figma Design: `iVBPO12sMxaT4kwIL7Urqf-18943-45269`
- Assets Location: `data://attachments/figmas/`

### Codebase References
- Axiom Globals: `app/globals.css`
- Opal Styles: `app/styles/opalStyles.css`
- Layout: `app/layout.tsx`
- Theme Provider: `app/providers/ThemeProvider.tsx`

### External Links
- [Optimizely Axiom Design System](https://www.optimizely.com/axiom)
- [@optiaxiom/react Documentation](https://react.optiaxiom.com)
- [Tabler Icons](https://tabler-icons.io)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📝 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-02-11 | Initial documentation package | Kombai |

---

## 📞 Contact

For questions about this documentation:

- **Design Questions**: Contact Design Lead
- **Technical Questions**: Contact Engineering Lead  
- **Product Questions**: Contact Product Manager

---

**Ready to Build?** Start with the [Component Assessment](./component-assessment-test-plan.md) to understand what needs to be built, then review [Issues & Questions](./issues-and-questions-test-plan.md) to ensure all decisions are made.
