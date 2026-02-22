# Ngrok Setup Guide for TrueTorq

This guide will help you set up ngrok to make your TrueTorq application accessible from outside your local network.

## Prerequisites

1. **Ngrok Account** (Free tier is sufficient)
   - Sign up at: https://dashboard.ngrok.com/signup
   - Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

## Step 1: Configure Ngrok Authtoken

Run this command (replace `YOUR_AUTH_TOKEN` with your actual token):

```bash
npx ngrok config add-authtoken YOUR_AUTH_TOKEN
```

Or if you have ngrok installed globally:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## Step 2: Start Your Servers

### Terminal 1 - Backend Server
```bash
npm run server
```

### Terminal 2 - Frontend Server
```bash
npm run dev
```

## Step 3: Start Ngrok Tunnels

### Terminal 3 - Ngrok Backend Tunnel
```bash
npm run ngrok:backend
```

**Important:** Copy the HTTPS URL shown (e.g., `https://abc123.ngrok.io`). This is your backend ngrok URL.

### Terminal 4 - Ngrok Frontend Tunnel
```bash
npm run ngrok:frontend
```

Copy the HTTPS URL shown (e.g., `https://xyz789.ngrok.io`). This is your frontend ngrok URL.

## Step 4: Configure Frontend to Use Ngrok Backend

After starting the backend ngrok tunnel, you need to tell the frontend where to find the backend.

### Option A: Using Environment Variable (Recommended)

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=https://your-backend-ngrok-url.ngrok.io
```

Replace `your-backend-ngrok-url.ngrok.io` with the actual backend ngrok URL from Terminal 3.

Then restart the frontend server (Terminal 2):
- Stop it (Ctrl+C)
- Run `npm run dev` again

### Option B: Using PowerShell (Temporary)

```powershell
$env:VITE_API_URL="https://your-backend-ngrok-url.ngrok.io"; npm run dev
```

## Step 5: Access Your Application

1. **From the same network:** Use your local IP addresses
   - Frontend: `http://YOUR_LOCAL_IP:7000`
   - Backend: `http://YOUR_LOCAL_IP:5000`

2. **From outside the network:** Use ngrok URLs
   - Frontend: `https://your-frontend-ngrok-url.ngrok.io`
   - The frontend will automatically connect to the backend using the ngrok URL you configured

## Troubleshooting

### Issue: Frontend can't connect to backend
- Make sure you've set `VITE_API_URL` in `.env.local` to your backend ngrok URL
- Restart the frontend server after setting the environment variable
- Check that both ngrok tunnels are running

### Issue: CORS errors
- The backend is already configured with CORS enabled
- If you still see CORS errors, make sure the frontend ngrok URL is allowed

### Issue: Ngrok tunnel disconnects
- Free ngrok tunnels may disconnect after inactivity
- The URL will change each time you restart ngrok (unless you have a paid plan)
- Update `.env.local` with the new backend URL if it changes

### Issue: "ngrok: command not found"
- Make sure you've installed ngrok: `npm install --save-dev ngrok`
- Or install globally: `npm install -g ngrok`

## Quick Reference

| Service | Local URL | Ngrok Command |
|---------|-----------|---------------|
| Frontend | http://localhost:7000 | `npm run ngrok:frontend` |
| Backend | http://localhost:5000 | `npm run ngrok:backend` |

## Notes

- **Free ngrok accounts:** URLs change on each restart
- **Paid ngrok accounts:** Can have static URLs
- **Security:** Never commit `.env.local` to git (it's already in `.gitignore`)
- **HTTPS:** Ngrok provides HTTPS automatically, which is great for testing

## Example Workflow

1. Start backend: `npm run server`
2. Start frontend: `npm run dev`
3. Start backend ngrok: `npm run ngrok:backend` → Copy URL
4. Create `.env.local` with: `VITE_API_URL=<backend-ngrok-url>`
5. Restart frontend: `npm run dev`
6. Start frontend ngrok: `npm run ngrok:frontend` → Copy URL
7. Share frontend ngrok URL with others!

