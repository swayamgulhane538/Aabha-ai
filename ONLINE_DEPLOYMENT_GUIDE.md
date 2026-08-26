# 🌐 Aabha AI — 100% Online Deployment Guide

Aabha AI is fully configured for **1-click online deployment** on Vercel, Netlify, Render, or Railway.

---

## ⚡ Option 1: Deploy on Vercel (Recommended for Frontend / Full App)
1. Go to **[vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. Click **"Add New Project"** and select repository: `swayamgulhane538/Aabha-ai`.
3. Vercel will automatically detect `vercel.json` and settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or `frontend`)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
4. Click **Deploy**!
5. Your app is live at `https://your-project.vercel.app` 🎉

---

## 🚀 Option 2: Deploy on Render (Full-Stack Backend + Frontend in One URL)
1. Go to **[render.com](https://render.com)** and create a new **Web Service**.
2. Connect your GitHub repository: `https://github.com/swayamgulhane538/Aabha-ai.git`.
3. Configure the build settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: `your-gemini-api-key`
   - `PORT`: `3001`
5. Click **Create Web Service**! Render will build both backend and frontend and serve everything under one live URL (e.g. `https://aabha-ai.onrender.com`).

---

## 🌈 Option 3: Deploy on Netlify
1. Go to **[netlify.com](https://netlify.com)** and click **"Add new site" ➔ "Import an existing project"**.
2. Select `swayamgulhane538/Aabha-ai`.
3. Set:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy Site**!

---

## 🔑 Activating Google Gemini Online
Once your site is live online, simply:
1. Open the **Aabha Chat** page.
2. Click **`🔑 Enter Gemini Key`** at the top right.
3. Paste your free Google Gemini API Key from **[Google AI Studio](https://aistudio.google.com/app/apikey)** and click **Test & Connect**.
4. Gemini is immediately active for all online users without any backend configuration!
