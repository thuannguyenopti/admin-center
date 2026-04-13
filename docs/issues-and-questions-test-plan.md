# Issues & Questions: Social Proof on PDP Test Plan

## Overview

This document identifies critical questions, potential issues, and decisions that need to be resolved before commencing the build of the test plan interface.

---

## 🔴 Critical Issues (Must Resolve Before Build)

### 1. Font Awesome Pro License

**Issue**: The design uses Font Awesome 6 Pro icons (paid license).

**Impact**: 
- Cannot implement if we don't have a Pro license
- Some icons (e.g., `calendar-time`, `vials`) are Pro-only

**Questions**:
- ❓ **Do we have a Font Awesome Pro license?**
- ❓ **Is the license available for this project?**

**Recommended Solution**:
Use Tabler Icons (`@tabler/icons-react`) as outlined in the icon mapping document. This provides:
- ✅ Free and open source
- ✅ Already installed in the project
- ✅ Excellent coverage of needed icons
- ✅ No licensing concerns

**Decision Needed**: Approve using Tabler icons instead of Font Awesome Pro

---

### 2. Circular Progress Chart Implementation

**Issue**: The Prioritization Score uses a circular donut chart that's not available in @optiaxiom/react.

**Impact**: 
- High complexity custom component
- May require additional dependencies

**Questions**:
- ❓ **Should we build a custom SVG component?** (4-6 hours)
- ❓ **Can we use a third-party library?** (recharts, react-circular-progressbar)
- ❓ **Is a simpler visualization acceptable?** (linear progress bar)

**Options**:

| Option | Pros | Cons | Effort |
|--------|------|------|--------|
| Custom SVG | No dependencies, exact control | More complex, need to maintain | 4-6h |
| react-circular-progressbar | Simple, lightweight (4.6kB) | Another dependency | 1-2h |
| recharts | Full-featured, flexible | Heavy (95kB), overkill | 2-3h |
| Linear progress | Simple, built-in | Doesn't match design | 30m |

**Recommended Solution**: Custom SVG component (matches design, no extra deps)

**Decision Needed**: Approve custom SVG implementation for circular progress

---

### 3. Responsive Behavior Strategy

**Issue**: The design shows a desktop layout (1440px) with two fixed-width panels. Mobile/tablet behavior is undefined.

**Impact**:
- Need to define breakpoint strategy
- Affects Opal panel implementation (overlay, drawer, or stack)

**Questions**:
- ❓ **How should the layout adapt on tablet (768-1023px)?**
- ❓ **How should the layout adapt on mobile (<768px)?**
- ❓ **Should the Opal panel become a drawer/modal on smaller screens?**
- ❓ **Should content stack vertically on mobile?**

**Recommended Breakpoint Strategy**:

| Breakpoint | Canvas | Opal Panel | Layout |
|------------|--------|------------|--------|
| Desktop (1440px+) | 1044px | 396px | Side-by-side |
| Laptop (1024-1439px) | 70% | 30% | Side-by-side (flexible) |
| Tablet (768-1023px) | 100% | Drawer (overlay) | Single panel with drawer |
| Mobile (<768px) | 100% | Drawer (bottom) | Single panel with bottom drawer |

**Decision Needed**: Approve responsive strategy

---

### 4. Data Integration Approach

**Issue**: The design shows specific data (stats, messages, suggestions) but the source is undefined.

**Impact**:
- Affects component API design
- Determines if we need API integration or mock data

**Questions**:
- ❓ **Is this a static demo or connected to live data?**
- ❓ **Should we use mock data files (JSON)?**
- ❓ **Is there a backend API to integrate with?**
- ❓ **Should chat messages be real-time or static?**

**Recommended Approach**:
1. **Phase 1**: Static mock data embedded in components
2. **Phase 2**: Extracted to JSON files for easy updates
3. **Phase 3**: API integration (if backend available)

**Decision Needed**: Confirm data integration strategy

---

## 🟡 Medium Priority Questions

### 5. Interactive Behaviors

**Issue**: Several interactive elements have undefined behaviors.

**Questions**:
- ❓ **Suggestion pills**: Are they clickable? What happens on click?
- ❓ **Quick action buttons** (refresh, copy, thumbs up/down): What do they do?
- ❓ **Content card with ring**: Is the ring a focus state or always visible?
- ❓ **Disclosure animations**: Should they have smooth expand/collapse?
- ❓ **Chat input**: Does it support multiline? Auto-resize?
- ❓ **Microphone button**: Is voice input functional or decorative?

**Recommended Defaults**:
- Suggestion pills: Clickable, populate chat input
- Quick actions: Copy = copy to clipboard, thumbs = feedback (no action yet)
- Card ring: Always visible (selected state)
- Disclosures: Smooth 200ms transition
- Chat input: Multiline, auto-resize up to 5 lines
- Microphone: Decorative (phase 1), functional (phase 2)

**Decision Needed**: Confirm interactive behaviors

---

### 6. Resize Panel Functionality

**Issue**: Design shows a "Grab Handle" between panels but resize behavior is undefined.

**Questions**:
- ❓ **Should users be able to resize the panels?**
- ❓ **What are the min/max widths for each panel?**
- ❓ **Should resize preference persist across sessions?**

**Implementation Impact**:
- Visual only: 1 hour
- Functional resize: 4-6 hours + library (`react-resizable-panels`)

**Recommended Approach**:
- Phase 1: Visual indicator only (no resize)
- Phase 2: Functional resize with constraints

**Decision Needed**: Functional resize in scope or not?

---

### 7. Dark Mode Implementation Details

**Issue**: Design provides light mode colors. Dark mode colors are inferred but not confirmed.

**Questions**:
- ❓ **Are the inferred dark mode colors correct?** (See color palette doc)
- ❓ **Should circular progress chart change colors in dark mode?**
- ❓ **Should the purple gradient text remain the same in dark mode?**
- ❓ **Should variation screenshot images have a border in dark mode?**

**Recommended Approach**:
- Use Axiom dark mode tokens where available
- Test with design stakeholder before finalizing
- Add subtle borders to images in dark mode for contrast

**Decision Needed**: Review and approve dark mode color palette

---

### 8. Variation Screenshot

**Issue**: Design shows a single "Control (A)" variation with a screenshot. Unclear if there are more variations.

**Questions**:
- ❓ **Is there a Variation B to show?**
- ❓ **Should variations be in a carousel/tabs?**
- ❓ **Is the screenshot clickable (modal/zoom)?**
- ❓ **Should screenshot be responsive (maintain aspect ratio)?**

**Recommended Approach**:
- Phase 1: Single variation shown (as designed)
- Phase 2: Tabbed interface if multiple variations exist
- Screenshots: Maintain aspect ratio, no click action

**Decision Needed**: Confirm variation display logic

---

## 🟢 Low Priority Questions

### 9. Animation & Transitions

**Questions**:
- ❓ **Should chat messages have enter animations?**
- ❓ **Should the Opal panel slide in on mount?**
- ❓ **Should disclosure expand/collapse be animated?**
- ❓ **Should there be loading states for the circular progress?**

**Recommended Approach**:
- Use Framer Motion (already installed)
- Subtle 200-300ms transitions
- Respect `prefers-reduced-motion`

**Decision Needed**: Animation preferences

---

### 10. Accessibility Requirements

**Questions**:
- ❓ **Should we support keyboard navigation for all interactive elements?**
- ❓ **Should the circular progress be announced to screen readers?**
- ❓ **Should disclosure state be conveyed via ARIA?**
- ❓ **Should we implement skip links?**

**Recommended Approach**:
- ✅ Full keyboard navigation
- ✅ ARIA labels for all icons
- ✅ ARIA attributes for disclosures
- ✅ Focus management for Opal panel
- ✅ Color contrast verification (already done)

**Decision Needed**: Confirm WCAG compliance level (AA recommended)

---

### 11. Error States

**Questions**:
- ❓ **What happens if chat messages fail to load?**
- ❓ **What if the circular progress has no data?**
- ❓ **Should we show error states for empty stats?**

**Recommended Approach**:
- Show skeleton loaders during loading
- Display empty states with helpful messages
- Error boundaries for component failures

**Decision Needed**: Error handling strategy

---

### 12. Performance Considerations

**Questions**:
- ❓ **Should we lazy load the Opal panel?**
- ❓ **Should chat messages be virtualized if long?**
- ❓ **Should images be optimized (Next.js Image component)?**

**Recommended Approach**:
- Use Next.js `<Image>` for variation screenshot
- Lazy load Opal panel if it's heavy
- No virtualization needed for current message count

**Decision Needed**: Performance optimization priority

---

## Design Gaps & Assumptions

### Gaps in Design

| Element | Gap | Assumption |
|---------|-----|------------|
| Toolbar actions | No states defined | Use standard hover/focus states |
| Info cards | No hover state | No hover effect needed |
| Stats table alignment | Label/value gap varies | Use consistent 32px gap |
| Badge styling | No dark mode version shown | Use subtle background in dark mode |
| Chat timestamps | Not shown | Don't implement |
| Scrollbar styling | Not specified | Use custom scrollbar from globals.css |

### Assumptions Made

1. **Canvas max-width**: 980px with 32px padding on sides
2. **Spacing system**: Use 4px base unit (4, 8, 12, 16, 24, 32, 40)
3. **Font loading**: Inter already configured in layout.tsx
4. **Icon sizing**: 16px for most, 24px for large contexts
5. **Disclosure default state**: Collapsed on initial load
6. **Chat messages**: Static content, no real-time updates (phase 1)
7. **Export button**: Downloads PDF or similar (behavior TBD)

---

## Technical Constraints

### Browser Support

**Questions**:
- ❓ **What browsers must we support?**
- ❓ **Should we support IE11?** (Not recommended in 2025)

**Recommended Support**:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari/Chrome (last 2 versions)

---

### Device Support

**Questions**:
- ❓ **Should we support very small screens (<375px)?**
- ❓ **Should we support very large screens (>2560px)?**

**Recommended Support**:
- Min width: 375px (iPhone SE)
- Max width: 1920px (standard HD)

---

## Recommendations Summary

### Priority 1: Resolve Before Build

1. ✅ **Use Tabler Icons** instead of Font Awesome Pro
2. ✅ **Build custom SVG** for circular progress
3. ✅ **Implement responsive strategy** with drawer pattern
4. ✅ **Start with mock data**, plan for API later

### Priority 2: Define During Build

5. **Interactive behaviors**: Use recommended defaults
6. **Resize panels**: Visual only (phase 1)
7. **Dark mode**: Use inferred colors, review with stakeholder
8. **Variations**: Single variation (phase 1)

### Priority 3: Nice to Have

9. **Animations**: Subtle transitions, use Framer Motion
10. **Accessibility**: WCAG AA compliance
11. **Error states**: Skeleton loaders + empty states
12. **Performance**: Use Next.js Image, no virtualization needed

---

## Decision Matrix

| Issue | Options | Recommended | Status | Blocker? |
|-------|---------|-------------|--------|----------|
| Icon library | FA Pro vs Tabler | **Tabler** | ✅ Decided | Yes |
| Circular progress | Custom vs Library | **Custom SVG** | ⏳ Pending | Yes |
| Responsive | Drawer vs Stack | **Drawer** | ⏳ Pending | Yes |
| Data source | Static vs API | **Static (phase 1)** | ⏳ Pending | No |
| Panel resize | Yes vs No | **No (phase 1)** | ⏳ Pending | No |
| Dark mode colors | Inferred vs Custom | **Inferred** | ⏳ Pending | No |
| Animations | Yes vs No | **Yes (subtle)** | ⏳ Pending | No |
| WCAG level | AA vs AAA | **AA** | ⏳ Pending | No |

---

## Next Steps

### Immediate Actions

1. **Stakeholder Review**: Share this document with product/design team
2. **Decision Meeting**: Schedule 30-minute call to resolve Priority 1 items
3. **Documentation**: Update color palette doc based on dark mode decision
4. **Asset Preparation**: Copy Figma SVGs and images to project

### Before Starting Development

- [ ] All Priority 1 decisions made
- [ ] Icon strategy approved
- [ ] Responsive behavior defined
- [ ] Dark mode colors reviewed
- [ ] Component complexity acknowledged

### Timeline Impact

Unresolved questions may add:
- **Circular progress decision**: 0-4 hours (if choosing library vs custom)
- **Responsive behavior**: 4-8 hours (if drawer pattern needs design)
- **Dark mode review**: 2-4 hours (if colors need revision)
- **Interactive behaviors**: 1-2 hours (per undefined interaction)

**Total Risk**: 7-18 hours of potential rework if decisions change mid-build

---

## Contact Points

| Question Type | Contact | Timing |
|--------------|---------|--------|
| Design decisions | Design Lead | Before build starts |
| Feature requirements | Product Manager | Before build starts |
| Technical constraints | Engineering Lead | During planning |
| Accessibility | A11y Specialist | During build |

---

## Appendix: Design Inconsistencies Noted

### Minor Inconsistencies

1. **Gap variations**: Stats tables have inconsistent label-value gaps (need to standardize)
2. **Icon sizes**: Some icons appear 14px, others 16px (use 16px as default)
3. **Border radius**: Cards appear borderless but may need 6px for consistency
4. **Font weights**: Some values use 600, others 500 (verify hierarchy)

### Clarifications Needed

1. **Toolbar height**: Appears ~56px but not explicitly stated
2. **Card shadows**: Most cards have no shadow except Opal panel
3. **Hover states**: No hover states shown for any interactive elements
4. **Focus states**: No focus indicators shown (need to define)

### Not Implemented in Phase 1

- Export functionality (button is visual only)
- Undo/Redo functionality
- Microphone voice input
- @ Mention autocomplete
- Quick action functionality (thumbs up/down)

---

## Success Criteria

Build is considered successful when:

- ✅ All Priority 1 decisions resolved
- ✅ Design matches Figma in light mode
- ✅ Dark mode is functional and consistent
- ✅ Responsive behavior works on mobile/tablet/desktop
- ✅ All icons render correctly
- ✅ Circular progress displays accurately
- ✅ Chat interface is usable
- ✅ WCAG AA compliance achieved
- ✅ No console errors or warnings
- ✅ Performance is acceptable (<3s initial load)

