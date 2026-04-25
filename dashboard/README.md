# SafeSnap — Parent Dashboard

React 18 + TypeScript parent dashboard for the SafeSnap parental control system.

**Live:** https://safesnap.vercel.app

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS (neumorphism design system) |
| State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Real-time | WebSocket (Spring Boot backend) |
| Routing | React Router v6 |

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm test
```

Point at the live backend by setting the environment variable:

```bash
# .env.local
VITE_API_BASE_URL=https://safesnap-backend.onrender.com
VITE_WS_URL=wss://safesnap-backend.onrender.com/ws/alerts
```

Or leave blank to use a local backend at `http://localhost:8080`.

## Deployment

Deployed to Vercel. Every push to `main` triggers a redeploy automatically.
The `vercel.json` rewrite rule (`/* → /index.html`) handles client-side routing.
