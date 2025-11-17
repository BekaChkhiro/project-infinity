# Project Structure Documentation

## Overview

This document explains the structure and purpose of all files in the Project Infinity application.

## Root Configuration Files

### `package.json`
- Dependencies and scripts configuration
- Contains all npm packages needed for the project
- Key dependencies: Next.js 14, React 18, Supabase, Tailwind CSS, shadcn/ui

### `tsconfig.json`
- TypeScript configuration
- Sets up path aliases (@/* points to src/*)
- Configures strict type checking

### `tailwind.config.ts`
- Tailwind CSS configuration
- Defines custom colors and theme variables
- Includes shadcn/ui color system

### `postcss.config.mjs`
- PostCSS configuration for Tailwind CSS
- Handles CSS processing and optimization

### `next.config.mjs`
- Next.js framework configuration
- Can be extended for custom webpack config, redirects, etc.

### `components.json`
- Shadcn/ui configuration
- Defines component paths and styling preferences

### `.eslintrc.json`
- ESLint configuration for code quality
- Uses Next.js recommended rules

### `.gitignore`
- Git ignore rules
- Excludes node_modules, .next, .env files, etc.

### `.env.example`
- Template for environment variables
- Shows required Supabase credentials

### `.env.local`
- Actual environment variables (not committed to git)
- Contains Supabase URL and API keys

## Documentation Files

### `README.md`
- Project overview and quick start guide
- Lists features and technologies
- Basic setup instructions

### `SETUP.md`
- Detailed step-by-step setup instructions in Georgian
- Troubleshooting guide
- Supabase configuration walkthrough

### `PROJECT_STRUCTURE.md` (this file)
- Complete file structure documentation
- Explains purpose of each file and directory

## Database Migration Files

### `supabase/migrations/20240101000000_initial_schema.sql`
**Purpose**: Creates the core database schema

**Contents**:
- `users` table - User profiles extending auth.users
- `clients` table - Client information storage
- `projects` table - Project tracking with 18 stages
- `stage_history` table - Audit log for stage changes
- `project_stage` enum - Georgian language stage names
- Triggers for automatic timestamp updates
- Trigger for automatic stage history logging
- Function to create user profile on signup

### `supabase/migrations/20240101000001_rls_policies.sql`
**Purpose**: Implements Row Level Security

**Contents**:
- Enable RLS on all tables
- User policies (view own profile, update own profile)
- Client policies (authenticated users can CRUD)
- Project policies (based on ownership and assignment)
- Stage history policies (read-only, auto-created via triggers)
- Admin override policies

## Source Code Structure

### `src/middleware.ts`
**Purpose**: Next.js middleware for authentication

**Functionality**:
- Runs on every request
- Refreshes Supabase session
- Updates auth cookies
- Protects routes automatically

### Application Pages

#### `src/app/layout.tsx`
**Purpose**: Root layout component

**Features**:
- Sets up HTML structure
- Loads global CSS
- Configures fonts (Inter)
- Sets page metadata

#### `src/app/page.tsx`
**Purpose**: Home/landing page

**Functionality**:
- Checks if user is authenticated
- Redirects to /dashboard if logged in
- Redirects to /login if not logged in

#### `src/app/login/page.tsx`
**Purpose**: Login page

**Features**:
- Email/password login form
- Georgian language labels
- Error handling and display
- Client-side validation
- Redirects to dashboard on success

#### `src/app/signup/page.tsx`
**Purpose**: Registration page

**Features**:
- Sign up form with email, password, full name
- Georgian language labels
- Password strength requirements
- Success message
- Auto-redirect to dashboard

#### `src/app/dashboard/page.tsx`
**Purpose**: Main dashboard page

**Features**:
- Protected route (requires auth)
- Displays user welcome message
- Shows project statistics:
  - Total projects
  - Active projects
  - Completed projects
  - Total clients
- Uses DashboardLayout wrapper

#### `src/app/globals.css`
**Purpose**: Global styles and CSS variables

**Contents**:
- Tailwind directives
- CSS variables for theming
- Light and dark mode colors
- Base styles

### Layout Components

#### `src/components/layout/sidebar.tsx`
**Purpose**: Left sidebar navigation

**Features**:
- Responsive design
- Navigation links with icons:
  - მთავარი (Dashboard)
  - პროექტები (Projects)
  - კლიენტები (Clients)
  - ანალიტიკა (Analytics)
  - პარამეტრები (Settings)
- Active route highlighting
- Brand logo/name

#### `src/components/layout/header.tsx`
**Purpose**: Top header bar

**Features**:
- Page title display
- User profile dropdown
- Avatar with initials fallback
- User role display (ადმინი/მომხმარებელი)
- Logout functionality

#### `src/components/layout/dashboard-layout.tsx`
**Purpose**: Dashboard layout wrapper

**Features**:
- Combines Sidebar + Header
- Content area with scrolling
- Flex layout for responsive design
- Accepts user prop for header

### UI Components (shadcn/ui)

All UI components follow shadcn/ui patterns with Tailwind CSS.

#### `src/components/ui/button.tsx`
**Variants**: default, destructive, outline, secondary, ghost, link
**Sizes**: default, sm, lg, icon
**Features**: Slot support for asChild prop

#### `src/components/ui/card.tsx`
**Components**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
**Purpose**: Container components for content grouping

#### `src/components/ui/avatar.tsx`
**Components**: Avatar, AvatarImage, AvatarFallback
**Purpose**: User profile pictures with fallback

#### `src/components/ui/input.tsx`
**Purpose**: Form input field
**Features**: Full styling, focus states, disabled state

#### `src/components/ui/label.tsx`
**Purpose**: Form labels
**Features**: Accessible, disabled state styling

#### `src/components/ui/dropdown-menu.tsx`
**Components**: Multiple dropdown components
**Purpose**: User menu, context menus
**Features**: Radix UI primitives with Tailwind styling

### Library Files

#### `src/lib/utils.ts`
**Purpose**: Utility functions

**Functions**:
- `cn()` - Merges Tailwind classes intelligently

#### `src/lib/stages.ts`
**Purpose**: Project stage configuration

**Features**:
- Complete list of 18 Georgian stages
- Color coding by phase:
  - Sales (blue) - Stages 1-5
  - Development (purple) - Stages 6-11
  - Payment (orange) - Stages 12-17
  - Completion (green) - Stage 18
- Helper functions:
  - `getStageConfig()` - Get config for a stage
  - `getStageByNumber()` - Get stage by number
  - `getPhaseStages()` - Get all stages in a phase
  - `getNextStage()` - Get next stage
  - `getPreviousStage()` - Get previous stage
  - `getPhaseProgress()` - Calculate phase progress %

#### `src/lib/supabase/client.ts`
**Purpose**: Browser-side Supabase client

**Usage**: Client components (login, signup, etc.)
**Features**: Typed with Database schema

#### `src/lib/supabase/server.ts`
**Purpose**: Server-side Supabase client

**Usage**: Server components, API routes
**Features**: Cookie-based session management

#### `src/lib/supabase/middleware.ts`
**Purpose**: Middleware Supabase client

**Usage**: Next.js middleware
**Features**: Session refresh logic

### Type Definitions

#### `src/types/database.types.ts`
**Purpose**: TypeScript types for database

**Contents**:
- `ProjectStage` type - Union of all 18 stages
- `UserRole` type - 'admin' | 'user'
- `Database` interface - Complete database schema
- Table row/insert/update types for:
  - users
  - clients
  - projects
  - stage_history
- Helper type exports (User, Client, Project, etc.)

## Color Coding System

### Sales Phase (ეტაპები 1-5)
- **Color**: Blue (`text-blue-700`)
- **Background**: Light blue (`bg-blue-50`)
- **Border**: Blue (`border-blue-200`)
- **Purpose**: Initial contact, meetings, information gathering

### Development Phase (ეტაპები 6-11)
- **Color**: Purple (`text-purple-700`)
- **Background**: Light purple (`bg-purple-50`)
- **Border**: Purple (`border-purple-200`)
- **Purpose**: Development, testing, client feedback

### Payment Phase (ეტაპები 12-17)
- **Color**: Orange (`text-orange-700`)
- **Background**: Light orange (`bg-orange-50`)
- **Border**: Orange (`border-orange-200`)
- **Purpose**: Approval, payment processing, portfolio addition

### Completion Phase (ეტაპი 18)
- **Color**: Green (`text-green-700`)
- **Background**: Light green (`bg-green-50`)
- **Border**: Green (`border-green-200`)
- **Purpose**: Project completed

## Data Flow

### Authentication Flow
1. User visits app → `src/app/page.tsx`
2. Middleware checks auth → `src/middleware.ts`
3. Redirects to `/login` or `/dashboard`
4. Login form submits → `src/lib/supabase/client.ts`
5. Supabase validates credentials
6. Session created and stored in cookies
7. User redirected to dashboard

### Dashboard Data Flow
1. User visits `/dashboard` → `src/app/dashboard/page.tsx`
2. Server component fetches data → `src/lib/supabase/server.ts`
3. Queries:
   - Get current user from auth
   - Get user profile from users table
   - Get project statistics
   - Get client count
4. Data passed to layout → `src/components/layout/dashboard-layout.tsx`
5. Layout renders with sidebar and header
6. Stats displayed in cards

### Stage Change Flow (Future Feature)
1. User updates project stage
2. Frontend calls Supabase update
3. Database trigger fires → `log_stage_change()`
4. Entry created in `stage_history` table
5. Project `updated_at` timestamp updated
6. UI updates to show new stage with correct color

## Security Features

### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only see/modify their own data
- Admin role has override capabilities
- Stage history is read-only (trigger-managed)

### Authentication
- Supabase Auth handles password security
- Session tokens stored in secure cookies
- Middleware refreshes sessions automatically
- Protected routes check auth server-side

### Environment Variables
- Sensitive keys stored in .env.local
- Never committed to git
- Required for all Supabase operations

## Next Steps for Development

To extend this application, you can:

1. **Add Project CRUD**
   - Create form components
   - Implement create/read/update/delete operations
   - Add project listing page

2. **Add Client Management**
   - Client list view
   - Client detail page
   - Link clients to projects

3. **Add Analytics**
   - Charts for project statistics
   - Stage distribution visualization
   - Time tracking per stage

4. **Add Search & Filters**
   - Project search
   - Filter by stage/phase/client
   - Date range filtering

5. **Add Notifications**
   - Email on stage change
   - In-app notifications
   - Activity feed

6. **Add File Uploads**
   - Supabase Storage integration
   - Project attachments
   - Client documents

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features used
- CSS Grid and Flexbox layouts
- Requires JavaScript enabled
