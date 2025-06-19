# Human TODO - External Services & API Keys Setup

This document lists all the external services, accounts, and API keys you need to set up for the AI Betting Assistant project.

## 1. Database Setup

### PostgreSQL Database - USING SUPABASE
- **Supabase Setup** (CHOSEN OPTION): https://supabase.com
  1. ✅ DONE


## 2. Authentication & Security✅ DONE




## 3. Payment Processing

### Stripe
- **URL**: https://stripe.com
- **Setup**:
  1. Create account (use test mode initially)
  2. Go to Developers → API keys
  3. Copy both Publishable key and Secret key
  4. Add to `.env.local`:
     ```
     STRIPE_PUBLISHABLE_KEY="pk_test_..."
     STRIPE_SECRET_KEY="sk_test_..."
     STRIPE_WEBHOOK_SECRET="whsec_..." (get this after setting up webhooks)
     ```
  5. For webhooks:
     - Go to Developers → Webhooks
     - Add endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
     - Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

## 4. Cloud Storage (for receipt images)

### AWS S3 or Alternatives
- **Option 1: AWS S3**
  - **URL**: https://aws.amazon.com
  - Create AWS account
  - Create S3 bucket for receipts
  - Create IAM user with S3 access
  - Add to `.env.local`:
    ```
    AWS_ACCESS_KEY_ID="your-access-key"
    AWS_SECRET_ACCESS_KEY="your-secret-key"
    AWS_REGION="us-east-1"
    S3_BUCKET_NAME="ai-betting-assistant-receipts"
    ```

- **Option 2: Cloudinary (easier setup)**
  - **URL**: https://cloudinary.com
  - Sign up for free account
  - Go to Dashboard
  - Copy Cloud name, API Key, and API Secret
  - Add to `.env.local`:
    ```
    CLOUDINARY_CLOUD_NAME="your-cloud-name"
    CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"
    ```

## 5. AI/ML Services

### OpenAI (for natural language insights)
- **URL**: https://platform.openai.com
- **Setup**:
  1. Create account and add billing
  2. Go to API keys
  3. Create new secret key
  4. Add to `.env.local`: `OPENAI_API_KEY="sk-..."`

### Google Cloud Vision API (backup for OCR)
- **URL**: https://cloud.google.com/vision
- **Setup**:
  1. Create Google Cloud account
  2. Enable Vision API
  3. Create service account key (JSON)
  4. Save JSON file as `google-vision-key.json` in project root
  5. Add to `.env.local`: `GOOGLE_APPLICATION_CREDENTIALS="./google-vision-key.json"`

## 6. Sports Data Providers

### Primary Option: The Odds API
- **URL**: https://the-odds-api.com
- **Setup**:
  1. Sign up for account (free tier available)
  2. Get API key from dashboard
  3. Add to `.env.local`: `ODDS_API_KEY="your-api-key"`

### Alternative: SportsDataIO
- **URL**: https://sportsdata.io
- **Setup**:
  1. Create account
  2. Subscribe to desired sports (NFL, NBA, etc.)
  3. Get API keys for each sport
  4. Add to `.env.local`:
    ```
    SPORTSDATA_NFL_KEY="your-nfl-key"
    SPORTSDATA_NBA_KEY="your-nba-key"
    SPORTSDATA_MLB_KEY="your-mlb-key"
    ```

## 7. Email Service

### SendGrid or Resend
- **Option 1: SendGrid**
  - **URL**: https://sendgrid.com
  - Create account
  - Verify sender email
  - Create API key
  - Add to `.env.local`: `SENDGRID_API_KEY="SG..."`

- **Option 2: Resend (simpler)**
  - **URL**: https://resend.com
  - Sign up and verify domain
  - Get API key
  - Add to `.env.local`: `RESEND_API_KEY="re_..."`

## 8. Monitoring & Analytics

### Sentry (Error Tracking)
- **URL**: https://sentry.io
- **Setup**:
  1. Create account and project
  2. Get DSN from project settings
  3. Add to `.env.local`: `SENTRY_DSN="https://...@sentry.io/..."`

### Mixpanel or PostHog (Analytics)
- **URL**: https://mixpanel.com or https://posthog.com
- Get project token
- Add to `.env.local`: `MIXPANEL_TOKEN="your-token"` or `POSTHOG_API_KEY="your-key"`

## 9. Development Tools

### Redis (for caching)
- **Option 1: Upstash Redis**
  - **URL**: https://upstash.com
  - Create Redis database
  - Copy connection details
  - Add to `.env.local`:
    ```
    REDIS_URL="redis://default:password@host:port"
    ```

### GitHub
- Create repository for the project
- Set up GitHub Actions secrets for CI/CD

## 10. Mobile App Services

### Expo (for React Native)
- **URL**: https://expo.dev
- Create account for EAS Build
- Add to `.env.local`: `EXPO_PROJECT_ID="your-project-id"`

### App Store Accounts
- **Apple Developer**: https://developer.apple.com ($99/year)
- **Google Play Console**: https://play.google.com/console ($25 one-time)

## Environment File Template

Create `.env.local` file with this template:

```env
# Database
DATABASE_URL=""

# Authentication
JWT_SECRET=""
JWT_EXPIRES_IN="7d"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Stripe
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Storage (choose one)
# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
S3_BUCKET_NAME=""
# OR Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# AI Services
OPENAI_API_KEY=""
GOOGLE_APPLICATION_CREDENTIALS=""

# Sports Data
ODDS_API_KEY=""
# OR
SPORTSDATA_NFL_KEY=""
SPORTSDATA_NBA_KEY=""
SPORTSDATA_MLB_KEY=""

# Email (choose one)
SENDGRID_API_KEY=""
# OR
RESEND_API_KEY=""

# Monitoring
SENTRY_DSN=""
MIXPANEL_TOKEN=""

# Redis
REDIS_URL=""

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

## Priority Order for Setup

1. **Immediate (needed for basic development)**:
   - PostgreSQL database (Supabase/Neon)
   - JWT secrets
   - Create `.env.local` file

2. **Soon (needed within first month)**:
   - Stripe account (can use test mode)
   - Cloud storage (S3/Cloudinary)
   - Sports data API (at least one)

3. **Later (needed before launch)**:
   - OpenAI API
   - Email service
   - Monitoring tools
   - Mobile app store accounts

## Notes

- Start with free tiers where available
- Use test/sandbox modes for payment and sports data initially
- Keep all credentials secure and never commit to git
- Add `.env.local` to `.gitignore` (already done)
- Create `.env.example` with empty values for team reference