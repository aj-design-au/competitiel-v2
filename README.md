# Competitel V2

A production-ready competitive pricing intelligence SaaS tool built with Next.js 16, Supabase, and Google Gemini AI.

## Features

- **Price Comparison Dashboard** — Sortable, filterable comparison table with inline price editing and sparkline trends
- **Product Management** — Track your products with cost price, margins, and categories
- **Competitor Tracking** — Monitor competitors and their product pricing
- **Price History** — Automatic price logging with 30-day trend visualization
- **AI Insights** — Powered by Google Gemini 2.0 Flash for competitive analysis and recommendations
- **Price Alerts** — Automated alerts for significant competitor price changes or margin drops
- **Best-effort Scraping** — Optional price scraping via Cheerio (manual entry is primary)
- **Export to CSV** — Export your comparison data at any time

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-ui)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **ORM:** Prisma 7
- **AI:** Google Gemini 2.0 Flash
- **Charts:** Recharts sparklines
- **Notifications:** Sonner

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- (Optional) Google Gemini API key

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repo>
   cd competitel-v2
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and optionally your Gemini API key.

3. **Run the database migration:**
   Apply `supabase/migrations/001_initial_schema.sql` to your Supabase project via the SQL editor or CLI:
   ```bash
   supabase db push
   # or manually run the SQL in Supabase Studio > SQL Editor
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `DATABASE_URL` | PostgreSQL connection URL (pooled, for Prisma) | Yes |
| `DIRECT_URL` | Direct PostgreSQL connection URL (for migrations) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |

Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey).

## Database Setup

Run the migration file at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor. This creates:

- All tables with proper constraints and indexes
- Row Level Security (RLS) policies for per-user data isolation
- Triggers for automatic profile creation on signup
- Triggers for automatic price history logging on price updates
- Timestamp auto-update triggers

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

The app is fully serverless-compatible with Vercel's edge runtime.

## Architecture

```
src/
  app/
    (auth)/login, signup, forgot-password
    dashboard/          # Main dashboard with comparison table
    products/           # Product management
    competitors/        # Competitor management
    insights/           # AI analysis feed
    alerts/             # Price alerts
    settings/           # User settings
    api/                # API route handlers
  components/
    dashboard/          # ComparisonTable, SummaryCards, AlertsFeed, Sparklines
    products/           # ProductForm, ProductLinksManager
    competitors/        # CompetitorForm, CompetitorProductsManager
    insights/           # AnalysisCard, RunAnalysisButton
    layout/             # Sidebar, TopNav, MobileNav
    ui/                 # shadcn/ui components
  lib/
    supabase/           # Browser, server, admin Supabase clients
    prisma/             # Prisma client
    gemini/             # Gemini AI analyzer
    scraper/            # Cheerio-based price scraper (best effort)
    utils/              # Pricing calculations
  types/                # TypeScript types
prisma/
  schema.prisma         # Data model
supabase/
  migrations/           # SQL migrations
```

## Usage Guide

1. **Sign up** and create an account
2. **Add your products** — name, selling price, cost price, and target margin
3. **Add competitors** — name, website URL, and platform
4. **Add competitor products** — link their products with current prices
5. **Link products** — connect your products to competitor products for comparison
6. **View the dashboard** — see the comparison table with status badges and sparklines
7. **Run AI analysis** — click "Run AI Analysis" on the Insights page for recommendations

## License

MIT
