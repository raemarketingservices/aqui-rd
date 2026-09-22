# Deploy UNIKO-RD to Coolify

## Prerequisites
- Coolify installed on your VPS (Contabo)
- GitHub repository connected
- Supabase project configured
- Domain configured

## Deployment Steps

### 1. Connect Repository in Coolify
1. Go to Coolify Dashboard
2. Click "New Resource" → "Docker Compose"
3. Connect your GitHub repository: `raemarketingservices/aqui-rd`
4. Select Branch: `main`

### 2. Configure Environment Variables
Set these in Coolify:
```
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Configure Domain
1. In Coolify, go to your service → Domains
2. Add your domain: `unikord.com`
3. Enable SSL (Let's Encrypt)
4. Set up reverse proxy

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Check logs if needed
4. Access your site at your domain

## File Structure
- `Dockerfile` - Multi-stage build for production
- `nginx.conf` - Nginx configuration with SPA routing
- `docker-compose.yml` - Docker Compose configuration
- `.env.example` - Example environment variables
- `.dockerignore` - Files to exclude from build

## Troubleshooting
- Check logs in Coolify dashboard
- Ensure environment variables are set correctly
- Verify Supabase URL and keys
- Check API endpoint connectivity
