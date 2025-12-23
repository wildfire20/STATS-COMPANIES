# Railway Deployment Guide for STATS Companies Website

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code needs to be pushed to GitHub
3. **Resend Account**: For email notifications (get API key from [resend.com](https://resend.com))

---

## Step-by-Step Deployment

### Step 1: Push Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/stats-companies.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a database and generate the `DATABASE_URL` variable

### Step 4: Configure Environment Variables

Click on your service (not the database), then go to **"Variables"** tab and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets production mode |
| `SESSION_SECRET` | `(generate random string)` | Session encryption key |
| `RESEND_API_KEY` | `re_xxxxx` | Your Resend API key for emails |

**To generate a secure SESSION_SECRET**, you can use:
```bash
openssl rand -base64 32
```
Or use any password generator to create a 32+ character random string.

**Note**: `DATABASE_URL` and `PORT` are automatically set by Railway.

### Step 5: Link Database to Service

1. Click on your web service
2. Go to **"Variables"** tab
3. Click **"Add Variable"**
4. In the value field, type `${{Postgres.DATABASE_URL}}`
5. Name it `DATABASE_URL`

This links your database to your service using Railway's variable reference system.

### Step 6: Deploy

Railway will automatically:
1. Detect Node.js project
2. Run `npm ci` (install dependencies)
3. Run `npm run build` (build the app)
4. Run `npm run start` (start the server)

### Step 7: Generate Public URL

1. Click on your service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Your site will be live at `https://your-app.up.railway.app`

---

## Important Configuration Files

These files are already set up in your project:

- **`railway.json`** - Railway deployment configuration
- **`nixpacks.toml`** - Build configuration for Railway's Nixpacks builder
- **`Procfile`** - Specifies the start command

---

## Image Uploads (Important!)

This app uses **Replit Object Storage** for image uploads which won't work on Railway. You have two options:

### Option A: Use Local Storage (Simpler)
Images will be stored on Railway's ephemeral filesystem. They may be lost on redeployments.

### Option B: Add Cloud Storage (Recommended for Production)
Set up one of these services:
- **Cloudinary** - Easy to set up, generous free tier
- **AWS S3** - More complex but industry standard
- **UploadThing** - Simple file uploads

You'll need to modify `server/objectStorage.ts` to use your chosen provider.

---

## Custom Domain (Optional)

1. Go to **Settings** → **Networking** → **Custom Domain**
2. Enter your domain (e.g., `statscompanies.co.za`)
3. Add the CNAME record to your DNS:
   - **Type**: CNAME
   - **Name**: @ or www
   - **Value**: `your-app.up.railway.app`

---

## Monitoring & Logs

- View logs: Click on your service → **"Logs"** tab
- Health check endpoint: `/api/health`
- Railway provides automatic crash recovery

---

## Troubleshooting

### Build Fails
- Check the build logs for specific errors
- Ensure all dependencies are in `package.json`

### Database Connection Issues
- Verify `DATABASE_URL` is properly linked
- Check if PostgreSQL service is running

### App Crashes on Start
- Check logs for error messages
- Ensure `PORT` environment variable is being used

### Email Not Working
- Verify `RESEND_API_KEY` is set correctly
- For non-verified domains, emails only go to verified addresses

---

## Admin Access

After deployment, access the admin panel at:
- **URL**: `https://your-app.up.railway.app/login`
- **Email**: `admin@statscompanies.co.za`
- **Password**: `Admin@123`

**Important**: Change the admin password after first login!

---

## Costs

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month credit (usually enough for small sites)
- **Pay as you go**: ~$0.000463/minute for compute + database costs
- **PostgreSQL**: ~$5-10/month for small databases

Monitor your usage in the Railway dashboard.

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables configured:
  - [ ] `DATABASE_URL` linked to Postgres
  - [ ] `NODE_ENV` = `production`
  - [ ] `SESSION_SECRET` set
  - [ ] `RESEND_API_KEY` set (for emails)
- [ ] Public domain generated
- [ ] Test the site is working
- [ ] Change admin password
