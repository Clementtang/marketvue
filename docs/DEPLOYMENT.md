# MarketVue 部署指南 / Deployment Guide

[English](#english) | [繁體中文](#繁體中文)

---

## English

### Deployment Architecture

```
Frontend (Vercel)          Backend (Render)
marketvue.vercel.app  →   marketvue-api.onrender.com
```

### Prerequisites

- GitHub account
- Vercel account (sign up with GitHub)
- Render account (sign up with GitHub)

---

## Backend Deployment (Render)

### Step 1: Create Render Service

1. Go to https://render.com/ and sign in with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repository `marketvue`
4. Configure the service:
   - **Name**: `marketvue-api` (or any name you prefer)
   - **Region**: Choose closest to your users (Singapore recommended for Asia)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - **Health Check Path**: `/api/health` (important for deployment reliability)

### Step 2: Set Environment Variables

In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `FLASK_ENV` | `production` |
| `CORS_ORIGINS` | `https://marketvue.vercel.app` (update after deploying frontend) |

### Step 3: Deploy

Click **Create Web Service** and wait for deployment (3-5 minutes).

Your backend URL will be: `https://marketvue-api.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to https://vercel.com/ and sign in with GitHub
2. Click **Add New...** → **Project**
3. Import your GitHub repository `marketvue`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Set Environment Variables

In Vercel project settings → Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://marketvue-api.onrender.com/api` (use your Render URL) |

### Step 3: Deploy

Click **Deploy** and wait (1-2 minutes).

Your frontend URL will be: `https://marketvue.vercel.app`

### Step 4: Update Backend CORS

Go back to Render and update the `CORS_ORIGINS` environment variable with your Vercel URL:

```
CORS_ORIGINS=https://marketvue.vercel.app
```

Then redeploy the backend service.

---

## Testing Deployment

1. Visit your Vercel URL: `https://marketvue.vercel.app`
2. Try adding a stock (e.g., `AAPL`)
3. Verify data loads correctly
4. Test theme switching and language selection

---

## Troubleshooting

### Backend shows "Application Error"
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `gunicorn` is in requirements.txt

### Frontend can't load stock data
- Check browser console for CORS errors
- Verify `VITE_API_URL` points to correct Render URL
- Ensure backend `CORS_ORIGINS` includes Vercel URL

### Backend sleeps (Free Plan)
- Render free plan sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan for production use

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

---

## Continuous Deployment

Both Vercel and Render are configured for automatic deployment:

- Push to `main` branch → Auto-deploys to production
- Create PR → Vercel creates preview deployment
- Merge PR → Auto-deploys to production

---

## 繁體中文

### 部署架構

```
前端 (Vercel)              後端 (Render)
marketvue.vercel.app  →   marketvue-api.onrender.com
```

### 前置需求

- GitHub 帳號
- Vercel 帳號（使用 GitHub 登入）
- Render 帳號（使用 GitHub 登入）

---

## 後端部署 (Render)

### 步驟 1：建立 Render Service

1. 前往 https://render.com/ 並使用 GitHub 登入
2. 點擊 **New +** → **Web Service**
3. 連接你的 GitHub repository `marketvue`
4. 配置服務：
   - **Name**: `marketvue-api`（或任何你喜歡的名稱）
   - **Region**: 選擇最接近使用者的區域（亞洲用戶建議選擇 Singapore）
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - **Health Check Path**: `/api/health`（對部署可靠性很重要）

### 步驟 2：設定環境變數

在 Render 控制台中，添加以下環境變數：

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `FLASK_ENV` | `production` |
| `CORS_ORIGINS` | `https://marketvue.vercel.app`（部署前端後更新） |

### 步驟 3：部署

點擊 **Create Web Service** 並等待部署完成（3-5 分鐘）。

你的後端網址將會是：`https://marketvue-api.onrender.com`

---

## 前端部署 (Vercel)

### 步驟 1：建立 Vercel 專案

1. 前往 https://vercel.com/ 並使用 GitHub 登入
2. 點擊 **Add New...** → **Project**
3. Import 你的 GitHub repository `marketvue`
4. 配置專案：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`（根目錄）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 步驟 2：設定環境變數

在 Vercel 專案設定 → Environment Variables：

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://marketvue-api.onrender.com/api`（使用你的 Render URL） |

### 步驟 3：部署

點擊 **Deploy** 並等待（1-2 分鐘）。

你的前端網址將會是：`https://marketvue.vercel.app`

### 步驟 4：更新後端 CORS

回到 Render 並更新 `CORS_ORIGINS` 環境變數為你的 Vercel URL：

```
CORS_ORIGINS=https://marketvue.vercel.app
```

然後重新部署後端服務。

---

## 測試部署

1. 訪問你的 Vercel URL：`https://marketvue.vercel.app`
2. 嘗試新增股票（例如：`AAPL`）
3. 驗證資料正確載入
4. 測試主題切換和語言選擇

---

## 疑難排解

### 後端顯示 "Application Error"
- 檢查 Render logs 查看錯誤
- 驗證所有環境變數都已設定
- 確保 `gunicorn` 在 requirements.txt 中

### 前端無法載入股票資料
- 檢查瀏覽器 console 是否有 CORS 錯誤
- 驗證 `VITE_API_URL` 指向正確的 Render URL
- 確保後端 `CORS_ORIGINS` 包含 Vercel URL

### 後端休眠（免費方案）
- Render 免費方案在 15 分鐘無活動後會休眠
- 休眠後首次請求需要 30-60 秒喚醒
- 正式環境建議升級到付費方案

---

## 自訂網域（選擇性）

### Vercel
1. 前往 Project Settings → Domains
2. 添加你的自訂網域
3. 依照 DNS 配置指示操作

### Render
1. 前往 Service Settings → Custom Domain
2. 添加你的自訂網域
3. 依照指示更新 DNS 記錄

---

## 持續部署

Vercel 和 Render 都已配置自動部署：

- 推送到 `main` 分支 → 自動部署到正式環境
- 建立 PR → Vercel 建立預覽部署
- 合併 PR → 自動部署到正式環境

---

## 成本估算

| 服務 | 方案 | 成本 |
|------|------|------|
| Vercel | Hobby (免費) | $0/月 |
| Render | Free | $0/月 |
| **總計** | | **$0/月** |

### 免費方案限制
- **Render Free**: 15 分鐘無活動後休眠，每月 750 小時免費
- **Vercel Hobby**: 100GB 流量/月，無商業使用

### 升級選項（如需要）
- **Render Starter**: $7/月（無休眠，512MB RAM）
- **Vercel Pro**: $20/月（更多流量，優先支援）

---

## Redis Cache Configuration (Optional)

MarketVue supports Redis cache for improved performance in production environments.

### Environment Variables for Redis

| Key | Value | Description |
|-----|-------|-------------|
| `CACHE_TYPE` | `redis` | Enable Redis cache |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL |
| `CACHE_KEY_PREFIX` | `marketvue:` | Cache key prefix |
| `CACHE_DEFAULT_TIMEOUT` | `300` | Default cache timeout (seconds) |

### Using Render Redis Add-on

1. Go to your Render service dashboard
2. Click **Add-ons** → **Redis**
3. Select plan (Free tier available)
4. Render automatically sets `REDIS_URL` environment variable
5. Update your service to use Redis:
   ```
   CACHE_TYPE=redis
   CACHE_KEY_PREFIX=marketvue:
   ```

### Fallback Behavior

If Redis connection fails, the application automatically falls back to SimpleCache (in-memory cache). This ensures the application remains functional even if Redis is unavailable.

---

## Docker Deployment (Local/Self-hosted)

MarketVue provides Docker Compose configuration for easy local development and self-hosted deployments.

### Quick Start

```bash
# Start backend with Redis
docker-compose up -d redis backend

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Available Services

| Service | Port | Description |
|---------|------|-------------|
| `redis` | 6379 | Redis cache server |
| `backend` | 5001 | Flask API server |
| `frontend` | 5173 | Vite dev server (optional) |

### Environment Configuration

Create a `.env` file in the project root:

```env
# Backend
FLASK_ENV=development
CACHE_TYPE=redis
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:5001
```

### Production with Docker

For production deployments:

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run with production settings
docker-compose up -d
```

### Docker Volume Management

```bash
# View volumes
docker volume ls

# Remove data (fresh start)
docker-compose down -v
```

---

## Redis 快取配置（選擇性）

MarketVue 支援 Redis 快取以提升生產環境效能。

### Redis 環境變數

| Key | Value | 描述 |
|-----|-------|------|
| `CACHE_TYPE` | `redis` | 啟用 Redis 快取 |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis 連接 URL |
| `CACHE_KEY_PREFIX` | `marketvue:` | 快取鍵前綴 |
| `CACHE_DEFAULT_TIMEOUT` | `300` | 預設快取時間（秒） |

### 使用 Render Redis 附加服務

1. 進入 Render 服務控制台
2. 點擊 **Add-ons** → **Redis**
3. 選擇方案（有免費方案）
4. Render 會自動設定 `REDIS_URL` 環境變數
5. 更新服務使用 Redis：
   ```
   CACHE_TYPE=redis
   CACHE_KEY_PREFIX=marketvue:
   ```

### 降級行為

如果 Redis 連接失敗，應用程式會自動降級到 SimpleCache（記憶體快取）。這確保即使 Redis 不可用，應用程式仍然可以正常運作。

---

## Docker 部署（本地/自託管）

MarketVue 提供 Docker Compose 配置，方便本地開發和自託管部署。

### 快速開始

```bash
# 啟動後端和 Redis
docker-compose up -d redis backend

# 查看日誌
docker-compose logs -f backend

# 停止服務
docker-compose down
```

### 可用服務

| 服務 | 端口 | 描述 |
|------|------|------|
| `redis` | 6379 | Redis 快取伺服器 |
| `backend` | 5001 | Flask API 伺服器 |
| `frontend` | 5173 | Vite 開發伺服器（選擇性） |

### 環境配置

在專案根目錄建立 `.env` 檔案：

```env
# 後端
FLASK_ENV=development
CACHE_TYPE=redis
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=http://localhost:5173

# 前端
VITE_API_BASE_URL=http://localhost:5001
```
