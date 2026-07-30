---
name: cmp
description: >
  CMP (Content Marketing Platform) domain knowledge. Invoke automatically when
  working in app/cmp/ or when the user asks about CMP concepts: Content Models,
  Tasks, Campaigns, DAM, publishing workflows, or the CMP Content Repository.
---

# CMP (Content Marketing Platform) Skill

Quick reference for Optimizely Content Marketing Platform concepts, Content Models, Tasks, Campaigns, DAM, and publishing workflows.

## When to use this skill

Use this skill when you need to:
- Understand CMP Content Repository architecture
- Work with Content Models (Content Blueprints)
- Implement Tasks and Campaigns
- Integrate with Digital Asset Management (DAM)
- Set up publishing and distribution workflows
- Configure content types and field structures

## CMP Content Repository Overview

The CMP Content Repository is a **decoupled headless CMS** that stores and hosts content while defining content structure. It provides:

- **API-accessible content** with metadata
- **Content production workflows** for collaboration
- **Integrated campaign planning** for marketing initiatives
- **DAM collections** for asset distribution
- **CRM/Marketing automation integration** for ROI analysis
- **Publishing infrastructure** for multi-channel distribution
- **Dynamic preview generation** for approval workflows

## Core Entities

### Instances
Represent organizations or creative management platforms in CMP.

### Content Models (Content Blueprints/Content Types)

Content Models define structured content architecture with:

**Features:**
- **Versioning** - Track changes over time
- **Component designation** - Reusable content blocks
- **Status management** - Disabled/retired states
- **Multiple templates** - Different layouts per type
- **Visual thumbnails** - Preview representations

**Implementation in this project:**
```typescript
type CmpContentModel = {
  id: string;                    // Unique identifier
  name: string;                  // System name (snake_case)
  displayName: string;           // User-facing name
  baseType: string;              // Page, Block, Media, etc.
  description?: string;          // Model description
  properties: Property[];        // Field definitions
  modifiedAt: string;            // Last update timestamp
  modifiedBy: string;            // User who modified
  isActive?: boolean;            // Active/inactive status
  apiIdentifier?: string;        // API reference name
  version?: string;              // Version identifier
  defaultLocale?: string;        // Default language
  modelType?: "component" | "content";  // Type classification
  coverImage?: string;           // Thumbnail image
};
```

### Structured Content

Instantiated content based on Content Models containing:
- **Reusability flags** - Enable component sharing across content
- **Expiration mechanisms** - Soft delete functionality
- **Version histories** - Track all changes with metadata
- **Locale variations** - Multi-language support
- **Generated previews** - Visual representations

## Field Types and Configuration

CMP supports **12+ field types:**

### Text Fields
- **Text** - Short text input
- **Long Text** - Multi-line text
- **Rich Text** - Formatted content with HTML

### Data Fields
- **Boolean** - True/false toggles
- **Number** - Numeric values
- **DateTime** - Date and time pickers
- **URL** - Web addresses
- **Location** - Geographic data

### Reference Fields
- **Library Assets** - References to DAM items
- **Content References** - Links to other content
- **Choices** - Dropdown selections

### Advanced
- **JSON Objects** - Structured custom data

### Field Attributes

All fields support these attributes:
```typescript
{
  id: string;              // Unique key
  name: string;            // System name
  displayName: string;     // User-facing label
  type: string;            // Field type
  required: boolean;       // Mandatory flag
  list: boolean;           // Multiple values allowed
  localized: boolean;      // Internationalization support
  order: number;           // Custom ordering
  helpText: string;        // Editor guidance
  description: string;     // Field purpose
}
```

## Internationalization (i18n)

CMP supports multi-locale content:

- **Single asset, multiple locales** - One content item with language variations
- **Independent publishing** - Each locale publishes separately
- **Separate analytics** - Track performance by language
- **Locale-specific lineage** - Version history per language

**Example locale codes:**
- `en-US` - English (United States)
- `en-GB` - English (United Kingdom)
- `es-ES` - Spanish (Spain)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)
- `ja-JP` - Japanese (Japan)
- `zh-CN` - Chinese (Simplified)

## Tasks

Tasks in CMP represent work items for content creation and management:

**Task Types:**
- Content creation assignments
- Review and approval workflows
- Publishing tasks
- Asset collection tasks

**Task Properties:**
- Title and description
- Assignee and due dates
- Status tracking
- Associated content/campaigns
- Priority levels

## Campaigns

Campaigns organize content and tasks around marketing initiatives:

**Campaign Features:**
- **Planning tools** - Timeline and resource management
- **Content grouping** - Associate multiple content pieces
- **Task management** - Track deliverables
- **Asset collections** - Organize campaign materials
- **ROI tracking** - Measure campaign performance
- **Multi-channel distribution** - Publish to various platforms

**Campaign Structure:**
```typescript
{
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "completed";
  content: ContentItem[];       // Associated content
  tasks: Task[];                // Campaign tasks
  assets: Asset[];              // DAM assets
  channels: Channel[];          // Distribution targets
}
```

## Digital Asset Management (DAM)

DAM in CMP provides centralized asset storage and distribution:

**Asset Types:**
- Images (JPG, PNG, SVG, WebP)
- Videos (MP4, WebM)
- Documents (PDF, DOC, PPT)
- Audio files
- Design files

**DAM Features:**
- **Collections** - Organize assets by campaign/project
- **Metadata** - Tags, descriptions, copyright info
- **Versioning** - Track asset updates
- **Distribution** - Share to channels
- **Search** - Find assets quickly
- **Permissions** - Control access

**Asset Integration:**
Fields can reference DAM assets using the "Library Assets" field type.

## Publishing and Distribution

CMP provides multi-channel publishing infrastructure:

### Publishing Channels

- **Web** - Website and web applications
- **Mobile** - iOS and Android apps
- **Social Media** - Facebook, Twitter, LinkedIn, Instagram
- **Email** - Marketing campaigns
- **CRM Systems** - Salesforce, HubSpot
- **Marketing Automation** - Marketo, Eloqua
- **Custom APIs** - Third-party integrations

### Publishing Workflow

1. **Content Creation** - Build content using models
2. **Review** - Approval workflows with previews
3. **Scheduling** - Set publish dates/times
4. **Distribution** - Push to selected channels
5. **Analytics** - Track performance metrics

### Event Triggers

CMP fires events for external systems:

**Event Types:**
- `content.created` - New content created
- `content.updated` - Content modified
- `content.versioned` - New version saved
- `content.expired` - Content soft-deleted
- `content.published` - Content distributed
- `component.referenced` - Shared component used

**Webhooks:**
Configure webhooks to receive events and trigger actions in external systems.

## Content Type Integration

External CMS systems (AEM, Sitecore) can:

- **Create content types via API** - Programmatic model creation
- **Use source metadata** - Maintain system IDs
- **Prevent modification conflicts** - Lock externally-managed types
- **Sync bidirectionally** - Keep systems in sync

## Best Practices

### Content Modeling
1. **Plan structure first** - Design models before implementation
2. **Use components** - Create reusable content blocks
3. **Keep models focused** - One purpose per model
4. **Version strategically** - Major changes = new version
5. **Document fields** - Add helpful descriptions

### Internationalization
1. **Set default locale** - Usually `en-US`
2. **Flag localizable fields** - Not all fields need translation
3. **Plan for expansion** - Design for future languages
4. **Test previews** - Verify locale-specific rendering

### DAM Organization
1. **Use collections** - Group by campaign/project
2. **Tag consistently** - Standardize metadata
3. **Version control** - Keep asset history
4. **Optimize files** - Compress before upload
5. **Rights management** - Track usage permissions

### Publishing Strategy
1. **Schedule content** - Plan publication timing
2. **Test previews** - Verify before publishing
3. **Multi-channel coordination** - Sync across platforms
4. **Monitor performance** - Track engagement metrics
5. **Archive old content** - Use expiration dates

## API Integration

CMP provides RESTful APIs for:

**Content Management:**
```
POST /api/content-types        # Create content model
GET /api/content-types/:id     # Get model details
PUT /api/content-types/:id     # Update model
DELETE /api/content-types/:id  # Delete model
```

**Content Operations:**
```
POST /api/content              # Create content
GET /api/content/:id           # Get content
PUT /api/content/:id           # Update content
DELETE /api/content/:id        # Soft delete (expire)
POST /api/content/:id/publish  # Publish to channels
```

**Asset Management:**
```
POST /api/assets               # Upload asset
GET /api/assets/:id            # Get asset
PUT /api/assets/:id            # Update metadata
DELETE /api/assets/:id         # Remove asset
```

## Project Implementation

This project implements CMP Settings for Content Model management:

**Routes:**
- `/cmp/settings` - Settings landing page
- `/cmp/settings/content-models` - Content models list
- `/cmp/settings/content-models/new` - Create new model
- `/cmp/settings/content-models/[id]` - Edit existing model

**Storage:**
Uses `localStorage` via `usePersistentState` hook:
```typescript
const [cmpContentModels, setCmpContentModels] =
  usePersistentState("cmpContentModels", []);
```

**Components:**
Built with Axiom design system components for consistency.

## Additional Resources

- **Official CMP Docs:** https://docs.developers.optimizely.com/content-marketing-platform/
- **Content Repository:** https://docs.developers.optimizely.com/content-marketing-platform/docs/cmp-content-repository
- **API Reference:** https://docs.developers.optimizely.com/content-marketing-platform/reference/
- **Axiom Design System:** https://optimizely-axiom.github.io/optiaxiom/

## Notes

- CMP is distinct from Optimizely CMS - they serve different purposes
- Content Models in CMP ≠ Content Types in CMS (separate systems)
- Always use proper locale codes (IETF BCP 47 format)
- DAM assets are first-class entities, not just file uploads
- Publishing is multi-channel by design, not single-destination
