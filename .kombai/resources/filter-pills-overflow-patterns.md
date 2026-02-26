# Filter Pills Overflow Patterns: Comprehensive Guide

**Last Updated**: January 28, 2026  
**Purpose**: Research document exploring alternative UI patterns for handling overflowing filter pills/chips beyond the rollup approach

---

## Table of Contents

1. [Current Pattern Analysis](#current-pattern-analysis)
2. [Alternative Patterns](#alternative-patterns)
3. [Comparison Matrix](#comparison-matrix)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Recommendations by Context](#recommendations-by-context)
6. [References & Examples](#references--examples)

---

## Current Pattern Analysis

### Rollup + Popover Pattern

**Visual Representation:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Type A] [Type A] [Type B] [Type B] [Type C] [+10 more ▼]  │
└─────────────────────────────────────────────────────────────┘
                                                    │
                                    ┌───────────────▼──────────┐
                                    │ Content Type E           │
                                    │ Content Type D           │
                                    │ Content Type D           │
                                    │ Content Type D           │
                                    └──────────────────────────┘
```

**How It Works:**
- Displays first N filter pills inline (typically 5-7 based on viewport width)
- Remaining pills are hidden behind a "+X more" button
- Clicking the button reveals a dropdown/popover with overflow items
- Users can select/deselect items from the popover
- Selected items from popover join the visible pill row

**Pros:**
- ✅ Excellent space efficiency - keeps interface clean
- ✅ Clear indication of hidden items with count
- ✅ Familiar pattern (used widely in email clients, tags)
- ✅ Works well on desktop interfaces
- ✅ Maintains visual hierarchy

**Cons:**
- ❌ Reduced discoverability - users don't see all options
- ❌ Two interaction points (inline pills + popover)
- ❌ Extra click required to see hidden filters
- ❌ May not be optimal for frequently-used filters
- ❌ Popover can be clunky on mobile/touch devices

**Best Use Cases:**
- Content management systems with many filter categories
- E-commerce product filtering with 10+ options
- Email/document tag management
- Admin dashboards with extensive filtering needs
- When most users only use 3-5 primary filters

**Accessibility Notes:**
- Popover must be keyboard accessible (Tab, Enter, Escape)
- Screen readers need proper ARIA labels: `aria-label="Show 10 more filters"`, `aria-expanded="true/false"`, `role="menu"` for popover
- Focus management when popover opens/closes
- Consider `aria-live` announcements when filters are applied

---

## Alternative Patterns

### 1. Horizontal Scroll with Indicators

**Visual Representation:**
```
┌──────────────────────────────────────────────────────────┐
│ ◀ [Type A] [Type A] [Type B] [Type B] [Type C] [Type... ▶│
└──────────────────────────────────────────────────────────┘
    │                                                    │
    └── Fade gradient ───────────────────── Fade gradient ┘
```

**How It Works:**
- Pills overflow horizontally in a scrollable container
- Scroll indicators (arrows or fade gradients) show more content exists
- Users can scroll/swipe horizontally to reveal hidden pills
- Optional: snap scrolling for better UX
- Touch-friendly with momentum scrolling on mobile

**Pros:**
- ✅ All filters remain visible (just need scrolling)
- ✅ Excellent for mobile/touch interfaces
- ✅ No context switching - everything in one place
- ✅ Simple, intuitive interaction model
- ✅ Preserves visual continuity

**Cons:**
- ❌ Horizontal scrolling can be missed by users
- ❌ Less space-efficient than rollup pattern
- ❌ Can feel awkward with mouse/trackpad
- ❌ Scrollbars can look inelegant
- ❌ May hide important filters outside initial viewport

**Best Use Cases:**
- Mobile-first applications
- Touch-centric interfaces (tablets, kiosks)
- Fewer filters (5-15 items)
- When filter order has semantic meaning (e.g., timeline)
- Image galleries, card carousels

**Implementation Considerations:**
```css
.filter-container {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch; /* iOS momentum scroll */
  
  /* Hide scrollbar but keep functionality */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.filter-container::-webkit-scrollbar {
  display: none;
}

/* Fade gradients for scroll indicators */
.filter-container::before,
.filter-container::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 100%;
  pointer-events: none;
}

.filter-container::before {
  left: 0;
  background: linear-gradient(to right, white, transparent);
}

.filter-container::after {
  right: 0;
  background: linear-gradient(to left, white, transparent);
}
```

**Real-world Examples:**
- **Instagram Stories**: Horizontal scroll with story circles
- **Netflix**: Category chips scroll horizontally
- **Mobile App Stores**: Horizontal filter pills in search results
- **Linear (mobile)**: Project filters scroll horizontally

---

### 2. Show More/Less Toggle (Vertical Expansion)

**Visual Representation:**
```
Before:
┌────────────────────────────────────────────────────┐
│ [Type A] [Type A] [Type B] [Type B] [Type C]       │
│ [Show More ▼]                                      │
└────────────────────────────────────────────────────┘

After:
┌────────────────────────────────────────────────────┐
│ [Type A] [Type A] [Type B] [Type B] [Type C]       │
│ [Type D] [Type D] [Type E] [Type F] [Type G]       │
│ [Type H] [Type I]                                  │
│ [Show Less ▲]                                      │
└────────────────────────────────────────────────────┘
```

**How It Works:**
- Pills wrap naturally within their container
- Initially shows 1-2 rows, hiding overflow with CSS
- "Show More" button expands to reveal all pills
- "Show Less" collapses back to initial state
- Smooth height animation for visual feedback

**Pros:**
- ✅ Native feel - no custom scrolling
- ✅ All items discoverable with one click
- ✅ Works excellently on desktop
- ✅ Clear mental model for users
- ✅ Good for moderate overflow (10-30 items)

**Cons:**
- ❌ Requires vertical space when expanded
- ❌ Can push content below down (layout shift)
- ❌ Not ideal for many filters (50+)
- ❌ Toggle state to manage
- ❌ Less suitable for mobile (screen real estate)

**Best Use Cases:**
- Desktop-first applications
- Moderate number of filters (10-30)
- When vertical space is available
- Documentation/blog category filters
- Settings/preferences panels

**Implementation Considerations:**
```tsx
const [expanded, setExpanded] = useState(false);

<div className={`filter-grid ${expanded ? 'expanded' : 'collapsed'}`}>
  {filters.map(filter => <FilterChip key={filter.id} {...filter} />)}
</div>
<button onClick={() => setExpanded(!expanded)}>
  {expanded ? '▲ Show Less' : '▼ Show More'}
</button>

/* CSS */
.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 80px; /* ~2 rows */
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.filter-grid.expanded {
  max-height: 500px; /* Large enough for all items */
}
```

**Real-world Examples:**
- **Amazon**: Product filters expand/collapse in sidebar
- **YouTube**: Channel sections expand with "Show More"
- **GitHub**: File tree expands/collapses folders
- **Google Fonts**: Font filter categories expand

---

### 3. Dropdown/Combobox from Start

**Visual Representation:**
```
┌────────────────────────────────────────────────────┐
│ [🔍 Filter by...                              ▼]   │
└────────────────────────────────────────────────────┘
                          │
          ┌───────────────▼──────────────┐
          │ ☑ Content Type A              │
          │ ☑ Content Type B              │
          │ ☐ Content Type C              │
          │ ☐ Content Type D              │
          │ ☐ Content Type E              │
          └───────────────────────────────┘
          
Selected filters shown as:
┌────────────────────────────────────────────────────┐
│ [Type A ×] [Type B ×]                              │
└────────────────────────────────────────────────────┘
```

**How It Works:**
- All filters hidden in a dropdown/combobox control
- Users click to reveal full list with checkboxes
- Selected items appear as pills below dropdown
- Searchable dropdown for better discoverability
- Can include categorization within dropdown

**Pros:**
- ✅ Maximum space efficiency
- ✅ Scales well to 100+ filter options
- ✅ Searchable for quick access
- ✅ Familiar pattern (select/multiselect)
- ✅ Clean, minimal interface

**Cons:**
- ❌ All filters completely hidden initially
- ❌ Requires extra step to see options
- ❌ Less suitable for frequently-changed filters
- ❌ May feel buried for important filters
- ❌ Harder to scan all options at once

**Best Use Cases:**
- Space-constrained mobile interfaces
- Many filter categories (20+)
- Infrequently-used advanced filters
- Secondary/tertiary filtering options
- When search is primary interaction

**Implementation Considerations:**
- Use native `<select multiple>` for accessibility baseline
- Enhance with libraries: Downshift, React Select, Headless UI Combobox
- Implement keyboard navigation (↑↓ arrows, Enter, Escape)
- Virtual scrolling for 100+ options
- Group related filters with `<optgroup>` or custom categories

**Real-world Examples:**
- **Gmail**: Labels dropdown with search
- **Trello**: Card filter dropdown
- **Notion**: Database property filters
- **Jira**: Advanced search filters

---

### 4. Priority-Based Display (Smart Filtering)

**Visual Representation:**
```
Most Used / Recently Used:
┌────────────────────────────────────────────────────┐
│ [Type A] [Type B] [Type C] [More Filters...]       │
└────────────────────────────────────────────────────┘

All Filters Modal/Drawer:
┌──────────────────────────────────────────┐
│ All Filters                         [×]  │
├──────────────────────────────────────────┤
│ Popular                                  │
│ [Type A] [Type B] [Type C]               │
│                                          │
│ All Categories (A-Z)                     │
│ [Type D] [Type E] [Type F] [Type G]      │
│ [Type H] [Type I] [Type J] [Type K]      │
└──────────────────────────────────────────┘
```

**How It Works:**
- Algorithm determines which filters to show inline
- Based on: usage frequency, recency, user role, context
- Less common filters hidden behind "More Filters" link
- Opens modal/drawer with full categorized list
- Learns from user behavior over time

**Pros:**
- ✅ Personalized, intelligent experience
- ✅ Surfaces most relevant filters
- ✅ Reduces cognitive load
- ✅ Efficient use of space
- ✅ Scales indefinitely

**Cons:**
- ❌ Complex to implement (requires analytics)
- ❌ Can feel unpredictable to users
- ❌ Requires user data/tracking
- ❌ May hide important filters for new users
- ❌ Algorithm maintenance overhead

**Best Use Cases:**
- Power user tools with many filters
- Analytics/BI dashboards
- CRM and enterprise software
- Personalized applications
- When filter usage patterns are clear

**Implementation Considerations:**
```typescript
// Track filter usage
const trackFilterUsage = (filterId: string) => {
  const usage = JSON.parse(localStorage.getItem('filterUsage') || '{}');
  usage[filterId] = (usage[filterId] || 0) + 1;
  usage[`${filterId}_lastUsed`] = Date.now();
  localStorage.setItem('filterUsage', JSON.stringify(usage));
};

// Calculate priority score
const getPriorityFilters = (allFilters: Filter[], count: number = 5) => {
  const usage = JSON.parse(localStorage.getItem('filterUsage') || '{}');
  
  return allFilters
    .map(filter => ({
      ...filter,
      score: (usage[filter.id] || 0) * 2 + 
             (Date.now() - (usage[`${filter.id}_lastUsed`] || 0) < 7 * 24 * 60 * 60 * 1000 ? 10 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
};
```

**Real-world Examples:**
- **Spotify**: Frequently played filters in search
- **Google Analytics**: Saved reports and frequently used dimensions
- **Salesforce**: Personalized quick filters
- **Adobe Analytics**: Recent segments prominently displayed

---

### 5. Two-Row Breakpoint

**Visual Representation:**
```
┌────────────────────────────────────────────────────┐
│ [Type A] [Type A] [Type B] [Type B] [Type C]       │
│ [Type D] [Type E] [+3 more]                        │
└────────────────────────────────────────────────────┘
```

**How It Works:**
- Pills wrap naturally to a second row
- After 2 rows, overflow items are truncated
- Truncated count shown with "+X more" 
- Clicking opens popover/modal with full list
- Hybrid approach between wrapping and rollup

**Pros:**
- ✅ Shows more filters than single-row rollup
- ✅ Better discoverability than pure rollup
- ✅ Natural wrapping behavior
- ✅ Balances space vs. visibility
- ✅ Responsive-friendly

**Cons:**
- ❌ Still requires overflow handling
- ❌ Can feel inconsistent (sometimes 1 row, sometimes 2)
- ❌ Breakpoint management complexity
- ❌ May waste space on large screens
- ❌ Not ideal for mobile

**Best Use Cases:**
- Desktop applications with moderate filters (8-15)
- When you want to show more than rollup but not all
- Responsive designs with breakpoints
- Medium-density interfaces
- Tag management interfaces

**Implementation Considerations:**
```tsx
const FilterPills = ({ filters }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(filters.length);
  
  useEffect(() => {
    // Calculate how many fit in 2 rows
    const pillWidth = 100; // Average pill width
    const rowWidth = containerWidth;
    const perRow = Math.floor(rowWidth / pillWidth);
    const maxVisible = perRow * 2; // 2 rows
    
    setVisibleCount(Math.min(maxVisible, filters.length));
  }, [containerWidth, filters]);
  
  return (
    <>
      {filters.slice(0, visibleCount).map(filter => (
        <FilterChip key={filter.id} {...filter} />
      ))}
      {filters.length > visibleCount && (
        <button>+{filters.length - visibleCount} more</button>
      )}
    </>
  );
};
```

**Real-world Examples:**
- **LinkedIn**: Skill tags wrap to 2-3 lines then truncate
- **Medium**: Article tags wrap limited rows
- **Behance**: Project tags wrap with "Show More"

---

### 6. Carousel/Pagination

**Visual Representation:**
```
┌────────────────────────────────────────────────────┐
│  ◀  [Type A] [Type B] [Type C] [Type D] [Type E]  ▶│
│                  ● ○ ○                             │
└────────────────────────────────────────────────────┘
```

**How It Works:**
- Filters divided into pages/groups
- Previous/Next arrows navigate between groups
- Dot indicators show current page
- Can auto-scroll or require manual navigation
- Each "page" shows fixed number of items

**Pros:**
- ✅ Clean, structured presentation
- ✅ Good for categorized filters
- ✅ Works well in mobile apps
- ✅ Familiar pattern from image carousels
- ✅ Maintains consistent height

**Cons:**
- ❌ Requires multiple interactions to see all
- ❌ Can be slower than other methods
- ❌ Not ideal for quick scanning
- ❌ Pagination adds cognitive load
- ❌ May hide important filters on other pages

**Best Use Cases:**
- Mobile applications
- Categorized filter groups
- Story/wizard-like filter selection
- Limited screen real estate
- When filters naturally group (e.g., by type)

**Implementation Considerations:**
- Use Swiper.js, Embla Carousel, or Keen Slider
- Implement touch gestures (swipe left/right)
- Keyboard navigation (arrow keys)
- Accessible pagination controls
- Consider auto-play for browsing mode

**Real-world Examples:**
- **Dating apps**: Preference filters paginated
- **Travel apps**: Date range and location filters in steps
- **Food delivery apps**: Cuisine type filters in carousel
- **Zillow mobile**: Property filters grouped and paginated

---

### 7. Hybrid Drawer/Modal ("View All Filters")

**Visual Representation:**
```
Inline View:
┌────────────────────────────────────────────────────┐
│ [Type A ×] [Type B ×] [View All Filters →]         │
└────────────────────────────────────────────────────┘

Modal/Drawer View:
┌──────────────────────────────────────────────────┐
│ Filters                                    [×]   │
├──────────────────────────────────────────────────┤
│ Content Type                                     │
│ ☑ Type A    ☑ Type B    ☐ Type C                │
│ ☐ Type D    ☐ Type E                             │
│                                                  │
│ Status                                           │
│ ☑ Published  ☐ Draft   ☐ Archived               │
│                                                  │
│ Date Range                                       │
│ [From: ______] [To: ______]                      │
│                                                  │
│              [Clear All]  [Apply Filters]        │
└──────────────────────────────────────────────────┘
```

**How It Works:**
- Selected/active filters shown as pills inline
- "View All Filters" button opens modal or side drawer
- Drawer shows ALL available filters organized by category
- Users select/deselect multiple filters
- Apply button commits changes and closes drawer
- Selected filters update in inline pills

**Pros:**
- ✅ Excellent for complex, multi-category filtering
- ✅ Separates active from available filters clearly
- ✅ Dedicated space for filter exploration
- ✅ Can include advanced options (date pickers, ranges)
- ✅ Scales to 50+ filter options

**Cons:**
- ❌ Modal/drawer can feel heavyweight
- ❌ Context switch from main content
- ❌ Requires explicit "Apply" action
- ❌ Mobile drawer may cover entire screen
- ❌ More complex to implement

**Best Use Cases:**
- Complex enterprise applications
- Multi-faceted search interfaces
- E-commerce with extensive filtering
- Data analytics and reporting tools
- When filters have dependencies or advanced controls

**Implementation Considerations:**
```tsx
const FilterSystem = () => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  return (
    <>
      {/* Inline active filters */}
      <div className="active-filters">
        {selectedFilters.map(filter => (
          <Chip key={filter.id} onRemove={() => removeFilter(filter.id)}>
            {filter.label}
          </Chip>
        ))}
        <Button onClick={() => setDrawerOpen(true)}>
          View All Filters
        </Button>
      </div>
      
      {/* Filter drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <FilterDrawerContent 
          selectedFilters={selectedFilters}
          onApply={(filters) => {
            setSelectedFilters(filters);
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </>
  );
};
```

**Real-world Examples:**
- **Airbnb**: Filter modal for property search
- **Shopify Admin**: Product filter drawer
- **Google Drive**: Advanced search modal
- **Figma**: Layer filtering panel
- **Airtable**: View filter configuration

---

### 8. Auto-Collapse Available/Applied Split

**Visual Representation:**
```
┌────────────────────────────────────────────────────┐
│ Applied Filters:                                   │
│ [Type A ×] [Status: Active ×] [Date: Jan 2026 ×]   │
│                                                    │
│ Available Filters: [Add Filter ▼]                 │
└────────────────────────────────────────────────────┘
```

**How It Works:**
- Clear visual separation between applied and available filters
- Applied filters always visible as removable pills
- Available filters collapsed in dropdown/combobox
- Clicking "Add Filter" reveals available options
- Selected option immediately becomes applied filter

**Pros:**
- ✅ Extremely clear mental model
- ✅ Always shows what's currently filtering
- ✅ Scales well to many filter options
- ✅ Prevents UI clutter
- ✅ Good for power users

**Cons:**
- ❌ Lower discoverability for available filters
- ❌ Requires understanding of two-state system
- ❌ Can feel verbose with many applied filters
- ❌ Extra step to add filters
- ❌ Less visual than inline pills

**Best Use Cases:**
- Analytics and BI dashboards
- Complex data tables
- Advanced search interfaces
- Developer tools and admin panels
- When filter state is primary concern

**Implementation Considerations:**
- Use a combobox pattern for available filters
- Group available filters by category
- Include search within available filters
- Show recently used filters prominently
- Persist filter state across sessions

**Real-world Examples:**
- **Google Analytics**: Segment builder
- **Tableau**: Filter shelf
- **SQL query builders**: WHERE clause builders
- **Advanced search forms**: Gmail, GitHub, Stack Overflow

---

## Comparison Matrix

| Pattern | Space Efficiency | Mobile Friendly | Discoverability | Accessibility | Implementation Complexity | Best For Scale |
|---------|------------------|-----------------|-----------------|---------------|---------------------------|----------------|
| **Rollup + Popover** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 10-30 filters |
| **Horizontal Scroll** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 5-15 filters |
| **Show More/Less** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 10-30 filters |
| **Dropdown from Start** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 20-100+ filters |
| **Priority-Based** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 20-100+ filters |
| **Two-Row Breakpoint** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 8-20 filters |
| **Carousel/Pagination** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 10-30 filters |
| **Hybrid Drawer** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 30-100+ filters |
| **Auto-Collapse Split** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 20-100+ filters |

### Rating Legend
- ⭐⭐⭐⭐⭐ Excellent
- ⭐⭐⭐⭐ Very Good
- ⭐⭐⭐ Good
- ⭐⭐ Fair
- ⭐ Poor

---

## Implementation Guidelines

### General Accessibility Requirements

All overflow patterns should meet these baseline accessibility standards:

#### Keyboard Navigation
```typescript
// Essential keyboard support
- Tab: Navigate through filter pills
- Enter/Space: Select/deselect filter
- Escape: Close popovers/modals/drawers
- Arrow keys: Navigate within dropdowns/lists
- Home/End: Jump to first/last item
```

#### ARIA Attributes
```html
<!-- Filter container -->
<div role="group" aria-label="Content type filters">
  
  <!-- Individual filter pill -->
  <button
    role="checkbox"
    aria-checked="true"
    aria-label="Remove Content Type A filter"
  >
    Content Type A
    <span aria-hidden="true">×</span>
  </button>
  
  <!-- Overflow trigger -->
  <button
    aria-label="Show 10 more filters"
    aria-expanded="false"
    aria-controls="filter-popover"
    aria-haspopup="menu"
  >
    +10 more
  </button>
  
  <!-- Popover/drawer -->
  <div
    id="filter-popover"
    role="menu"
    aria-label="Additional filters"
    hidden
  >
    <!-- Filter options -->
  </div>
</div>
```

#### Screen Reader Announcements
```typescript
// Announce filter changes
const announceFilterChange = (action: 'added' | 'removed', filterName: string) => {
  const announcement = `${filterName} filter ${action}`;
  
  // Create or update live region
  const liveRegion = document.getElementById('filter-announcements') || 
    document.createElement('div');
  liveRegion.id = 'filter-announcements';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  
  liveRegion.textContent = announcement;
  
  if (!document.getElementById('filter-announcements')) {
    document.body.appendChild(liveRegion);
  }
};
```

### Responsive Breakpoint Recommendations

```css
/* Mobile first approach */

/* Small mobile: 320px - 479px */
@media (max-width: 479px) {
  /* Recommendation: Horizontal scroll or Dropdown */
  .filter-container {
    overflow-x: auto;
  }
}

/* Large mobile: 480px - 767px */
@media (min-width: 480px) and (max-width: 767px) {
  /* Recommendation: Horizontal scroll with better indicators */
  .filter-container {
    position: relative;
  }
  .scroll-indicator {
    display: block;
  }
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Recommendation: Two-row breakpoint or Show More/Less */
  .filter-container {
    flex-wrap: wrap;
    max-height: 80px; /* 2 rows */
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  /* Recommendation: Rollup + Popover or Hybrid Drawer */
  .filter-container {
    display: flex;
    flex-wrap: nowrap;
  }
  .overflow-menu {
    display: inline-block;
  }
}

/* Large desktop: 1440px+ */
@media (min-width: 1440px) {
  /* Recommendation: Show more filters inline */
  .filter-container {
    max-width: 1200px;
  }
}
```

### Performance Considerations

#### Virtual Scrolling for Large Lists
```typescript
// Use virtualization for 100+ filter options
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualFilterList = ({ filters }) => {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: filters.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // Estimated filter height
    overscan: 5 // Render 5 extra items for smooth scrolling
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <FilterOption filter={filters[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Debouncing Filter Changes
```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const FilterSystem = () => {
  // Debounce expensive filter operations
  const debouncedApplyFilters = useMemo(
    () => debounce((filters) => {
      // Expensive operation: API call, data filtering, etc.
      applyFiltersToData(filters);
    }, 300),
    []
  );
  
  const handleFilterChange = (filter) => {
    // Update UI immediately for responsiveness
    setLocalFilters(prev => [...prev, filter]);
    
    // Debounce expensive operations
    debouncedApplyFilters([...localFilters, filter]);
  };
  
  return (/* ... */);
};
```

---

## Recommendations by Context

### For Mobile-First Applications
**Primary Choice:** Horizontal Scroll with Indicators  
**Alternative:** Dropdown from Start

**Rationale:**
- Touch interfaces work best with swipe gestures
- Limited screen real estate requires space efficiency
- Horizontal scroll feels native on mobile
- Dropdown provides fallback for many options

**Implementation Tips:**
- Use momentum scrolling (`-webkit-overflow-scrolling: touch`)
- Add subtle fade gradients as scroll indicators
- Ensure touch targets are at least 44×44px
- Consider haptic feedback on filter selection

---

### For Desktop-Heavy B2B Applications
**Primary Choice:** Rollup + Popover  
**Alternative:** Hybrid Drawer for complex filtering

**Rationale:**
- Desktop users expect compact, information-dense interfaces
- Mouse/keyboard interaction supports popover patterns
- Business users often work with many filters
- Drawer provides space for advanced options

**Implementation Tips:**
- Use keyboard shortcuts (Cmd/Ctrl+K to open filter menu)
- Implement filter presets/saved views
- Show filter count badges
- Add "Clear all filters" option

---

### For E-commerce Product Filtering
**Primary Choice:** Hybrid Drawer  
**Alternative:** Show More/Less + Categories

**Rationale:**
- Product filtering often involves multiple categories
- Users need to see and compare many options
- Mobile and desktop experiences both critical
- Filter combinations are complex (price range, size, color, brand)

**Implementation Tips:**
- Group filters by category (Brand, Size, Color, Price)
- Show product count for each filter option
- Allow multiple selections per category
- Implement "Apply" vs. "Update results as you filter" modes

---

### For Analytics/BI Dashboards
**Primary Choice:** Auto-Collapse Applied/Available Split  
**Alternative:** Priority-Based Display

**Rationale:**
- Power users need precise control over filters
- Clear distinction between active and available filters critical
- Many advanced filter types (date ranges, custom formulas)
- Filter state is part of the analysis

**Implementation Tips:**
- Allow saving filter combinations as "views"
- Show filter logic (AND/OR operators)
- Support complex filter types (regex, custom functions)
- Provide filter templates for common queries

---

### For Content Management Systems
**Primary Choice:** Rollup + Popover  
**Alternative:** Two-Row Breakpoint

**Rationale:**
- Moderate number of content type filters (10-20)
- Desktop-first but responsive needed
- Filters change frequently during content management
- Quick filtering more important than discovering all options

**Implementation Tips:**
- Persist filter state in URL parameters
- Add "Recently used" section in popover
- Keyboard shortcuts for common filters
- Batch operations when multiple filters applied

---

### For Power User Tools (IDEs, Design Tools)
**Primary Choice:** Priority-Based Display  
**Alternative:** Hybrid Drawer

**Rationale:**
- Users develop strong filter usage patterns
- Personalization improves efficiency significantly
- Many possible filters (file types, tags, dates, authors)
- Workspace matters - minimize UI chrome

**Implementation Tips:**
- Machine learning for filter prioritization
- Command palette integration (Cmd+P style)
- Contextual filters based on current view
- Saved filter combinations as "smart folders"

---

### For Simple Landing/Marketing Pages
**Primary Choice:** Show More/Less Toggle  
**Alternative:** Two-Row Breakpoint

**Rationale:**
- Fewer filters (5-10 categories)
- Visual simplicity important for conversion
- Desktop visitors primary audience
- Filters more about browsing than precise searching

**Implementation Tips:**
- Large, visual filter buttons
- Animation for show/hide transitions
- Clear visual hierarchy
- Consider filters as navigation, not tools

---

## Hybrid Approaches

Many successful applications combine multiple patterns:

### Example 1: Responsive Hybrid
```
Mobile (< 768px): Horizontal Scroll
Tablet (768-1024px): Two-Row Breakpoint
Desktop (> 1024px): Rollup + Popover
```

### Example 2: Priority + Overflow
```
Inline: Top 5 most-used filters (Priority-Based)
Overflow: Remaining filters in Dropdown
Power User: "View All Filters" opens Drawer with categories
```

### Example 3: Context-Aware
```
Few filters (< 8): Show all inline with wrapping
Medium filters (8-15): Rollup + Popover
Many filters (> 15): Hybrid Drawer from the start
```

---

## Testing Checklist

Before implementing any overflow pattern, validate:

### ✅ Functional Testing
- [ ] All filters are accessible
- [ ] Selected state persists correctly
- [ ] Removing filters works from all locations
- [ ] Multi-select works as expected
- [ ] Clear all filters works
- [ ] URL state synchronization (if applicable)
- [ ] Browser back/forward navigation respects filter state

### ✅ Accessibility Testing
- [ ] Keyboard navigation works completely
- [ ] Screen reader announces filter changes
- [ ] Focus management is correct
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Touch targets are 44×44px minimum
- [ ] No keyboard traps in modals/popovers
- [ ] Semantic HTML used correctly

### ✅ Responsive Testing
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1440px width)
- [ ] Touch gestures work on touch devices
- [ ] Hover states appropriate for non-touch
- [ ] No horizontal scroll on mobile (unless intentional)

### ✅ Performance Testing
- [ ] No layout shift when filters expand/collapse
- [ ] Smooth animations (60fps)
- [ ] Large lists (100+ items) remain performant
- [ ] Filter changes debounced appropriately
- [ ] Virtual scrolling for very long lists

### ✅ Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS and iOS)
- [ ] Mobile browsers (Chrome, Safari)

---

## References & Examples

### Design Systems Documentation
- **Material Design**: https://material.io/components/chips
- **Carbon Design System**: https://carbondesignsystem.com/components/tag/usage
- **Atlassian Design**: https://atlassian.design/components/tag/examples
- **Ant Design**: https://ant.design/components/tag
- **Polaris (Shopify)**: https://polaris.shopify.com/ (deprecated, see web components)

### Real-World Implementations
- **Airbnb**: Hybrid drawer for property search filters
- **Amazon**: Sidebar filters with expand/collapse
- **GitHub**: Dropdown filters with search
- **Linear**: Horizontal scroll on mobile, rollup on desktop
- **Notion**: Dropdown filters in database views
- **Gmail**: Labels dropdown with search
- **Spotify**: Priority-based filter suggestions
- **Netflix**: Horizontal scroll for genre chips

### UX Research & Articles
- Nielsen Norman Group: "Filtering and Faceted Search"
- Baymard Institute: "E-Commerce Product Filtering"
- Smashing Magazine: "Designing Better Data Tables"
- A List Apart: "Infinite Scroll vs. Pagination"

### Libraries & Tools
- **Filtering**: Downshift, React Select, Headless UI Combobox
- **Horizontal Scroll**: Swiper, Embla Carousel, Keen Slider
- **Virtual Lists**: @tanstack/react-virtual, react-window
- **Responsive**: CSS Container Queries, Element Queries
- **Animation**: Framer Motion, React Spring, Auto-Animate

---

## Conclusion

There is no single "best" pattern for handling overflowing filter pills. The optimal choice depends on:

1. **Device/Platform**: Mobile-first vs desktop-first
2. **Filter Count**: Few (5-10) vs moderate (10-30) vs many (30+)
3. **User Type**: Casual browsers vs power users
4. **Filter Frequency**: Rarely changed vs frequently adjusted
5. **Space Constraints**: Vertical space available vs tight layouts
6. **Context**: Simple filtering vs complex multi-faceted search

**Key Takeaway**: Start with your users' needs and device context. Test with real users. Iterate based on usage patterns. Consider hybrid approaches that combine the strengths of multiple patterns.

The rollup + popover pattern shown in the original design is a solid choice for desktop-first applications with moderate filter counts (10-30). For improvements, consider:

1. **Mobile**: Switch to horizontal scroll on small screens
2. **Discoverability**: Add visual indicator of total filter count
3. **Accessibility**: Ensure keyboard navigation and screen reader support
4. **Performance**: Implement virtualization if filter list grows beyond 50 items
5. **UX**: Add recently-used filters section in popover for quick access

---

**Document Version**: 1.0  
**Last Updated**: January 28, 2026  
**Maintained by**: Kombai Research Team
