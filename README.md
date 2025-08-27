# Huntaze API

Backend API for Huntaze - AI-powered content creator assistant.

## Setup Instructions

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database

3. Copy `.env.example` to `.env` and update values

4. Run database migrations:
```bash
npx prisma db push
```

5. Start development server:
```bash
npm run dev
```

### Production Deployment

#### Option 1: Railway.app

1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard:
   - `DATABASE_URL` (automatically provisioned)
   - `JWT_SECRET` 
   - `FRONTEND_URL=https://huntaze.com`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - Stripe keys

3. Deploy will happen automatically

#### Option 2: Render.com

1. Connect GitHub repo
2. Use `render.yaml` for configuration
3. Add environment variables in dashboard

#### Option 3: Docker

```bash
docker build -t huntaze-api .
docker run -p 8080:8080 --env-file .env.production huntaze-api
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Add these authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback` (development)
   - `https://api.huntaze.com/api/auth/google/callback` (production)

### Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `FRONTEND_URL`: Frontend URL (https://huntaze.com)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

Optional:
- `STRIPE_SECRET_KEY`: Stripe API key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `PORT`: Server port (default: 4000)