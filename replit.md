# STATS Companies E-Commerce Website

## Overview
A complete e-commerce website for STATS Companies, a digital printing, photography, videography, and digital marketing company based in Pretoria, South Africa. The website showcases services, enables e-commerce for print products, displays portfolio work, and provides booking functionality.

**Tagline:** "You dream it, We make it."

## Tech Stack
- **Frontend:** React with Vite, TailwindCSS, shadcn/ui components
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Storage:** Replit Object Storage for image uploads
- **Authentication:** Dual system (Replit Auth + local email/password)
- **Routing:** Wouter for client-side, Express for API
- **State Management:** TanStack Query (React Query)

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/         # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── Bookings.tsx
│   │   │   ├── Quote.tsx
│   │   │   └── Promotions.tsx
│   │   ├── lib/           # Utilities and query client
│   │   └── hooks/         # Custom hooks
├── server/
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # In-memory data storage
├── shared/
│   └── schema.ts          # Data models and types
└── design_guidelines.md   # Brand styling guide
```

## Features

### Pages
1. **Home** - Hero banner, services overview, portfolio highlights, testimonials, CTAs
2. **About Us** - Company story, team members, mission/vision, timeline
3. **Shop** - Product catalog with filtering, search, category navigation
4. **Services** - Photography, Videography, Digital Marketing offerings
5. **Portfolio** - Gallery with categories (photography, videography, branding)
6. **Bookings** - Session scheduling with calendar and time slots
7. **Quote Request** - Multi-field form for custom project quotes
8. **Promotions** - Active deals and special offers

### API Endpoints
- `GET/POST /api/products` - Product management
- `GET/POST /api/services` - Service offerings
- `GET/POST /api/portfolio` - Portfolio items
- `GET/POST /api/bookings` - Session bookings
- `GET/POST /api/orders` - Order management
- `GET/POST /api/quotes` - Quote requests
- `GET/POST /api/promotions` - Promotional offers
- `GET/POST /api/testimonials` - Customer testimonials
- `GET/POST /api/team` - Team members

## Brand Colors
- **Primary:** Navy Blue (#1e3a5f)
- **Accent:** Light Blue (#4a90a4)
- **Background:** Light (#f8fafc) / Dark (#0a1628)
- **Text:** Dark gray to white based on theme

## Admin Dashboard
Complete admin dashboard accessible at `/admin` with the following features:
- **Authentication:** Dual login system (Replit Auth + local credentials)
- **Demo Credentials:** admin@statscompanies.co.za / Admin@123

### Admin Management Pages
1. **Dashboard** - Overview with stats and charts
2. **Services Management** - CRUD for service offerings with image upload
3. **Products Management** - CRUD for print products with image upload
4. **Portfolio Management** - CRUD for portfolio items with image upload
5. **Promotions Management** - CRUD for promotional offers with image upload
6. **Team Management** - CRUD for team members with image upload
7. **Testimonials Management** - CRUD for customer reviews with image upload
8. **Orders Management** - View and manage customer orders
9. **Quotes Management** - View and respond to quote requests
10. **Bookings Management** - View and manage session bookings

### Image Upload System
All admin forms support direct image uploads from device:
- Drag-and-drop file upload support
- Click to browse and select files
- Preview of uploaded images
- Fallback to URL input for external images
- Files stored in Replit Object Storage with public URLs

## Recent Changes
- Added comprehensive admin dashboard with 10 management pages
- Implemented image upload system using Replit Object Storage
- Added dual authentication (Replit Auth + local login)
- Migrated from in-memory to PostgreSQL database
- Seeded database with sample content

## Development
The app runs with `npm run dev` which starts:
- Express backend on port 5000
- Vite frontend with HMR

## Key Files
- `server/objectStorage.ts` - Object storage utilities for file uploads
- `server/routes.ts` - API routes including `/api/upload/image` endpoint
- `client/src/components/ImageUpload.tsx` - Reusable image upload component
- `shared/schema.ts` - Database models with Drizzle ORM
