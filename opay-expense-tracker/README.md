# OPay-Inspired Expense Tracker

A modern, mobile-first expense tracking application with voice input, gamification, and Google authentication.

## Features

- **Google OAuth Authentication** - Secure sign-in with Google accounts
- **Voice Entry** - Natural language expense logging using Web Speech API
- **Gamification** - Streak tracking, achievements, and progress rings
- **Offline Support** - Queue expenses offline and sync when connected
- **Mobile-First Design** - OPay-inspired UI optimized for budget devices
- **Real-time Sync** - Automatic data synchronization with Supabase

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom OPay design tokens
- **State Management**: Zustand (UI state) + TanStack Query (server state)
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Voice**: Web Speech API (browser-native)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- Google OAuth credentials (for authentication)

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the database migration:
   ```sql
   -- Execute the SQL in /supabase/migrations/20250101000000_initial_schema.sql
   ```
3. Deploy the edge function:
   ```bash
   supabase functions deploy create-expense
   ```
4. Configure Google OAuth provider in Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Development

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### 6. Build for Production

```bash
pnpm build
```

## Project Structure

```
opay-expense-tracker/
├── src/
│   ├── components/       # React components
│   │   ├── AuthScreen.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ExpenseModal.tsx
│   │   ├── VoiceModal.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   ├── useExpenseData.ts
│   │   └── useVoiceInput.ts
│   ├── stores/           # Zustand stores
│   │   └── index.ts
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   ├── lib/              # Utilities
│   │   └── supabase.ts
│   └── App.tsx
├── supabase/
│   ├── functions/        # Edge functions
│   │   └── create-expense/
│   └── migrations/       # Database migrations
└── docs/                 # Design specifications
```

## Design System

The application follows the OPay design philosophy:
- **Primary Color**: #1DCF9F (OPay Green)
- **Typography**: Inter font family
- **Spacing**: 8-point grid system
- **Animations**: Conservative (120-300ms) for performance

See `docs/design-specification.md` for complete design tokens and component specs.

## Voice Input

Voice expense entry uses the Web Speech API:
- Supported in Chrome, Edge, and Safari
- Natural language parsing for amounts, categories, and merchants
- Example: "I spent 50 dollars on groceries at Whole Foods"

## Gamification

- **Streak System**: Track consecutive days of expense logging
- **Achievements**: Unlock badges for milestones
- **Progress Rings**: Visual budget tracking

## Offline Support

- Expenses are queued locally when offline
- Automatic sync when connection is restored
- Idempotency keys prevent duplicates

## Browser Support

- Chrome/Edge: Full support (including voice)
- Safari: Full support (including voice)
- Firefox: Limited voice support
- Mobile browsers: Optimized for mobile devices

## Troubleshooting

### Voice Input Not Working

1. Ensure you're using a supported browser (Chrome, Edge, Safari)
2. Grant microphone permissions when prompted
3. Check browser console for errors

### Authentication Issues

1. Verify Supabase URL and anon key in `.env`
2. Ensure Google OAuth is configured in Supabase Dashboard
3. Check redirect URLs match your domain

### Database Errors

1. Verify database schema is up to date
2. Check RLS policies are enabled
3. Ensure user has proper permissions

## License

MIT

## Support

For issues or questions, please check:
- Documentation in `/docs`
- Technical architecture in `/docs/architecture/technical-architecture.md`
- Design specification in `/docs/design-specification.md`
