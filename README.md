# MERN Todo — B&W Minimal

## Structure
```
server/   Express + Mongoose API (/api/todos, full CRUD)
client/   React + Vite frontend
```

## 1. Local run

**DB**: create a free MongoDB Atlas cluster (see step 2) — do this first, you need a URI even locally.

```bash
cd server
cp .env.example .env      # paste your Atlas URI into MONGO_URI
npm install
npm run dev                # http://localhost:5000
```

```bash
cd client
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm install
npm run dev                # http://localhost:5173
```

## 2. MongoDB Atlas (free tier)
1. https://cloud.mongodb.com → create a free M0 cluster.
2. Database Access → add a user + password (not your Atlas login).
3. Network Access → Add IP → `0.0.0.0/0` (allow from anywhere — required since Render's IPs aren't static).
4. Connect → Drivers → copy the URI, replace `<password>` and add a db name: 
   `mongodb+srv://user:pass@cluster.mongodb.net/todoapp`

## 3. Deploy backend — Render
1. Push this repo to GitHub.
2. https://render.com → New → Web Service → connect the repo.
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment → add `MONGO_URI` (your Atlas URI). Don't set `PORT` — Render injects it.
7. Deploy. Note the URL, e.g. `https://todo-api-xxxx.onrender.com`.

Free tier spins down after 15 min idle — first request after that takes ~30s to wake up.

## 4. Deploy frontend — Vercel
1. https://vercel.com → New Project → same repo.
2. Root Directory: `client`
3. Framework Preset: Vite (auto-detected).
4. Environment Variables → `VITE_API_URL` = your Render backend URL from step 3 (no trailing slash).
5. Deploy.

## 5. Fix CORS after deploy
In `server/app.js`, `cors()` currently allows all origins — fine for this project. If you want to lock it down:
```js
app.use(cors({ origin: "https://your-vercel-url.vercel.app" }));
```
Redeploy the backend after changing.

## Done
Vercel URL is your live app. Every push to the connected GitHub branch auto-redeploys both services.
