# Image Gen/Editing - Feature Requirements

**Project:** Opal Platform - Content Marketing Platform (CMP)
**Epic:** Image / Video
**Priority:** Q2 2026 Roadmap
**Source:** Opal Platform Coda Doc → Q2 Epics & Features

---

## Overview

The Image Gen/Editing feature is part of the Q2 2026 roadmap for the Opal Platform CMP. The goal is to update and enhance the image and video generation tools and use cases to better serve content marketers.

## Requirements (from Coda)

### Core Deliverables

1. **Update image gen tools & use cases**
   - Enhance existing image generation capabilities
   - Add new use cases for marketing content creation
   - Integration with agent system for automated workflows

2. **Update video gen tools & use cases**
   - Enhance existing video generation capabilities
   - Add new use cases for video content creation
   - Integration with agent system for automated workflows

## Related System Components

### 1. Agent System Integration

The Image/Video generation should integrate with the Opal agent infrastructure:

- **Specialized Agents** - Create dedicated agents for image/video generation tasks
- **Workflow Agents** - Enable automated content creation pipelines
- **Agent Directory** - List image/video generation agents for discovery

### 2. Adaptive Blocks

UI components should use the Adaptive Blocks system:

- **Tool Adaptive Blocks** - Dynamic UI for generation tools
- **Agent Adaptive Blocks** - Agent-specific interfaces
- **GUI Builder** - Visual configuration of generation parameters
- **Headless Compatibility** - API-first design for programmatic access

### 3. RAG (Retrieval-Augmented Generation)

Content generation should leverage RAG:

- **External Data Sources** - Pull brand assets from Google Docs, OneDrive
- **Opti-Product Connectors** - Connect to CMS, DAM systems
- **Reference Material** - Link to source assets in responses
- **Context Awareness** - Use instructions and memory for brand-consistent outputs

### 4. Memory System

- **Agent Memory** - Remember successful generation patterns
- **Tool Preferences** - Avoid tools that error out, prefer reliable ones
- **Context Retrieval** - Reference previous successful generations

### 5. Instructions & Guidelines

- **Visual Brand Guidelines** - Support for brand style guides
- **File Attachments** - Upload reference images, style guides
- **Instruction Hierarchy** - Link image/video instructions to brand instructions

## Technical Architecture Considerations

### Tools

Image/video generation will be exposed as **Tools** in the Opal platform:

- Tools SDK integration
- Auto-sync tool registries
- Tools installation along with instructions
- Remote MCP providers for third-party image/video APIs
- Error handling and notifications

### Canvas Integration

Generated assets should support Canvas:

- Artifacts tab for viewing generated images/videos
- Share canvas with org members
- Git integration for version control

### Projects / Teams

Scope image/video generation to projects:

- Project-specific instructions
- Team-specific agents
- Shared canvas artifacts

## Use Cases (Inferred)

Based on the CMP context and related agent use cases:

1. **Campaign Asset Generation**
   - Generate hero images for campaigns
   - Create social media graphics
   - Produce video ads

2. **Content Variation**
   - A/B test variations of visuals
   - Localized image variants
   - Responsive asset generation

3. **Brand Compliance**
   - Check generated assets against brand guidelines
   - Auto-apply brand colors, fonts, logos
   - Flag non-compliant assets

4. **Workflow Automation**
   - Trigger image generation when campaign is created
   - Auto-generate thumbnails and previews
   - Batch process asset creation

5. **Integration with Work Requests**
   - Generate initial concepts from work request briefs
   - Produce mockups for approval
   - Iterate based on feedback

## Related Projects

### Biruni (Data Analytics)

- Data visualization snippets for reports
- Chart/graph generation

### Mercator (Chat on Customer Front-End)

- Customer-facing chat with image generation
- Preview images in conversation

### Aldus (Landing Page Generation)

- Generate page hero images
- Create layout mockups
- Visual assets for landing pages

## Design System: Optiaxiom

All UI components MUST use the Optiaxiom design system:

- **Documentation:** https://optimizely-axiom.github.io/optiaxiom/
- **Package:** `@optiaxiom/react`
- **See:** `/app/cmp/CLAUDE.md` for component reference

### Key Components for Image Gen UI

- `Button` - Trigger generation, download, share
- `Input` / `Field` - Prompt input, parameter configuration
- `Card` - Display generated assets
- `Badge` - Status indicators (generating, complete, error)
- `Tabs` - Switch between image/video modes
- `Menu` - Asset actions (download, edit, delete, share)
- `Dialog` - Full-screen preview, settings
- `SearchInput` - Search generated assets

## File Structure

```
app/cmp/
├── opal-studio/          ← Suggested location for Image Gen/Editing
│   ├── page.tsx          ← Main studio interface
│   ├── components/
│   │   ├── ImageGenerator.tsx
│   │   ├── VideoGenerator.tsx
│   │   ├── AssetGallery.tsx
│   │   ├── GenerationSettings.tsx
│   │   └── PreviewModal.tsx
│   └── lib/
│       ├── generation-api.ts
│       └── asset-storage.ts
└── coda/
    └── Image-Gen-Editing/  ← This documentation
```

## Next Steps for Implementation

1. **Define Detailed Use Cases** - Work with PM team to flesh out specific use cases
2. **API Integration** - Identify image/video generation APIs (DALL-E, Midjourney, Runway, etc.)
3. **UI Design** - Create mockups for generation interface
4. **Agent Development** - Build specialized agents for image/video tasks
5. **Tools SDK** - Wrap generation APIs as Opal Tools
6. **Testing** - Pre-launch testing program (see Coda templates)
7. **Launch** - Agent Directory release (coordinate with PM team)

## References

- **Coda Doc:** Opal Platform → Q2 Roadmap → Q2 Epics & Features
- **Design System:** `/app/OPTIAXIOM_DESIGN_SYSTEM.md`
- **CMP Guidelines:** `/app/cmp/CLAUDE.md`
- **Full Content:** `README.md` (in this directory)
- **Focused Content:** `image-gen-editing.md` (in this directory)

---

*Last Updated: March 20, 2026*
*For questions, contact: Opal Platform PM Team*
