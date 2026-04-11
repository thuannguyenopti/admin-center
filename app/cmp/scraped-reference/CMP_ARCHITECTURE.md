# CMP (Content Marketing Platform) - Scraped Architecture Reference
> Scraped from https://cmp.optimizely.com on Feb 26, 2026

## Tech Stack
- **Framework**: Angular (ng-scope, ng-isolate-scope directives)
- **Design System**: Optiaxiom v1.8.7 (data-axiom="1.8.7")
- **Component Library**: NDL (Needle Design Language) components
- **Custom Elements**: Web Components (opti-common-header, nc-ng-react, nc-router-app)
- **CSS**: Optiaxiom CSS custom properties (--ax-*), obfuscated class names via CSS modules

## Global Layout Structure
```
body.ng-scope
  div.bse-App
    button.bse-App-skip                    // Skip to main content
    opti-common-header.hydrated            // Global top header bar
      div.base-GlobalHeader
        div.base-GlobalHeader-actions      // Search, Ask Opal, Notifications, Assignments, Help, User menu
    div.global-alert-wrapper.bse-App-alerts // Alert banners
    div.bse-App-columns                    // Main layout (sidebar + content)
      div.bse-App-nav                      // Left sidebar navigation
        nav[aria-label="Main"]
      nc-ng-react.bse-App-main             // Main content area
        div.cmc-wrapper
          div.main-pane-wrapper
```

## Global Header (opti-common-header)
- Search bar with ⌘K shortcut
- "Ask Opal" AI assistant button
- Notifications bell (with badge count)
- Assignments icon
- Help resources button
- User avatar/menu (initials "DS")

## Sidebar Navigation
Routes and icons:
| Label | Route | Icon |
|-------|-------|------|
| Create (button) | N/A - opens dropdown | Plus circle (green) |
| Home | /cloud/home | House |
| Plan | /cloud/plan | List/lines |
| Library | /cloud/library | Grid/books |
| Stock Images | /cloud/explorer | Briefcase |
| Idea Lab | /cloud/ideation | Lightbulb/pin |
| Analytics | /cloud/insights/content | Chart |
| Requests | /cloud/work-request | Document |
| Collapse | N/A | Sidebar toggle |

### Create Menu Items
When clicking "Create new...", dropdown offers:
- Campaign
- Task
- Hypothesis
- Event
- Milestone
- Work Request
- Pitch Request

## Org Switcher
- Logo: Optimizely SVG logo (32x32)
- Org name dropdown: "CMP Design" with chevron
- Located at top of sidebar

---

## Page: Home (/cloud/home)

### Structure
```
nc-dashboard-header
  div.dash-DashboardHeader
    div.dash-DashboardHeader-user
      span.dash-DashboardHeader-avatar     // Avatar circle with initials
      div.dash-DashboardHeader-greeting
        p.dash-DashboardHeader-date        // "Thu, Feb 26, 2026"
        h1.dash-DashboardHeader-name       // "Good morning, David"

nc-home-page-dashboard
  div.dash-HomePageDashboard
    div.dash-HomePageDashboard-mainContent
      // Tabs: "My work" | "My team's work" | "Watching"
      // Filter button with badge count
      // Search input
      // Table with columns: Title, Step, End/Due Date
      //   Row items: TSK-6, TSK-5, TSK-4, WRQ-1
    div.dash-HomePageDashboard-sideContent
      div.dash-RecentlyViewed
        // "Recently viewed" heading
        // Search input
        // "No recently viewed items found"
```

### Work Item Row Structure
Each row contains:
- Reference ID (e.g., "TSK-6") with colored dot indicator
- Campaign name (e.g., "Social Media Campaign 2023")
- Task title (e.g., "Make a splash (Test)")
- Step info: "1 of 1" + step name + "Step Due X ago"
- Avatar of assignee
- End/Due Date

---

## Page: Plan (/cloud/plan)

### Tabs
- **List** (default) | **Calendar** | **Timeline** | **Board**
- "Saved Views" dropdown

### List View Structure
```
div.plan-PlanApp
  div.plan-PlanPage
    div.plan-PlanPage-nav          // Tab bar
    div.plan-PlanPage-main
      div.plan-PlanPage-toolbar    // Filters, Search, Save View, More options
        // Toggle: "Show campaign hierarchy"
        // "Add" dropdown, "Columns" dropdown
      div.plan-PlanPage-list       // Table content
```

### Table Columns
| Column | Sortable |
|--------|----------|
| Title | Yes (+ button to add) |
| Type | Yes |
| Reference | Yes |
| Owner | Yes |
| Creation Date | Yes |
| Start Date | Yes |
| End/Due Date | Yes (default sorted descending) |
| Depends On | No |

### Item Types
- **Campaign** (CPN-*): Expandable with child count badge, contains tasks/events
- **Task** (TSK-*): Individual work items
- **Event** (EVT-*): Time-bound activities
- **Work Request** (WRQ-*): Requests from stakeholders

### Campaign Hierarchy
Campaigns are expandable (chevron icon) and show child count in a blue badge.
Nested items are indented under their parent campaign.

### Data Observed
- Ultra Music Festival (CPN-4, 3 children): Event + 2 Tasks
- Social campaign 2023 (CPN-3, 1 child): 1 Task
- Social Media Campaign 2023 (CPN-5, 1 child): 1 Task

---

## Page: Library (/cloud/library)

### Tabs
- **Assets** (default) | **Collections** | **Templates** | **Dashboards**
- "Saved Views" dropdown

### Toolbar
- Filter button
- Bulk select checkbox
- View toggle (grid/list)
- Sort: "Last Modified" dropdown with direction
- "Save View" button
- "Add" dropdown (blue, primary action)

### Asset Grid
Cards displayed in a responsive grid, each containing:
- Thumbnail image (or file icon for non-image types)
- File type badge (JPG, PY, Folder, etc.)
- File name (truncated)

### File Types Observed
- JPG images with thumbnails
- PY files (purple background, document icon)
- Folders (light blue background, folder icon)

---

## Page: Idea Lab (/cloud/ideation)

### Header
- Title: "Idea Lab"
- "Download As" dropdown

### Search Section
- Radio toggle: Domain / Topic
- Country selector: "United States" dropdown
- Search input: "Enter Topic/Domain to Explore"

### Sections
1. **Recommended For You**
   - "Keywords with the Greatest Opportunity"
   - "Show hidden" checkbox
   - Link: "Enter your targeted keywords"

2. **Keyword Rank Analysis**
   - Up to 5 domain input fields with "vs" separators
   - "Analyze" button (blue)

3. **Your Program's Targeted Keywords**
   - "Manage Keywords" link

---

## Page: Analytics (/cloud/insights/content)

### Header
- Title: "Analytics"
- Date range selector: "Past 30 Days" dropdown + date range display
- Compare to: "Previous Period" dropdown + comparison date range

### Tabs
- **Content** (with blue underline indicator)
- Export button

### Metrics Row (5 metric cards)
| Metric | Icon |
|--------|------|
| Articles Viewed | Document icon |
| Pageviews | Eye icon |
| Unique Visitors | People icon |
| Attention Time | Clock icon |
| Engagement Rate | Star icon |

### Chart Controls
- Metric selector: "Pageviews" dropdown
- View toggles: "Current & Previous" | "By Channel"
- Time period: "Daily" | "Weekly" | "Monthly"
- Value/Percentage radio toggle

---

## Page: Requests (/cloud/work-request)

### Tabs
- **Pitch Requests** | **Work Requests** (default)

### Toolbar
- Filter button with count badge
- Search: "Search work requests"
- "Share Request URL" dropdown
- "Export" dropdown
- "Add Request" button (blue, primary)

### Table Columns
| Column | Description |
|--------|-------------|
| Request | Title + Reference ID |
| Related Activities | Count |
| Priority | Low/Medium/High with color indicator |
| Status | Accepted/Completed/Declined/Overdue/Submitted |
| Requested By | Person name |
| Submitted Date | Date + relative time |
| Deliverable Due Date | Date |

### Pagination
- Page Size dropdown (default: 20)
- "X-X of Y requests" counter

---

## Page: Task Detail (/cloud/taskv3/:id)

### Breadcrumb
- Campaign name (linked) → "Task" → Reference ID (e.g., "TSK-6")

### Header
- Task title: "Make a splash (Test)"
- Status badge: "Overdue" (red)
- Share button with count
- View count
- More options (...)

### Left Panel - Content Tabs
- **Brief** | **Content** (default) | **Fields** | **Publishing** | **Related** | **Financials** | **History**
- "+ Add Content" button (blue)
- View mode toggles (table, card, grid, list icons)
- Content items with thumbnails
- Content details (file name, description)
- Fields section with field count badge

### Right Panel
- Date info: "Started: May 01, 2023" / "Due: Jul 31, 2023" (red if overdue)
- Progress indicator (dot on timeline)

#### Right Panel Tabs
- **Workflow** (default) | **Comments** | **Attachments**
- "Quick Share" section with settings
- Workflow steps: numbered list
  - Step name (e.g., "Author, schedule, and publish a post")
  - Assigned to person
  - Checklist items (checkboxes):
    - Write Your Share
    - Specify Publishing Time
    - Publish. Share.
    - Edit Fields
  - Status dropdown: "In Progress" (green)

### Task Detail Identifiers
- Campaign reference: CPN-5
- Task reference: TSK-6
- Content tab GUID used in URL
- Active right pane tab in URL

---

## Design Tokens (Optiaxiom CSS Variables)

### Colors
```css
--ax-colors-bg-accent: light-dark(#0037FF, #2E66F7)
--ax-colors-bg-default: light-dark(#FFFFFF, #1C2029)
--ax-colors-bg-page: light-dark(#F9FAFC, #171A23)
--ax-colors-fg-default: light-dark(#2E3442, #F5F6FA)
--ax-colors-fg-secondary: light-dark(#4F576E, #CACFDC)
--ax-colors-fg-tertiary: light-dark(#66708C, #838DA4)
--ax-colors-fg-accent: light-dark(#0037FF, #6A8FFC)
--ax-colors-fg-error: light-dark(#CC1616, #FC8B8B)
--ax-colors-fg-success: light-dark(#03A65D, #7CD2A7)
--ax-colors-fg-warning: light-dark(#F79008, #FFC84B)
--ax-colors-border-default: light-dark(#CACFDC, #66708C)
--ax-colors-border-tertiary: light-dark(#E9EDF5, #2E3442)
--ax-colors-bg-secondary: light-dark(#F5F6FA, #1C212B)
--ax-colors-bg-tertiary: light-dark(#DADFEB, #4F576E)
--ax-colors-bg-accent-light: light-dark(#B3C3FF, #001666)
--ax-colors-bg-accent-subtle: light-dark(#F0F3FF, #000B33)
```

### Border Radius
```css
--ax-borderRadius-xs: 0.125rem
--ax-borderRadius-sm: 0.25rem
--ax-borderRadius-md: 0.375rem
--ax-borderRadius-lg: 0.5rem
--ax-borderRadius-xl: 0.75rem
--ax-borderRadius-full: 9999px
```

### Box Shadows
```css
--ax-boxShadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--ax-boxShadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--ax-boxShadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
```

---

## URL Patterns

| Page | URL Pattern |
|------|-------------|
| Home | /cloud/home |
| Plan (List) | /cloud/plan?activeTab=list&sortBy=-end&activity_status=... |
| Plan (Calendar) | /cloud/plan?activeTab=calendar |
| Plan (Timeline) | /cloud/plan?activeTab=timeline |
| Plan (Board) | /cloud/plan?activeTab=board |
| Library | /cloud/library |
| Stock Images | /cloud/explorer |
| Idea Lab | /cloud/ideation?country_code=US |
| Analytics | /cloud/insights/content |
| Work Requests | /cloud/work-request?sortBy=-created_at&status=... |
| Task Detail | /cloud/taskv3/:taskId?contentTabGuid=...&activeRightPaneTab=workflow |
| Settings | /cloud/settings/social-accounts |

## Status Values
- Not Started
- In Progress
- On Hold
- Overdue
- Completed
- Accepted
- Declined
- Submitted
- At Risk
- On Track

## Priority Values
- Low (gray dot)
- Medium
- High
