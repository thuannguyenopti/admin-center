export const PLAYBOOK_MD = `# Opal Agent Playbook

This playbook defines how Opal agents should behave when generating content for Optimizely campaigns. Use it as a reference when configuring new agents or auditing existing ones.

## Goals

- Produce on-brand content that matches our tone of voice guidelines
- Prioritize clarity and conciseness over length
- Always cite sources when referencing statistics or third-party claims
- Adapt output format to the channel (email, blog, social, in-app)

## Content Types

### Blog Posts

Blog posts should follow a clear narrative arc: hook → problem → solution → call to action. Target a reading level of Grade 8–10. Aim for 600–900 words unless specified otherwise.

**Checklist before publishing:**
- [ ] Headline passes the "so what?" test
- [ ] Opening paragraph does not start with "In today's..."
- [ ] At least one internal link to a product page
- [ ] Meta description is 120–155 characters

### Email Campaigns

Keep subject lines under 50 characters. Preheader text should complement, not repeat, the subject. Body copy should have a single, clear CTA per email.

> **Note:** All email copy must go through the brand review queue before scheduling.

### Social Media

| Platform | Max length | Tone | Hashtags |
|---|---|---|---|
| LinkedIn | 1,300 chars | Professional | 3–5 |
| Twitter/X | 280 chars | Conversational | 1–2 |
| Instagram | 2,200 chars | Aspirational | 5–10 |

## Prohibited Content

The following must never appear in Opal-generated content:

- Competitor brand names (Salesforce, HubSpot, Adobe)
- Unverified performance claims ("increase revenue by 10x")
- Legal or compliance language without approval from Legal

## Escalation Path

If Opal produces content that violates these guidelines, flag it via the \`#opal-content-review\` Slack channel with a link to the artifact and a brief note on the issue.
`;

export const SALES_ENABLEMENT_MD = `# Sales Enablement Guide

Opal-assisted sales content should accelerate deal cycles without overpromising. This guide covers the approved use cases and constraints.

## Approved Use Cases

- **Case study drafts** — Opal can draft from a structured brief; Sales must review before sharing
- **Email sequences** — First-touch and follow-up templates only; no contract or pricing language
- **Battle cards** — Factual comparison content; sourced from approved product documentation only

## Tone for Sales

Sales content should be confident but not aggressive. Lead with outcomes, not features.

> Always personalise the opener. Generic intros reduce reply rates by 40% (internal A/B test, Nov 2024).

## Handoff Checklist

- [ ] Customer name and role are correct
- [ ] Pricing and SKU references reviewed by Sales Ops
- [ ] Legal boilerplate removed from AI drafts
- [ ] Signed off by regional sales lead before sending
`;

export const REPORT_MD = `# Q1 Performance Report

**Period:** January 1 – March 31, 2025 · **Prepared by:** Analytics Team · **Status:** Final

## Executive Summary

Q1 exceeded pipeline targets by 12% driven by strong organic search growth and a high-performing email re-engagement campaign. Content production velocity increased 31% YoY following the Opal rollout in February.

## Key Metrics

| Metric | Q1 Target | Q1 Actual | vs. Target | QoQ |
|---|---|---|---|---|
| MQLs | 1,200 | 1,348 | +12.3% | +8.1% |
| Content pieces published | 80 | 105 | +31.3% | +22.1% |
| Avg. time-to-publish | 6 days | 3.8 days | −36.7% | −28.4% |
| Email open rate | 24% | 27.4% | +3.4 pts | +1.9 pts |
| Organic sessions | 420K | 461K | +9.8% | +14.2% |

## MQL Trend — Q1 Weekly

\`\`\`mermaid
xychart-beta
  title "Weekly MQLs vs. Target"
  x-axis ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"]
  y-axis "MQLs" 0 --> 160
  bar [88, 92, 95, 101, 98, 107, 110, 112, 108, 118, 122, 127]
  line [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
\`\`\`

## Channel Mix

\`\`\`mermaid
pie title MQL Source by Channel
  "Organic Search" : 38
  "Email" : 27
  "Paid Search" : 19
  "LinkedIn" : 11
  "Referral" : 5
\`\`\`

## Channel Performance

### Organic Search

Organic sessions grew 9.8% vs. target, driven by 14 net-new SEO articles published in February and March. Three articles entered the top-3 position within 30 days of publication.

**Top performing articles:**

| Article | Sessions | Avg. position |
|---|---|---|
| "What is content experimentation?" | 18,420 | 2.1 |
| "Personalization vs. targeting" | 14,880 | 3.4 |
| "CMS headless architecture guide" | 11,230 | 1.8 |

### Email

The March re-engagement campaign delivered a 31.2% open rate and 6.4% CTR against a 5% CTR benchmark. Segments older than 18 months were excluded to protect sender reputation.

### Paid Media

Paid search CPL decreased 8% QoQ after keyword negative-list cleanup. LinkedIn Sponsored Content underperformed at $340 CPL vs. $280 target; creative refresh scheduled for Q2.

## Opal Impact

Since enabling Opal for content teams in mid-February:

- First drafts reviewed and approved 2.1× faster than manual drafts
- 78% of published pieces used an Opal-generated first draft
- Brand compliance score improved from 71% → 89% (measured by brand audit tool)

\`\`\`mermaid
xychart-beta
  title "Draft Approval Time (days) — Before vs. After Opal"
  x-axis ["Blog","Email","Social","Case Study","Landing Page"]
  y-axis "Days" 0 --> 8
  bar [6.8, 5.2, 3.1, 7.4, 5.9]
  bar [2.9, 2.1, 1.2, 3.8, 2.6]
\`\`\`

## Q2 Priorities

1. Launch account-based content programme targeting 50 named accounts
2. Expand Opal to the EMEA content team (target: April 15)
3. A/B test AI-personalised email subject lines at scale
4. Reduce paid social CPL to ≤ $280 with new creative variants
`;

export const MERMAID_MD = `# Content Pipeline

This diagram shows how content moves through the Optimizely production pipeline from brief to analytics.

\`\`\`mermaid
flowchart LR
  A[Brief] --> B[Opal Draft]
  B --> C{Brand Review}
  C -->|Approved| D[Edit & Polish]
  C -->|Revise| B
  D --> E{Legal Check}
  E -->|Clear| F[Publish]
  E -->|Hold| G[Legal Review]
  G --> D
  F --> H[Analytics]
  H -->|Insights| A
\`\`\`

## Stage Descriptions

### Brief
Content requests enter via the CMS intake form. Each brief must include target audience, channel, goal, and deadline.

### Opal Draft
Opal generates a first draft using the brief, relevant playbooks from the Files library, and current brand guidelines. Average draft time: 45 seconds.

### Brand Review
The brand team reviews for tone, messaging alignment, and prohibited content. Turnaround SLA: 1 business day.

### Edit & Polish
Content editors refine the approved draft. This stage typically takes 2–4 hours depending on content type.

### Legal Check
Required for any content referencing pricing, compliance claims, or competitive comparisons. Legal turnaround SLA: 2 business days.

### Publish
Approved content is published via the CMS. Metadata, tags, and distribution channels are set at this stage.

### Analytics
Published content is tracked for 30 days. Performance insights feed back into future briefs.
`;

export const FILE_CONTENT: Record<string, string> = {
	"1-1": PLAYBOOK_MD,
	"1-2": SALES_ENABLEMENT_MD,
	"4-1": REPORT_MD,
	"5-1": MERMAID_MD,
};
