# Deployment Configuration

> **Important**: Always verify deployment status using MCP before making changes.
> Use `mcp__vercel__get_project` and `mcp__render__get_service` to check current configuration.

Last Updated: 2025-11-21
Last Verified: 2025-11-21 via MCP

---

## Architecture Overview

```
Frontend (Vercel)                    Backend (Render)
┌─────────────────────┐             ┌──────────────────────┐
│ marketvue.vercel.app│────────────>│ marketvue-api        │
│                     │   API calls │ .onrender.com        │
│ - Vite (React)      │             │                      │
│ - Static Assets     │             │ - Flask (Python)     │
│ - Node.js 22.x      │             │ - Gunicorn           │
└─────────────────────┘             └──────────────────────┘
```

---

## Vercel Configuration (Frontend)

**Verified via**: `mcp__vercel__get_project`

### Project Details
- **Project ID**: `prj_rsbQtqLdXJGJIkZXa7uYud603dk5`
- **Team ID**: `team_3hW0eIvgcozexFfsxMd60TNj`
- **Project Name**: `marketvue`
- **Framework**: `vite`
- **Node Version**: `22.x`
- **Created**: 2025-11-03
- **Status**: ✅ READY

### Domains
- Primary: `marketvue.vercel.app`
- Alt 1: `marketvue-clement-tangs-projects.vercel.app`
- Alt 2: `marketvue-git-main-clement-tangs-projects.vercel.app`

### Build Configuration
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Environment Variables (Required)
| Variable | Value | Target |
|----------|-------|--------|
| `VITE_API_URL` | `https://marketvue-api.onrender.com` | Production |

**Note**: The frontend code uses this in `src/config/constants.ts`:
```typescript
BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001'
```

### Deployment Settings
- **Auto Deploy**: ✅ Enabled (on push to `main`)
- **Preview Deployments**: ✅ Enabled (on PR)
- **No Custom vercel.json Required**: The project uses default Vite settings

---

## Render Configuration (Backend)

**Verified via**: `mcp__render__get_service`

### Service Details
- **Service ID**: `srv-d447klili9vc73dt8h1g`
- **Service Name**: `marketvue-api`
- **Owner ID**: `tea-d447j4jipnbc73cq4j20`
- **Type**: `web_service`
- **Created**: 2025-11-03
- **Status**: ✅ not_suspended

### Repository Configuration
- **Repo**: `https://github.com/Clementtang/marketvue`
- **Branch**: `main`
- **Root Directory**: `backend`
- **Auto Deploy**: ✅ Enabled (on commit to `main`)

### Runtime Configuration
- **Environment**: `python`
- **Plan**: `free`
- **Region**: `singapore`
- **Instances**: 1
- **Build Plan**: `starter`

### Build & Start Commands
```bash
# Build Command
pip install -r requirements.txt

# Start Command
gunicorn --bind 0.0.0.0:$PORT app:app
```

### Health Check
- **Path**: `/api/health`
- **Expected Response**: `{"service":"stock-dashboard-api","status":"healthy"}`

### Service URL
- **Production URL**: `https://marketvue-api.onrender.com`
- **SSH Address**: `srv-d447klili9vc73dt8h1g@ssh.singapore.render.com`

### IP Allow List
- **CIDR Block**: `0.0.0.0/0` (everywhere - public access)

---

## MCP Commands Reference

### Check Vercel Status
```bash
# Get project details
mcp__vercel__get_project(
  projectId="prj_rsbQtqLdXJGJIkZXa7uYud603dk5",
  teamId="team_3hW0eIvgcozexFfsxMd60TNj"
)

# List recent deployments
mcp__vercel__list_deployments(
  projectId="prj_rsbQtqLdXJGJIkZXa7uYud603dk5",
  teamId="team_3hW0eIvgcozexFfsxMd60TNj"
)

# Get deployment details
mcp__vercel__get_deployment(
  idOrUrl="<deployment-id>",
  teamId="team_3hW0eIvgcozexFfsxMd60TNj"
)
```

### Check Render Status
```bash
# Get service details
mcp__render__get_service(
  serviceId="srv-d447klili9vc73dt8h1g"
)

# List all services
mcp__render__list_services()

# Check service health (via curl)
curl https://marketvue-api.onrender.com/api/health
```

---

## Troubleshooting Checklist

### Before Making Any Changes

1. ✅ **Verify Vercel Status**
   ```
   Use: mcp__vercel__get_project
   Check: readyState === "READY"
   ```

2. ✅ **Verify Render Status**
   ```
   Use: mcp__render__get_service
   Check: suspended === "not_suspended"
   ```

3. ✅ **Verify Health Endpoint**
   ```
   curl https://marketvue-api.onrender.com/api/health
   Expected: {"service":"stock-dashboard-api","status":"healthy"}
   ```

### Common Mistakes to Avoid

❌ **DON'T**: Try to deploy Python backend on Vercel
- Vercel is for frontend static builds only
- Backend is already on Render

❌ **DON'T**: Create `vercel.json` with Python runtime config
- This will cause deployment errors
- Vite defaults work fine

❌ **DON'T**: Modify `src/config/constants.ts` to use empty BASE_URL
- Always use `import.meta.env.VITE_API_URL`
- Falls back to localhost:5001 for development

✅ **DO**: Use MCP to verify before making changes
✅ **DO**: Check deployment logs if issues occur
✅ **DO**: Test locally before pushing to production

---

## Emergency Recovery

If production is broken, check recent deployments:

```bash
# List recent Vercel deployments
mcp__vercel__list_deployments(...)

# Find last READY deployment and note the commit SHA
# Revert to that commit:
git revert <problematic-commit-sha>
git push origin main
```

---

## Cost & Limits

### Vercel (Free Tier)
- ✅ Bandwidth: 100GB/month
- ✅ Build Time: 6,000 minutes/month
- ✅ Deployments: Unlimited
- ⚠️ No commercial use

### Render (Free Tier)
- ✅ 750 hours/month (enough for 1 service 24/7)
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 512MB RAM
- ⚠️ Shared CPU

---

## Monitoring

### Production URLs
- Frontend: https://marketvue.vercel.app
- Backend API: https://marketvue-api.onrender.com
- Health Check: https://marketvue-api.onrender.com/api/health

### Dashboard Links
- Vercel: https://vercel.com/clement-tangs-projects/marketvue
- Render: https://dashboard.render.com/web/srv-d447klili9vc73dt8h1g
