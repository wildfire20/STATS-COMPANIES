# Design Guidelines: Financial Advisor Performance Dashboard

## Design Approach
**Selected System**: Carbon Design System
**Rationale**: Enterprise-grade data visualization and information density requirements for financial compliance tools. Carbon excels at complex dashboards with multiple data views and audit trails.

## Core Design Elements

### Typography
- **Primary Font**: IBM Plex Sans via Google Fonts CDN
- **Headings**: Plex Sans Semibold (600) - Dashboard titles 2xl, Section headers xl, Card headers lg
- **Body Text**: Plex Sans Regular (400) - Base text sm, Data labels xs
- **Monospace**: IBM Plex Mono for numerical data, timestamps, and audit IDs

### Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8 for consistent rhythm
- Component padding: p-6
- Card spacing: gap-6 for grids
- Section margins: mb-8
- Dense data tables: p-2 for cells

**Grid Structure**:
- Dashboard: 3-column metric cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Comparison views: 2-column split layouts
- Single column for audit logs and detailed tables (max-w-7xl)

### Component Library

**Dashboard Header**:
- Full-width navigation with user profile, notifications, settings
- Page title with contextual date range selector
- Quick action buttons (Export Reports, Add Advisor)

**Metric Cards**:
- Prominent numerical value with trend indicator (↑↓ with percentage)
- Supporting text showing comparison (vs. last period)
- Sparkline charts for quick trend visualization
- Card borders with subtle elevation

**Performance Tables**:
- Sortable columns with clear headers
- Row hover states for scannability
- Inline action buttons (View Details, Edit)
- Pagination controls at bottom
- Sticky header on scroll

**Audit Log Viewer**:
- Advanced filter bar (User, Action Type, Date Range, Resource)
- Timestamp column with relative time ("2 hours ago")
- Expandable rows showing full audit details (JSON-style)
- Export to CSV functionality
- Clear visual hierarchy: timestamp → user → action → details

**Charts & Visualizations**:
- Line charts for performance trends over time
- Bar charts for team comparisons
- Donut charts for portfolio composition
- All charts: Recharts library via CDN
- Consistent axis labels and gridlines

**Data Density Features**:
- Collapsible sidebar for navigation (Team, Metrics, Audit Logs, Reports, Settings)
- Breadcrumb navigation showing current location
- Tab groups for switching between views (Overview, Individual Performance, Compliance)
- Dropdown filters that don't navigate away from page

### Accessibility
- All interactive elements have visible focus states (ring-2 ring-offset-2)
- Form inputs with clear labels positioned above fields
- High contrast text for all numerical data
- ARIA labels for icon-only buttons
- Table headers properly marked with scope attributes

### Icons
**Library**: Heroicons (outline for navigation, solid for status indicators)
- Dashboard metrics: Chart, Users, Currency icons
- Audit log actions: Lock, Eye, Pencil, Trash
- Status indicators: Check Circle (success), Exclamation Circle (warning)

### Professional Conventions
- Use currency formatting with proper separators ($1,234,567.89)
- Percentage changes with + prefix for positive values
- ISO date formats with timezone indicators
- Loading states with skeleton screens (not spinners)
- Empty states with helpful illustrations and CTAs

### No Images Required
This is a data-centric business tool - no hero images or decorative photography needed. Focus remains on data clarity and functional design.