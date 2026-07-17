# Page Generation Rules & Best Practices

This document defines the core rules and guidelines for AI-powered page generation. These rules ensure pages are well-structured, visually consistent, and follow the Optimizely Axiom design system.

**Company Context:** For brand voice, messaging, and company background, see [STRIDE_COMPANY_CONTEXT.md](../STRIDE_COMPANY_CONTEXT.md).

## 1. Content Hierarchy & Structure

### Section Headings
Each section has ONE primary heading that serves as both the section title and the content heading. This heading should be meaningful and descriptive of the section's purpose.

Multi-column sections with list items can have one main section heading (h2) plus item headings (h3) for each list item.

### Heading Levels
- **Hero section**: Use `h1` for the main headline (ONE per page)
- **Section headings**: Use `h2` for primary section titles
- **List item titles**: Use `h3` for feature names, card titles, sub-items

Maintain a logical heading hierarchy: h1 → h2 → h3, with each level following naturally from the previous.

### Content Flow Example
```
Section: "Discover More About the Race" (h2)
  → Body text describing the race
  → CTA button
```

## 2. Visual Design & Spacing

### Axiom Design System Compliance
- **Spacing tokens**: Use `"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80"`
- **Semantic colors**: Use `fg.*`, `bg.*`, `border.*` tokens
- **Border radius**: Use `rounded` prop
- **Shadows**: Use `shadow` prop
- **Dark mode**: Use `[data-theme="dark"]` selector

### Section Spacing
- **Between sections**: `48` or `64` vertical spacing (use larger for distinct sections)
- **Within sections**: `24` or `32` between major elements
- **Element gaps**: `12` or `16` between related items
- **Hero sections**: Often need `80` bottom padding to create breathing room

### Typography
- **Hero headlines**: Bold, large (h1), concise (under 60 characters)
- **Section titles**: Semi-bold (h2), clear hierarchy
- **Body text**: 2-3 sentences per paragraph for readability
- **CTAs**: Action-oriented and specific, telling users exactly what happens next

## 3. Column & Layout Rules

### When to Use Columns
- **Hero sections**: `columns: 1` (full-width focus)
- **Features**: `columns: 3` (or number of features for side-by-side layout)
- **Benefits**: `columns: 2` or `3` (balanced visual weight)
- **Testimonials**: `columns: 3` (social proof in grid)
- **Pricing tiers**: `columns: 3` or `4` (one per tier)
- **CTA/FAQ/Content**: `columns: 1` (single focus)

### Content Distribution
- When `columns > 1` with `listItems`, distribute items evenly across columns
- Each column should have roughly equal content weight
- Shared elements (section heading, description) go in the first column before distribution

### Images in Columns
For multi-column layouts, choose the appropriate image placement:
- One large image in a dedicated column (hero split layout)
- One image per column with text (illustrated features)
- Separate image row below columned content

## 4. Image Generation Guidelines

### Visual Style Consistency
Select ONE visual style per page: `realistic-photo`, `illustration`, `3d-render`, `flat-design`, or `artistic`. Maintain this style consistently across all images. When reference images are provided, analyze their style and match it exactly.

### Image Prompts
- **Be specific**: Include relevant details about subject, composition, lighting
- **Match the content**: Images should directly support the surrounding text
- **Accessibility**: Provide descriptive alt text for every image
- **Consistency**: Use similar compositions/framing for images in the same section

### Realistic Photos
Use documentary/editorial photography style with real, photographable scenes. Specify lighting conditions (natural light, soft light, etc.).

Example: "Professional photograph of a modern office workspace with natural window lighting, overhead view, minimalist design"

### Illustrations
Specify illustration style (hand-drawn, vector, digital painting), composition, and color palette.

Example: "Hand-drawn illustration of a team collaborating, warm colors, friendly style"

## 5. Content Quality Standards

### Copywriting
- **Tone consistency**: Maintain the specified tone (professional, casual, technical, friendly) throughout
- **Audience awareness**: Write for the target audience's knowledge level
- **Specificity**: Include specific details from user instructions with concrete examples
- **Scannable**: Use clear headings, short paragraphs, and structure content for easy scanning
- **Value-focused**: Lead with benefits and outcomes

### CTAs (Call-to-Action)
- **Action-oriented**: Start with verbs ("Start your trial", "Download the guide", "Join the community")
- **Specific**: Tell users exactly what happens ("Get Started Free", "Download the Complete Guide")
- **Contextual**: Match the page's goal and user's journey stage
- **Placement**: Typically in hero section and before final CTA section

### List Items (Features, Benefits, etc.)
- **Title**: Short, benefit-driven (3-7 words)
- **Description**: Supporting detail, expand on the benefit (1-2 sentences)
- **Quantity**: Generate 2-3x as many items as columns for variety
- **Diversity**: Cover different aspects and benefits with unique angles

## 6. Best Practices

1. One primary heading per section that serves as both label and content heading
2. Write specific, relevant content based on user instructions
3. Maintain consistent visual style across all images
4. Follow proper heading hierarchy (h1 → h2 → h3)
5. Keep paragraphs concise and scannable (2-3 sentences)
6. Write action-oriented, specific CTAs
7. Generate 2-3x list items as there are columns
8. Distribute content evenly across columns
9. Use Axiom design system tokens exclusively
10. Create images that directly support and enhance the content

## 7. Section Type Guidelines

### Hero
- Purpose: Strong first impression, clear value proposition
- Elements: h1 headline, supporting text (1-2 sentences), primary CTA, optional image
- Columns: 1 (or 2 if split layout with image)
- Focus: What is this? Why should I care? What should I do?

### Features
- Purpose: Showcase key capabilities or benefits
- Elements: h2 section title, list items with h3 titles + descriptions, optional icons/images
- Columns: 3 (or number of features)
- Focus: Specific, tangible capabilities

### Benefits
- Purpose: Explain outcomes and value
- Elements: h2 section title, list items with h3 titles + descriptions
- Columns: 2 or 3
- Focus: Results, improvements, advantages

### Testimonials
- Purpose: Build trust through social proof
- Elements: h2 section title, listItems array (each item: title = person name, description = full quote)
- Columns: 3 (each testimonial in its own column)
- Focus: Authentic experiences, credible sources
- Content structure: Use listItems with title (name/role) and description (the testimonial quote)

### Pricing
- Purpose: Present pricing options clearly
- Elements: h2 section title, pricing tiers (title, price, features, CTA per tier)
- Columns: 3 or 4 (one per tier)
- Focus: Clear differentiation, value alignment

### CTA (Call-to-Action)
- Purpose: Drive conversion with focused action
- Elements: h2 compelling headline, supporting text, primary CTA button
- Columns: 1
- Focus: Single, clear action with clear value

### FAQ
- Purpose: Address common questions
- Elements: h2 section title, list items with h3 question + answer text
- Columns: 1 or 2
- Focus: Anticipated objections/questions

### Content
- Purpose: General content section
- Elements: h2 section title, paragraphs, optional images/buttons
- Columns: 1
- Focus: Informational, supporting details

## 8. Property-Based Page Generation

For Page content types without outline properties (e.g., Blog Post, About Page), the generator creates a data object with property values instead of visual builder structures.

### Property Type Examples

**String**: Short text fields
- Example: `"title": "5 Tips for Your First Marathon"`
- Keep under 100 characters
- Used for titles, names, labels

**LongString**: Longer descriptions
- Example: `"subtitle": "Build confidence and endurance with these essential training strategies"`
- 1-2 paragraphs
- Used for descriptions, summaries

**XhtmlString**: Rich HTML content
- Example: `"body": "<h2>Introduction</h2><p>Training for 26.2 miles can be daunting...</p>"`
- Use semantic HTML tags: `<h2>`, `<h3>`, `<p>`, `<ul>`, `<strong>`, `<em>`
- Structure with proper headings and paragraphs
- Keep markup clean and valid

**ContentReference**: Links to other content
- Example: `"author": ""`, `"seo": ""`
- Currently left empty for AI generation
- Future enhancement: generate referenced content

### Content Generation Behavior

**Detection**: The system automatically detects whether a content type uses outlines or properties by examining the content type schema.

**Property-Based Flow** (for content types like Blog Post):
1. Analyzing instructions (no visual structure analysis)
2. Generating content (AI generates property values)
3. Populating properties (data object sent to frontend)

**Outline-Based Flow** (for content types like Landing Page):
1. Analyzing instructions (section structure planning)
2. Generating text content (copy for each section)
3. Generating images (DALL-E for visual elements)
4. Populating elements (outline tree with elements)

### Example Blog Post Generation

```json
{
  "title": "5 Tips for Your First Marathon",
  "subtitle": "Build confidence and endurance with these essential training strategies for race day success",
  "body": "<h2>Introduction</h2><p>Training for your first marathon is an exciting journey that requires dedication, patience, and smart planning. Whether you're a seasoned runner stepping up to 26.2 miles or relatively new to the sport, these five essential tips will help you prepare effectively and cross that finish line with confidence.</p><h2>Tip 1: Build a Solid Mileage Base</h2><p>Before diving into marathon-specific training, establish a foundation of consistent running. Aim for at least 20-25 miles per week for several months before starting your marathon plan. This base mileage helps your body adapt to the demands of long-distance running and reduces injury risk.</p><h2>Tip 2: Follow a Structured Training Plan</h2><p>Choose a 16-20 week training plan that matches your experience level. A good plan gradually increases weekly mileage, includes rest days, and incorporates different types of runs: easy runs, long runs, tempo runs, and speed work. Consistency is more important than perfection.</p><h2>Tip 3: Prioritize Recovery and Rest</h2><p>Rest days aren't optional—they're when your body adapts and grows stronger. Include at least one complete rest day per week, get adequate sleep, and consider cross-training activities like swimming or cycling to maintain fitness while giving your running muscles a break.</p>",
  "author": "",
  "seo": ""
}
```

### XhtmlString Best Practices

When generating rich HTML content:
- Start with an h2 for the first section (h1 is reserved for the page title)
- Use h2 for major sections, h3 for subsections
- Keep paragraphs concise (2-4 sentences)
- Use `<strong>` for emphasis, `<em>` for subtle emphasis
- Structure lists with `<ul>` or `<ol>` when appropriate
- Avoid inline styles—use semantic HTML only

## 9. Quality Checklist

Generated pages should have:

- [ ] ONE h1 on the page (in hero section)
- [ ] One meaningful heading per section
- [ ] Logical heading hierarchy (h1 → h2 → h3)
- [ ] Consistent visual style across all images
- [ ] Specific, relevant content based on user instructions
- [ ] Action-oriented, specific CTAs
- [ ] Content distributed evenly across multi-column sections
- [ ] 2-3x list items generated for the number of columns
- [ ] Axiom spacing tokens throughout
- [ ] Semantic color tokens throughout
- [ ] Concise paragraphs (2-3 sentences)
- [ ] Descriptive alt text for all images
- [ ] Consistent tone throughout
- [ ] Content aligned with user instructions

## 9. Examples

### Hero Section
```json
{
  "Hero": {
    "heading": "Transform Your Workflow with AI-Powered Insights",
    "subheading": "Make data-driven decisions faster with intelligent automation that adapts to your team's needs.",
    "buttonText": "Start Free Trial",
    "buttonUrl": "#signup",
    "imagePrompts": [{
      "prompt": "Professional photograph of a modern workspace with team members collaborating around a large screen showing data dashboards, natural window lighting, clean minimalist office design",
      "alt": "Team collaborating on data insights in modern office"
    }]
  }
}
```

### Features Section (3 columns)
```json
{
  "Features": {
    "heading": "Built for Modern Teams",
    "listItems": [
      {
        "title": "Real-Time Collaboration",
        "description": "Work together seamlessly with live updates and instant syncing across all devices."
      },
      {
        "title": "AI-Powered Insights",
        "description": "Get actionable recommendations based on your data patterns and team behavior."
      },
      {
        "title": "Enterprise Security",
        "description": "Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards."
      },
      {
        "title": "Seamless Integrations",
        "description": "Connect with your existing tools including Slack, GitHub, and Google Workspace."
      },
      {
        "title": "Smart Workflows",
        "description": "Automate repetitive tasks with customizable templates and intelligent routing."
      },
      {
        "title": "Advanced Analytics",
        "description": "Track performance metrics and gain insights with powerful visualization tools."
      }
    ]
  }
}
```

### CTA Section
```json
{
  "Call to Action": {
    "heading": "Ready to Transform Your Team's Productivity?",
    "subheading": "Join thousands of teams already working smarter with our platform.",
    "buttonText": "Start Your Free 30-Day Trial",
    "buttonUrl": "#signup"
  }
}
```

### Testimonials Section (3 columns)
```json
{
  "Testimonials": {
    "heading": "What Runners Are Saying",
    "listItems": [
      {
        "title": "Anna S.",
        "description": "Participating in the Stride 10km race was an unforgettable experience! The route was stunning, and the support from the community was incredible."
      },
      {
        "title": "Erik L.",
        "description": "As a professional runner, I appreciated the organization and the challenge the course provided. It was both fun and competitive."
      },
      {
        "title": "Maria J.",
        "description": "It was my first 10km race, and the encouragement from other runners and organizers made it such a rewarding experience. Can't wait for next year!"
      }
    ]
  }
}
```
Note: When a testimonials section has `columns: 3`, each list item will be displayed in its own column, creating a side-by-side layout.

---

## Usage in Code

Reference these rules in AI prompts like this:

```typescript
const systemPrompt = `You are a professional web page designer.

${PAGE_GENERATION_RULES}

Now generate content following ALL rules above...`;
```

Or import specific sections:

```typescript
import { CONTENT_HIERARCHY_RULES, VISUAL_DESIGN_RULES } from './PAGE_GENERATION_RULES.md';
```

---

**Last Updated**: 2026-05-07
**Version**: 1.0.0
