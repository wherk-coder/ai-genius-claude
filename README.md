# AI Betting Assistant

Your Personal Betting Genius - Transforming Sports Betting Through Artificial Intelligence

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Docker (optional, for local database)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd ai-genius-claude
pnpm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. **Database Setup**

Using Supabase (cloud PostgreSQL):
- Complete the DATABASE_URL in your .env.local file
- See human_todo.md for exact connection string format

4. **Set up database**
```bash
pnpm --filter @ai-betting-assistant/database db:generate
pnpm --filter @ai-betting-assistant/database db:push
```

5. **Start development server**
```bash
pnpm dev
```

The API will be available at: http://localhost:4000
API Documentation: http://localhost:4000/api/docs

## Project Structure

```
ai-betting-assistant/
├── apps/
│   ├── api/          # NestJS Backend API
│   ├── web/          # Next.js Web App
│   ├── mobile/       # React Native App
└── packages/
    ├── database/     # Prisma Schema & Migrations
    ├── shared/       # Shared Types & Utils
    └── ui/           # UI Component Library
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm dev

# Start specific app
pnpm --filter @ai-betting-assistant/api dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format

# Database operations
pnpm --filter @ai-betting-assistant/database db:studio
pnpm --filter @ai-betting-assistant/database db:migrate dev
```

## Documentation

- [Human TODO](./human_todo.md) - External services setup
- [Development TODO](./TODO.md) - Complete development roadmap
- [Claude Instructions](./CLAUDE.md) - AI assistant guidance

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js, React Native, TailwindCSS
- **ML/AI**: Python FastAPI, OpenAI, Tesseract OCR
- **Infrastructure**: Docker, AWS/GCP
- **Payments**: Stripe
- **Real-time**: WebSockets, Redis

## Current Status

✅ Project structure and monorepo setup
✅ NestJS API with authentication
✅ Prisma database schema
✅ User management system
🚧 Receipt scanner service (next)
🚧 Web frontend (next)

See [TODO.md](./TODO.md) for complete development roadmap.