# 🚀 Quick Start - Image Gen/Editing for Opal CMP

**👋 Welcome CODEX!** This is your guide to implementing the Image Gen/Editing feature for the Opal Platform CMP.

---

## 📚 Read These Files First

1. **[REQUIREMENTS.md](REQUIREMENTS.md)** ← **Start here!**
   - Feature overview and core requirements
   - Technical architecture considerations
   - Integration points with Opal platform

2. **[INDEX.md](INDEX.md)**
   - Navigation guide for all documentation
   - Document hierarchy and structure

3. **[image-gen-editing.md](image-gen-editing.md)**
   - Extracted content from Coda (focused on Image/Video)

4. **[README.md](README.md)**
   - Full Q2 Epics & Features content (broader context)

---

## ⚡ Quick Summary

### What Needs to be Built

- **Image generation tools** - Create and enhance image gen capabilities for marketers
- **Video generation tools** - Create and enhance video gen capabilities for marketers
- **Use case library** - Document and implement common marketing use cases
- **Agent integration** - Connect to Opal's agent system for automation

### Key Requirements

✅ Update image gen tools & use cases
✅ Update video gen tools & use cases
✅ Integrate with Opal agent system
✅ Use Optiaxiom design system
✅ Support Adaptive Blocks UI
✅ Leverage RAG for context-aware generation
✅ Memory system for learning preferences

---

## 🎨 Design System

**MUST USE:** [Optiaxiom](https://optimizely-axiom.github.io/optiaxiom/)

See [/app/cmp/CLAUDE.md](../../CLAUDE.md) for:
- Component reference
- Import patterns
- Common CMP patterns
- Icon assets

---

## 🏗️ Suggested Architecture

```
app/cmp/opal-studio/
├── page.tsx                    ← Main studio interface
├── components/
│   ├── ImageGenerator.tsx      ← Image gen UI
│   ├── VideoGenerator.tsx      ← Video gen UI
│   ├── AssetGallery.tsx        ← View generated assets
│   ├── GenerationSettings.tsx  ← Parameters, prompts
│   └── PreviewModal.tsx        ← Full-screen preview
└── lib/
    ├── generation-api.ts       ← API client
    └── asset-storage.ts        ← Asset management
```

---

## 🔗 Integration Points

### 1. Agent System
- Create specialized agents for image/video tasks
- Workflow automation for batch generation

### 2. RAG
- Pull brand assets from external sources
- Context-aware generation using brand guidelines

### 3. Memory
- Learn from successful generations
- Remember user preferences and patterns

### 4. Tools
- Expose as Opal Tools via Tools SDK
- Remote MCP providers for third-party APIs

### 5. Canvas
- Display artifacts
- Share with team
- Version control

---

## 🎯 Example Use Cases

1. **Campaign Hero Images** - Generate visuals for campaign launches
2. **Social Media Graphics** - Create platform-specific assets
3. **Video Ads** - Produce short-form video content
4. **A/B Test Variants** - Generate multiple versions for testing
5. **Brand Compliance** - Ensure assets match brand guidelines

---

## 📝 Implementation Checklist

- [ ] Review [REQUIREMENTS.md](REQUIREMENTS.md)
- [ ] Review Optiaxiom components in [/app/cmp/CLAUDE.md](../../CLAUDE.md)
- [ ] Create `/app/cmp/opal-studio/` directory structure
- [ ] Implement ImageGenerator component
- [ ] Implement VideoGenerator component
- [ ] Implement AssetGallery component
- [ ] Connect to generation APIs
- [ ] Build specialized agents
- [ ] Wrap as Opal Tools
- [ ] Add to CMP navigation
- [ ] Testing & validation
- [ ] Documentation & examples

---

## 🤔 Questions?

- **Product Requirements:** See [REQUIREMENTS.md](REQUIREMENTS.md)
- **Design System:** See [/app/cmp/CLAUDE.md](../../CLAUDE.md)
- **Broader Context:** See [README.md](README.md)
- **Project Structure:** See [INDEX.md](INDEX.md)

---

## 🔍 Related Projects

- **Biruni** - Data analytics & visualization
- **Mercator** - Customer-facing chat
- **Aldus** - Landing page generation

All of these may need image/video generation capabilities!

---

**Ready to build?** Start with [REQUIREMENTS.md](REQUIREMENTS.md) 🚀
