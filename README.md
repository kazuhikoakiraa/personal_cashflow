# Cashflow - Personal Finance Tracker

A modern web app for tracking income, expenses, budgets, and savings goals.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** tRPC (end-to-end type-safe API)
- **Database:** PostgreSQL via Supabase + Prisma ORM
- **Authentication:** Supabase Auth
- **Charts:** Recharts
- **Deployment:** Vercel

## Project Structure

```
cashflow/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes (login, register)
│   ├── (dashboard)/        # Protected routes (dashboard, transactions, budgets, savings)
│   └── api/trpc/           # tRPC API endpoint
├── server/                 # Backend logic
│   ├── routers/            # tRPC routers (transaction, category, budget, savings)
│   ├── db.ts               # Prisma client singleton
│   ├── trpc.ts             # tRPC initialization & context
│   └── root.ts             # Root router combining all sub-routers
├── prisma/
│   └── schema.prisma       # Database schema
├── components/
│   └── ui/                 # UI components (placeholders for shadcn)
├── lib/
│   ├── utils.ts            # Utility functions (formatting, etc.)
│   └── supabase.ts         # Supabase client initialization
└── public/                 # Static assets
```

## Database Models

- **User**: User accounts from Supabase Auth
- **Category**: Income/Expense categories with custom colors and icons
- **Transaction**: Income and expense records
- **Budget**: Monthly budget limits per category
- **SavingsGoal**: Savings targets with tracking
- **SavingsDeposit**: Deposits toward savings goals

## Getting Started

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (free tier available)

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://user:password@localhost:5432/cashflow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

First, ensure your Supabase database is running:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or use migrations
npx prisma migrate dev --name init
```

### 4. Install Dependencies

Dependencies are already installed (see package.json). If you need to reinstall:

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Routes

### Public Routes
- `/login` - Sign in
- `/register` - Create account

### Protected Routes (Dashboard)
- `/dashboard` - Overview & summary
- `/dashboard/transactions` - View transactions
- `/dashboard/transactions/new` - Add transaction
- `/dashboard/budgets` - Budget management
- `/dashboard/savings` - Savings goals

### API Routes
- `/api/trpc/[trpc]` - tRPC endpoint for all operations

## tRPC Usage Examples

### Creating a Transaction

```typescript
// Client-side
const result = await trpc.transaction.create.mutate({
  categoryId: "...",
  amount: "150.50",
  type: "EXPENSE",
  note: "Grocery shopping",
  date: new Date(),
});
```

### Getting Transactions

```typescript
const data = await trpc.transaction.list.query({
  limit: 50,
  offset: 0,
  type: "EXPENSE",
});
```

### Creating a Category

```typescript
const category = await trpc.category.create.mutate({
  name: "Groceries",
  icon: "shopping-cart",
  type: "EXPENSE",
  color: "#FF6B6B",
});
```

## Features (Phase 1)

✅ Complete data models and tRPC routers  
✅ Dashboard with summary cards  
✅ Transaction CRUD operations  
✅ Category management  
✅ Database schema with relations  

## Upcoming Features

### Phase 2
- Monthly budgets with progress tracking
- Savings goals with deposit tracking
- Budget alerts

### Phase 3
- Monthly cashflow bar charts (Recharts)
- Expense breakdown pie charts
- 6-month spending trends
- Export reports to CSV/PDF

## API Documentation

### Transaction Router
- `transaction.create` - Create a transaction
- `transaction.list` - Get transactions with filtering
- `transaction.getById` - Get single transaction
- `transaction.update` - Update transaction
- `transaction.delete` - Delete transaction
- `transaction.getByCategory` - Group transactions by category

### Category Router
- `category.create` - Create category
- `category.list` - Get all categories
- `category.update` - Update category
- `category.delete` - Delete category

### Budget Router
- `budget.upsert` - Create or update budget
- `budget.getByMonth` - Get budgets for a month with spending
- `budget.delete` - Delete budget

### Savings Router
- `savings.createGoal` - Create savings goal
- `savings.listGoals` - Get all goals
- `savings.addDeposit` - Add deposit to goal
- `savings.removeDeposit` - Remove deposit
- `savings.deleteGoal` - Delete goal
- `savings.updateGoal` - Update goal details

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_feature

# View database in Prisma Studio
npx prisma studio
```

### Type Safety

All tRPC procedures are fully typed. Import the router type in your client:

```typescript
import type { AppRouter } from "~/server/root";
```

## Deployment to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add DATABASE_URL
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL (for redirects) | No |

## Troubleshooting

### Connection refused to database
- Verify `DATABASE_URL` is correct
- Check Supabase database is running
- Ensure firewall allows connections

### tRPC route not found
- Make sure router is imported in `server/root.ts`
- Check procedure names match exactly

### Type errors
- Run `npx prisma generate` to regenerate types
- Ensure TypeScript is up to date: `npm update typescript`

## Contributing

This is a personal project. Contributions welcome via pull requests.

## License

MIT
