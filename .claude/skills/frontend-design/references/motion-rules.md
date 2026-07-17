# Motion Rules

Use this when adding, changing, or evaluating animation, transitions, hover states, loading states, tabs, modals, sheets, expandable panels, or interactive state changes.

## Frequency gate

Before adding or approving motion, classify how often a user triggers the interaction:

| Frequency | Rule |
| --- | --- |
| Keyboard-initiated | Do not add decorative motion. Keep feedback instant. |
| Frequent, many times per session | Use no animation or a very fast opacity/transform transition. |
| Occasional, a few times per session | Use subtle, fast motion that clarifies cause and effect. |
| Rare, onboarding, success, generation complete | More expressive motion is allowed if it supports comprehension or delight. |

If an animation does not explain hierarchy, continuity, state, progress, or feedback, remove it.

## Product timing

Default product timings:
- Hover/focus/press feedback: 120-180ms.
- Modal, popover, menu, tab, and panel transitions: 150-220ms.
- Loading-to-content or generated-result reveal: 180-280ms.
- Exit should usually feel faster than enter.

Avoid:
- Bouncy or elastic easing.
- Slow delayed transitions.
- Animating many unrelated elements at once.
- Mount animations on static page chrome.
- Motion that makes frequent workflows feel theatrical.

## Motion gaps

Look for state changes that snap abruptly:
- Modal, sheet, popover, or menu open/close.
- Tab content replacement.
- Loading to loaded content.
- Empty state to populated state.
- Expand/collapse sections.
- Detail panel changes after selecting a grid/list item.
- AI recommendation, confidence, or generation status changes.

If a snap makes the interface harder to parse, add a restrained transition. If the transition would slow a high-frequency workflow, keep it instant.

## Implementation guardrails

Always:
- Respect `prefers-reduced-motion`.
- Animate `opacity`, `transform`, and sometimes `filter`; avoid layout properties like `width`, `height`, `top`, and `left`.
- Keep focus management and keyboard navigation correct.
- Use existing animation libraries or local patterns if the repo already has them.
- Clean up timers, observers, and listeners.

Never:
- Use perpetual shimmer, pulse, float, or glow as a default AI cue.
- Add hover-scale to every card.
- Stagger every section uniformly.
- Hide content until JavaScript-triggered reveal runs.
- Use motion to compensate for weak hierarchy.

## Final motion check

Before finishing:
- Motion has a product reason.
- Reduced motion has a usable fallback.
- High-frequency controls remain fast.
- State continuity improved rather than became decorative.
- The UI still feels calm, premium, and operational.
