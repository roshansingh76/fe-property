# PaliaProperty App Details

## 1. Overview
PaliaProperty is a regional property marketplace for agricultural land and rural real-estate opportunities in Palia Kalan and nearby areas of Lakhimpur Kheri, Uttar Pradesh. The platform is aimed at buyers, sellers, brokers, and administrators who need a simple way to discover, evaluate, and manage land listings using local market context.

The app is built as a modern Next.js frontend that connects to a separate backend API for live property data, location data, authentication, admin workflows, and inquiry management.

## 2. Business Goal
The platform helps users:
- discover agricultural land and investment property opportunities
- compare plots based on location, size, irrigation, and pricing
- understand local factors such as canal access, highway touch, and agriculture viability
- list land for sale with structured property details
- generate and track buyer inquiries and seller leads
- manage listings and users from a centralized admin console

## 3. Core Functional Modules

### 3.1 Public Marketplace
The public website includes a landing page, listing pages, and detailed property pages.

Key functionality:
- hero section with regional positioning and trust messaging
- market-focused landing page for agricultural land buyers
- listing cards with image, price, area, and property highlights
- property search by keyword, village, category, and sort order
- filters for budget, area, irrigation, highway proximity, and legal status
- comparison mode for up to three properties
- pagination and load-more behavior for larger result sets
- map and regional market intelligence sections
- SEO schema for public pages

### 3.2 Property Discovery Experience
Users can browse property listings using:
- category filters such as sugarcane farm, paddy-wheat land, farmhouse, residential plot, or commercial property
- location filters based on villages and towns in the local region
- unit conversion support for bigha, acre, hectare, and sqft
- price sorting and area sorting
- search terms relevant to property title, village, or land type

The listing page also supports advanced search preferences for:
- minimum and maximum area
- minimum and maximum budget
- irrigation source requirements
- highway or canal touch conditions
- registry-ready and immediate-sale conditions

### 3.3 Property Detail Pages
Each property detail page provides:
- title and listing summary
- price and area details
- location and district information
- land-use category and listing type
- irrigation source and soil context
- road frontage and connectivity information
- legal and registry status flags
- seller contact and verification data
- images and description
- related property metadata

These pages are built to support serious land-buying decisions in agricultural and semi-urban markets.

### 3.4 Buyer Inquiry Workflow
The app supports buyer lead generation through form-based inquiry flows.

Buyer inquiry captures:
- buyer name and phone number
- purpose of purchase
- preferred villages
- area preference and budget range
- irrigation or water source requirement
- highway access preference
- immediate registry requirement
- notes and additional comments

This data is submitted to the backend API for lead capture and workflow handling.

### 3.5 Seller Lead Capture
The app has seller-focused lead collection features including a modal form for land listings and seller outreach.

Seller forms capture:
- seller name and contact details
- property/location context
- expected sale intent or listing purpose
- land details and urgency assessment

This helps the platform collect and qualify seller leads.

### 3.6 Dashboard and Admin Modules
The application includes admin-facing dashboards for operational management.

Admin features include:
- user management
- property review and moderation
- pending property approval workflow
- seller, buyer, broker, and agent classification
- dashboard KPIs for marketplace activity
- review actions to approve or reject listings
- lead monitoring and operational reporting

The admin UI checks user roles such as ADMIN and SUPER_ADMIN before allowing access.

### 3.7 Role-Based Access Patterns
The app is shaped around several user categories:
- buyer
- seller
- broker
- agent
- admin

Different routes and dashboard states are implemented for different user segments, with role-based gating in the UI and API interactions.

## 4. Functional User Flows

### 4.1 Buyer Flow
1. User visits the home page and sees regional marketing content.
2. User uses quick search or listing browse to find properties.
3. User filters results by category, village, price, and land size.
4. User compares shortlisted properties.
5. User opens a listing and evaluates legal, irrigation, and market details.
6. User submits a buyer inquiry to express interest.

### 4.2 Seller Flow
1. Seller clicks the sell-land call-to-action from the navbar or landing page.
2. Seller submits property details to the platform.
3. The backend stores and reviews the listing.
4. Admin verifies or rejects the listing.
5. Approved listing appears in the marketplace.

### 4.3 Admin Flow
1. Admin logs in to the admin dashboard.
2. Dashboard loads key stats: users, properties, leads, pending reviews.
3. Admin reviews pending property submissions.
4. Admin approves or rejects listings.
5. Admin manages users and operational data.

## 5. Data and API Layer
The frontend reads and submits data through a centralized API client in `lib/api/client.ts`.

It supports:
- fetching property lists with filters and pagination
- fetching individual property data by slug
- fetching location names and regional data
- creating buyer inquiries
- retrieving admin dashboard data
- performing admin review actions on pending properties

The API base is configured through:

```bash
NEXT_PUBLIC_API_URL
```

Default production fallback:

```text
https://be-property.onrender.com/api/v1
```

## 6. Key Frontend Structure

### `app/`
Contains route-level pages:
- home page
- property listings page
- property detail pages
- buyer, seller, broker, and admin sections
- login and profile pages
- legal pages such as privacy policy and disclaimer

### `components/`
Contains reusable UI and sections such as:
- navbar and footer
- hero search and filter sidebar
- property cards and comparison panels
- seller form modal
- buyer inquiry form
- admin dashboard components
- map and market intelligence components

### `lib/`
Contains core logic for:
- property schema and category definitions
- data conversions and formatting
- app-level authentication logic
- hooks for saved properties and filter state
- client-side API integration

## 7. Key Functional Features in the Codebase
From the current implementation, the app includes:
- advanced property filtering
- comparison of up to three properties
- unit conversion utility for land-area measurement
- local and district-based marketplace positioning
- trust statistics and marketing-driven landing page sections
- map-driven exploration and market intelligence widgets
- seller and buyer form flows connected to backend endpoints
- role-aware admin dashboard

## 8. Technology Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Leaflet
- Prisma tooling
- Fastify backend integration

## 9. Local Setup
From the project root:

```bash
npm install
npm run dev
```

Open the app in the browser:

```text
http://localhost:3000
```

## 10. Backend Dependency
The frontend uses an external backend project in a sibling directory:

```text
../paliapropertybk
```

This backend is used for:
- property and location APIs
- user authentication
- admin operations
- lead and inquiry processing

The project includes scripts to work with that backend, including:
- `backend:dev`
- `backend:build`
- `backend:start`
- `prisma:generate`
- `prisma:migrate`

## 11. Business Value of the Application
This project is not a generic property app. It is built specifically for the local land market, where buyers care about:
- irrigation availability
- road connectivity and market access
- agricultural productivity
- registry and legal confidence
- village-level value trends

The platform is designed to bring trust, searchability, and transaction readiness to rural and semi-urban land opportunities in the Palia region.

## 12. Recommended Future Documentation
Suggested follow-up documents for the project:
- environment variables and deployment setup
- backend API contract and endpoint list
- property schema and database model
- admin role and permission matrix
- buyer and seller workflow diagrams
- deployment architecture and hosting plan
