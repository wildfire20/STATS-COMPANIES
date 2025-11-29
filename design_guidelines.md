# Design Guidelines: STATS COMPANIES E-Commerce & Portfolio Platform

## Design Approach
**Selected Approach**: Reference-Based (Shopify + Adobe Portfolio + Squarespace)
**Rationale**: Creative media showcase requiring high visual impact, e-commerce functionality, and portfolio presentation. Drawing inspiration from Shopify's clean product layouts, Adobe Portfolio's immersive galleries, and Squarespace's sophisticated typography.

**Key Design Principles**:
- Visual storytelling through high-quality imagery
- Clear hierarchy between creative showcase and functional e-commerce
- Professional elegance balanced with creative energy
- Seamless transition between marketing, shopping, and dashboard experiences

## Core Design Elements

### Typography
- **Primary Font**: Inter via Google Fonts CDN
- **Headings**: Inter Bold (700) - Hero 4xl/5xl, Section headers 3xl, Card titles xl
- **Body Text**: Inter Regular (400) - Base text, product descriptions
- **Accents**: Inter SemiBold (600) for CTAs, pricing, navigation

### Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16 for visual breathing room
- Hero sections: py-20 to py-32 desktop, py-12 mobile
- Service sections: py-16 with gap-8 between cards
- Product grids: gap-6
- Dashboard layouts: p-6 panels with gap-4 for data density

**Grid Structures**:
- Portfolio galleries: Masonry grid (3-4 columns desktop, staggered heights)
- Service showcase: 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Product catalog: 3-column grid with filters sidebar
- Dashboard metrics: 3-column cards (matching previous system for consistency)

### Component Library

**Homepage Components**:
- Hero Banner: Full-width image with overlay gradient (navy to transparent), centered headline + tagline, dual CTAs ("Explore Services" + "Shop Now") with blurred backdrop-blur-sm backgrounds
- Services Grid: 4 cards with icon, title, brief description, hover state revealing "Learn More" link
- Featured Work Carousel: Large image slider showcasing portfolio highlights
- Statistics Bar: 4-metric horizontal display (Projects Completed, Happy Clients, Years Experience, Services)
- Testimonials: 3-column cards with client photo, quote, company name
- Newsletter Signup: Clean form integrated into footer area with background treatment

**Service Pages**:
- Service hero: 2-column split (60/40) - left: headline, description, pricing starting at, CTA; right: relevant service image
- Process Timeline: Vertical stepper showing workflow (Consultation → Design → Production → Delivery)
- Package Comparison Table: 3-tier pricing cards (Basic, Professional, Premium)
- Recent Work Gallery: 6-image grid linking to full portfolio

**E-Commerce Shop**:
- Product Cards: Image, title, starting price, customization badge
- Product Configurator: Left sidebar with options (size, material, quantity, finish), live preview right side, price updating in real-time
- Category Filters: Checkbox groups (Business Cards, Banners, Posters, Marketing Materials)
- Cart Drawer: Slide-in from right with line items, quantity adjusters, proceed to checkout

**Portfolio Galleries**:
- Category Tabs: Photography, Videography, Print Design, Marketing Campaigns
- Lightbox View: Click image for full-screen overlay with prev/next navigation
- Project Details: Client name, date, services used, project description

**Booking System**:
- Service selector dropdown, calendar date picker, time slot grid (9am-5pm), contact form
- Confirmation modal with booking summary

**Customer Dashboard**:
- Order History table: sortable, expandable rows for tracking details
- Active Projects panel: status badges (In Progress, Under Review, Completed)
- Quick reorder buttons for frequent purchases
- Account settings tabs

**Admin Dashboard**:
- Reuse Carbon Design patterns from previous guidelines for data tables, metrics, audit logs
- Order management with bulk actions
- Inventory tracking for print materials

### Images
**Hero Banner**: High-resolution photo showcasing creative workspace - designer at computer with vibrant print samples, photography equipment visible. Wide format (2400x800px). Apply gradient overlay dark navy (#1a3a6b) to transparent top-to-bottom for text readability.

**Service Section Images**: 
- Printing: Close-up of high-quality prints being produced
- Photography: Professional photographer with camera equipment
- Videography: Video production setup with lighting
- Marketing: Creative team brainstorming with mood boards

**Portfolio Samples**: Minimum 12 high-quality images per category showing finished work (printed materials, event photos, commercial videos, branding campaigns)

**Product Configurator**: Real-time preview mockups of customizable products (business cards, banners) updating as options change

### Icons
**Library**: Font Awesome (solid style)
**Usage**: 
- Services: print, camera, video, bullhorn (marketing)
- E-commerce: shopping-cart, box, credit-card, truck (shipping)
- Dashboard: chart-line, calendar, user, cog
- Portfolio: image, play-circle, palette

### Accessibility
- All form inputs with labels positioned above, high contrast against backgrounds
- Focus states: ring-2 ring-sky-500 for brand consistency
- Image alt text describing portfolio work specifically
- Color contrast minimum 4.5:1 for text on navy backgrounds (use white/off-white)
- Keyboard navigation throughout configurator and galleries

### Professional Conventions
- Product prices with clear "Starting at $XX" messaging
- Turnaround time indicators (24hr, 3-day, 1-week badges)
- File upload requirements clearly stated (formats, dimensions, resolution)
- Order tracking with real-time status updates
- Download links for completed digital deliverables expire in 30 days messaging