# SafeSnap — Backend API

Spring Boot 3 REST API + WebSocket server for the SafeSnap parental control system.

**Live:** https://safesnap-backend.onrender.com  
**Health:** https://safesnap-backend.onrender.com/health

## Stack

| | |
|---|---|
| Runtime | Java 17 |
| Framework | Spring Boot 3 |
| Auth | JWT (15 min access / 7 day refresh via Redis) |
| Database | PostgreSQL (Neon) + Flyway migrations |
| Cache / sessions | Redis (Upstash) |
| Real-time | WebSocket (STOMP) |
| Build | Maven |

## Key endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Uptime check — returns `{"status":"UP"}` |
| `POST` | `/api/v1/auth/register-parent` | None | Create parent account |
| `POST` | `/api/v1/auth/login` | None | Login, returns JWT pair |
| `POST` | `/api/v1/auth/refresh` | None | Rotate access token |
| `POST` | `/api/v1/alerts/report` | Child JWT | Report a flagged image (metadata only) |
| `GET` | `/api/v1/alerts/list` | Parent JWT | List alerts with pagination |
| `POST` | `/api/v1/alerts/acknowledge` | Parent JWT | Acknowledge an alert |
| `GET` | `/api/v1/children` | Parent JWT | List paired child devices |
| `POST` | `/api/v1/auth/pair-child` | None | Pair a child device via token |
| `GET` | `/api/v1/stats/weekly` | Parent JWT | Weekly scan stats |
| `WS` | `/ws/alerts` | JWT query param | Real-time alert push |

## Development

```bash
# Requires Java 17+ and a running PostgreSQL + Redis instance
cp ../.env.example .env
mvn spring-boot:run

# Run tests
mvn test
```

## Deployment

Deployed to Render (free tier). The free tier sleeps after 15 min of inactivity —
UptimeRobot pings `/health` every 10 minutes to keep it warm.
