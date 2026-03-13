# Barin Sports PRO Analytics

A Progressive Web App for professional football sports science. Processes weekly GPS CSV exports from the Barin Sports PRO GPS system, computes performance and injury risk indexes (API, RTT, RS, TMI, Injury Risk), and displays practitioner-level reports with academic citations and actionable recommendations.

## Prerequisites

- Node 18+
- Supabase account
- Netlify account
- GitHub account

## Local Setup

```bash
git clone <your-repo-url>
cd barin-sports-pro
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
npm run dev
```

## Database Setup

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Paste the contents of `supabase/schema.sql`
4. Click Run

## Enable Supabase Email Auth

1. Go to Authentication > Providers > Email
2. Enable email provider
3. Disable email confirmation (for internal tool use)
4. Create user accounts manually in the Authentication > Users tab

## Deploy to Netlify

1. Connect your GitHub repo in the Netlify dashboard
2. Set environment variables in Netlify Site Settings > Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy — the `netlify.toml` handles build command and publish directory automatically
