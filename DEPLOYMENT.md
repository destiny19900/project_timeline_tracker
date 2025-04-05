# Deployment Guide for Buildera Task App

This guide provides instructions for deploying the Buildera Task application to production environments.

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account for database (or alternative configured backend)
- OpenAI API key for AI project generation features
- Hosting service (Vercel, Netlify, AWS, etc.)

## Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```

2. Fill in the following environment variables:
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Build Process

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

2. Build for production:
   ```bash
   npm run build
   # or
   yarn build
   ```

3. Test the production build locally:
   ```bash
   npm run preview
   # or
   yarn preview
   ```

## Deployment Options

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy using default settings for Vite projects

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command to `npm run build` or `yarn build`
3. Set publish directory to `dist`
4. Configure environment variables in the Netlify dashboard

### Manual Deployment

1. Build the application as described above
2. Upload the contents of the `dist` directory to your web server
3. Configure your web server to serve the `index.html` file for all routes (SPA configuration)

## Database Migration

Ensure your Supabase database schema is properly set up with the required tables:

- `projects`
- `tasks`
- `ai_usage`

See the database schema documentation for details on the required fields.

## Post-Deployment Checklist

- [ ] Verify all environment variables are properly set
- [ ] Test user authentication flow
- [ ] Test project creation (with and without AI)
- [ ] Verify AI usage limits are working correctly
- [ ] Check mobile responsiveness
- [ ] Test dark/light theme switching

## Troubleshooting

### API Keys Not Working

- Verify environment variables are properly set in your deployment platform
- Check that variable naming follows the correct format (`VITE_` prefix)
- Confirm API keys have the proper permissions

### Database Connection Issues

- Verify Supabase connection settings
- Check if IP restrictions are blocking your deployment server
- Confirm database schema matches the expected structure

### AI Features Not Working

- Check OpenAI API key is valid and has sufficient credits
- Verify network connectivity between your deployment and OpenAI servers
- Check rate limiting policies if usage is high

## Monitoring and Maintenance

- Set up error tracking (Sentry, LogRocket, etc.)
- Configure uptime monitoring
- Plan for regular updates and dependency maintenance
- Monitor API usage to avoid unexpected costs

For additional support, contact the development team. 