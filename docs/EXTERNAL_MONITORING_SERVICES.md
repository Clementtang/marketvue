# External Monitoring Services Research

> Research Date: 2025-12-12
> Purpose: Find free external monitoring services to keep Render Free Tier backend alive

---

## Executive Summary

Researched 12+ free external monitoring services to solve the keep-alive issue for Render Free Tier backend (which sleeps after 15 minutes of inactivity).

**Key Finding**: UptimeRobot free tier uses **HEAD requests**, not GET.

**Top Recommendation**: **HetrixTools** - 15 monitors, 1-minute intervals, full GET support, completely free.

---

## Background: The Problem

### Render Free Tier Behavior

- Spins down after **15 minutes of inactivity**
- Cold start takes **30-60 seconds**
- 750 free instance hours per month

### Browser Limitations for Frontend Keep-Alive

- **Chrome throttles timers** in background tabs to ≤1 execution per minute after 5 minutes
- **Tab freezing** stops all JavaScript execution after extended background time
- **Mac screen lock** further reduces timer reliability
- **Cannot be fully solved with frontend code alone**

### Solution

Use external monitoring service to ping backend health endpoint every 5-10 minutes.

---

## Top 5 Recommended Services

### 🏆 1. HetrixTools (RECOMMENDED)

**URL**: https://hetrixtools.com

**Free Tier**:

- ✅ **15 monitors**
- ✅ **1-minute check intervals** (fastest among traditional monitors)
- ✅ 12 global monitoring locations
- ✅ SSL certificate monitoring
- ✅ Domain expiration monitoring
- ✅ Public status pages

**GET Support**: ✅ **YES** - Full HTTP/HTTPS support

**Reliability**: ⭐⭐⭐⭐⭐ (15+ years in operation)

**Setup Steps**:

1. Go to https://hetrixtools.com
2. Sign up (email, no credit card required)
3. Navigate to "Uptime Monitor" → "Add monitor"
4. Select "Website Monitor"
5. Enter URL: `https://marketvue-api.onrender.com/api/v1/health`
6. Choose accepted HTTP codes (default: 200)
7. Set alert contacts
8. Save monitor

**Why Best**: Professional 1-minute monitoring completely free, proven reliability, no GET restrictions.

---

### 🥇 2. Exit1.dev

**URL**: https://exit1.dev

**Free Tier**:

- ✅ **Unlimited monitors**
- ✅ **30-second to 1-minute intervals** (fastest free tier)
- ✅ Full API and webhook access
- ✅ SSL auto-checks

**GET Support**: ✅ **YES**

**Reliability**: ⭐⭐⭐⭐⭐ (newer but excellent reviews)

**Setup**: Similar to HetrixTools, very straightforward

**Why Notable**: Most generous free tier with unlimited monitors.

---

### 🥈 3. Freshping (by Freshworks)

**URL**: https://app.freshping.io

**Free Tier**:

- ✅ **50 monitors**
- ✅ **1-minute intervals**
- ✅ 10 global locations
- ✅ 5 public status pages
- ✅ Email, Slack, webhook integrations

**GET Support**: ✅ **YES** - with custom headers

**Reliability**: ⭐⭐⭐⭐⭐ (backed by Freshworks)

**Why Notable**: Most monitors (50) at 1-minute intervals, low false-positive rate.

---

### 🥉 4. cron-job.org

**URL**: https://cron-job.org

**Free Tier**:

- ✅ **Unlimited cron jobs** (with rate limits: 60 executions/hour per job)
- ✅ **Flexible scheduling** (every minute to once per year)
- ✅ Full HTTP method support (GET, POST, PUT, DELETE, etc.)
- ✅ Custom headers and request body
- ✅ 30-second timeout per execution

**GET Support**: ✅ **YES** - Full HTTP support

**Reliability**: ⭐⭐⭐⭐⭐ (15+ years, open-source, privacy-focused)

**Setup Steps**:

1. Visit https://cron-job.org
2. Create account
3. Click "Create Cronjob"
4. Enter URL: `https://marketvue-api.onrender.com/api/v1/health`
5. Set schedule: `*/5 * * * *` (every 5 minutes)
6. Choose HTTP method: GET
7. Enable failure notifications
8. Save

**Why Notable**: Most flexible scheduling control, supports all HTTP methods.

---

### ⭐ 5. Cloudflare Workers Cron Triggers

**URL**: https://workers.cloudflare.com

**Free Tier**:

- ✅ **100,000 requests/day** (all Workers combined)
- ✅ **3 cron triggers per Worker**
- ✅ Global edge network execution
- ✅ No cold starts

**GET Support**: ✅ **YES** - Full fetch API support

**Reliability**: ⭐⭐⭐⭐⭐ (enterprise-grade)

**Setup Complexity**: Medium (requires coding)

**Setup Steps**:

1. Install Wrangler CLI: `npm install -g wrangler`
2. Login: `wrangler login`
3. Create Worker: `wrangler init render-keepalive`
4. Edit `wrangler.toml`:

```toml
name = "render-keepalive"
main = "src/index.js"

[triggers]
crons = ["*/10 * * * *"]  # Every 10 minutes
```

5. Edit `src/index.js`:

```javascript
export default {
  async scheduled(event, env, ctx) {
    await fetch("https://marketvue-api.onrender.com/api/v1/health");
  },
};
```

6. Deploy: `wrangler deploy`

**Why Notable**: Enterprise infrastructure, full control, no cold starts.

---

## UptimeRobot Issue

**URL**: https://uptimerobot.com

**Free Tier**:

- 50 monitors
- 5-minute intervals
- ⚠️ **HEAD requests only** (not GET!)

**GET Support**: ❌ **NO** - Free tier uses HEAD, GET requires Pro plan ($7/month)

**Workaround**: Use "Keyword Monitor" instead of "HTTP Monitor" (keyword monitors use GET requests)

**Verdict**: Popular but limited for our use case due to HEAD-only restriction.

---

## Additional Services Evaluated

| Service        | Monitors      | Interval | GET Support | Rating     | Notes                         |
| -------------- | ------------- | -------- | ----------- | ---------- | ----------------------------- |
| Better Stack   | 10            | 3 min    | ✅ Yes      | ⭐⭐⭐⭐⭐ | Modern UX, rich error context |
| StatusCake     | 10            | 5 min    | ✅ Yes      | ⭐⭐⭐⭐   | "Free for life" promise       |
| GitHub Actions | Unlimited\*   | 5 min+   | ✅ Yes      | ⭐⭐⭐⭐   | Free for public repos         |
| Vercel Cron    | Unlimited\*\* | Any      | ✅ Yes      | ⭐⭐⭐⭐   | For Vercel users              |
| Cronitor       | 5             | Varies   | ✅ Yes      | ⭐⭐⭐     | Very limited free tier        |
| Pingdom        | None          | N/A      | N/A         | N/A        | No free tier (trial only)     |

\*Unlimited for public repositories, 2000 min/month for private
\*\*Subject to function invocation quotas

---

## Recommended Setup for MarketVue

### Option A: Single Service (Simplest)

**Use HetrixTools alone**:

- Set up one monitor for `/api/v1/health`
- 1-minute interval (keeps backend awake reliably)
- Email alerts on downtime
- Zero maintenance required

### Option B: Dual Redundancy (Maximum Reliability)

**Primary: HetrixTools** (every 1 minute)
**Backup: cron-job.org** (every 5 minutes)

This ensures if one service has issues, the other keeps the backend alive.

### Option C: Developer-Focused

**Use Cloudflare Workers**:

- Full control over logic
- Can add logging, metrics, etc.
- Enterprise-grade infrastructure
- Requires coding but most flexible

---

## Optimal Ping Strategy

### For Render Free Tier:

- **Interval**: 5-10 minutes (recommended: 5 minutes for safety margin)
- **Endpoint**: `/api/v1/health` (lightweight, simple response)
- **Expected result**: HTTP 200 with JSON response

### Calculation:

- Render provides **750 hours/month**
- Keeping service alive 24/7 = ~744 hours/month
- **Fits within free tier limits**

### Ethical Considerations:

- Render's free tier is primarily for evaluation/development
- For production apps serving real users, consider upgrading to paid tier ($7/month)
- Using external monitoring for development/staging is acceptable
- If generating revenue, support the infrastructure you depend on

---

## Implementation Status

### Current State (as of 2025-01-27):

- ✅ External monitoring configured: **UptimeRobot**
  - Monitor URL: `https://marketvue-api.onrender.com/api/v1/health`
  - Interval: 5 minutes (free tier)
  - Using "Keyword Monitor" type (sends GET requests, not HEAD)
- ❌ Frontend keep-alive removed (v1.9.0) - replaced by external monitoring

### Frontend vs External Monitoring:

**Frontend Keep-Alive Pros**:

- No external service dependency
- User can control
- Works when page is open

**Frontend Keep-Alive Cons**:

- ❌ Unreliable due to browser throttling
- ❌ Doesn't work when all tabs closed
- ❌ Fails during Mac screen lock
- ❌ Not 100% reliable

**External Service Pros**:

- ✅ 100% reliable
- ✅ Works 24/7 even with all tabs closed
- ✅ Professional monitoring with alerts
- ✅ No browser limitations

**External Service Cons**:

- Requires external service signup
- Less user control
- Dependency on third party

### Recommendation:

If using external monitoring (HetrixTools), consider:

1. **Keep frontend feature** as backup/fallback
2. **Remove frontend feature** entirely (cleaner, less confusing)
3. **Update UI** to recommend external service

This decision is pending based on project requirements.

---

## Quick Start Commands

### Deploy HetrixTools (Recommended):

```
1. Visit: https://hetrixtools.com
2. Sign up (email only, no credit card)
3. Add Website Monitor
4. URL: https://marketvue-api.onrender.com/api/v1/health
5. Done - backend stays alive 24/7
```

### Deploy cron-job.org:

```
1. Visit: https://cron-job.org
2. Create account
3. Create Cronjob
4. URL: https://marketvue-api.onrender.com/api/v1/health
5. Schedule: */5 * * * * (every 5 minutes)
6. Save
```

### Deploy Cloudflare Workers (Advanced):

```bash
npm install -g wrangler
wrangler login
wrangler init render-keepalive
# Edit wrangler.toml and src/index.js (see setup above)
wrangler deploy
```

---

## Testing External Monitoring

### Verify Setup:

1. Configure external service
2. Wait 20 minutes
3. Check Render dashboard - service should show as active
4. Access MarketVue - should load immediately (no cold start)
5. Monitor for 24 hours to confirm reliability

### Monitor 750-Hour Limit:

- Check Render dashboard monthly
- If approaching limit, consider:
  - Reducing ping frequency (e.g., 10-minute intervals)
  - Upgrading to paid tier
  - Accepting some downtime during off-peak hours

---

## Resources

- **HetrixTools Documentation**: https://docs.hetrixtools.com
- **cron-job.org Help**: https://cron-job.org/en/documentation/
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Render Free Tier Limits**: https://docs.render.com/free

---

## Changelog

- **2025-01-27**: Implementation update
  - Configured UptimeRobot as the monitoring service
  - Using "Keyword Monitor" type to send GET requests (workaround for HEAD-only limitation)
  - Monitor URL: `https://marketvue-api.onrender.com/api/v1/health`
  - Interval: 5 minutes
- **2025-12-12**: Initial research completed
  - Evaluated 12+ services
  - Identified UptimeRobot GET limitation
  - Recommended HetrixTools as top choice
  - Documented setup procedures
