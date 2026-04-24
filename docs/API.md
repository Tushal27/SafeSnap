# SafeSnap API Specification

**Base URL:** `http://localhost:8080` (dev) / configured via `VITE_API_BASE_URL`  
**Content-Type:** `application/json`  
**Authentication:** `Authorization: Bearer <access_token>` (except auth endpoints)

---

## Authentication

### POST /api/v1/auth/register-parent

Register a new parent account.

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "min8chars"
}
```

**Response 201:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "parentId": "uuid"
}
```

**Errors:** `400` validation failure, `409` email already registered

---

### POST /api/v1/auth/login

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "min8chars"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "parentId": "uuid"
}
```

**Errors:** `401` invalid credentials

---

### POST /api/v1/auth/refresh

Exchange a valid refresh token for a new access token.

**Request:**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:** `401` refresh token expired or invalid

---

### POST /api/v1/auth/pair-child

Generate a pairing token for a child device. Parent must be authenticated.

**Response 200:**
```json
{
  "pairingToken": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": "2024-01-15T14:28:00Z"
}
```

The `pairingToken` is encoded into a QR code displayed on the dashboard. The child app scans the QR and exchanges the token for credentials. The token is single-use and expires in 5 minutes.

---

### POST /api/v1/auth/exchange-pairing-token

Called by the child's app after scanning the QR code.

**Request:**
```json
{
  "pairingToken": "550e8400-e29b-41d4-a716-446655440000",
  "deviceName": "Emma's iPhone",
  "deviceId": "ios-device-uuid"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "childId": "uuid"
}
```

**Errors:** `404` token not found, `410` token expired

---

## Alerts

### POST /api/v1/alerts/report

Report a detected image from the child's device. **Only metadata — never image data.**

**Auth:** Bearer token (child device)

**Request:**
```json
{
  "childDeviceId": "uuid",
  "timestamp": "2024-01-15T14:23:00Z",
  "severityScore": 0.87,
  "imageHash": "a3f8c2d1e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
  "severity": "HIGH"
}
```

`severity` enum values: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

**Response 201:**
```json
{
  "alertId": "uuid",
  "received": true
}
```

A WebSocket push is sent to the parent's dashboard immediately after the alert is persisted.

---

### GET /api/v1/alerts/list

Fetch paginated alerts for a child device.

**Auth:** Bearer token (parent)

**Query params:**
- `childId` (required): UUID of the child device
- `page` (default 0): page number
- `size` (default 20, max 100): page size
- `severity` (optional): filter by severity level
- `acknowledged` (optional): `true` | `false`

**Response 200:**
```json
{
  "content": [
    {
      "id": "uuid",
      "childId": "uuid",
      "timestamp": "2024-01-15T14:23:00Z",
      "severityScore": 0.87,
      "imageHash": "a3f8c2d1...",
      "severity": "HIGH",
      "acknowledged": false,
      "acknowledgedAt": null
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 47,
  "totalPages": 3
}
```

---

### POST /api/v1/alerts/acknowledge

Mark one or more alerts as acknowledged.

**Auth:** Bearer token (parent)

**Request:**
```json
{
  "alertIds": ["uuid1", "uuid2"]
}
```

**Response 200:**
```json
{ "acknowledged": 2 }
```

---

## Children

### GET /api/v1/children

List all paired child devices for the authenticated parent.

**Auth:** Bearer token (parent)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "deviceName": "Emma's iPhone",
    "deviceId": "ios-device-uuid",
    "pairedAt": "2024-01-10T09:00:00Z",
    "lastSeenAt": "2024-01-15T14:20:00Z",
    "isOnline": false,
    "unacknowledgedAlerts": 3
  }
]
```

---

## Stats

### GET /api/v1/stats/weekly

Weekly aggregated safety statistics for a child.

**Auth:** Bearer token (parent)

**Query params:**
- `childId` (required): UUID of the child device
- `weekStart` (optional, ISO date): defaults to start of current week (Monday)

**Response 200:**
```json
{
  "weekStart": "2024-01-15",
  "totalScanned": 423,
  "flaggedCount": 7,
  "byDay": [
    { "date": "2024-01-15", "scanned": 60, "flagged": 1 },
    { "date": "2024-01-16", "scanned": 71, "flagged": 2 }
  ],
  "bySeverity": {
    "LOW": 2,
    "MEDIUM": 3,
    "HIGH": 1,
    "CRITICAL": 1
  }
}
```

---

## WebSocket

### ws://{host}/ws/alerts

Real-time alert push to parent dashboard.

**Connection:** `ws://localhost:8080/ws/alerts?token=<JWT access token>`

**Incoming message (server → client):**
```json
{
  "type": "NEW_ALERT",
  "payload": {
    "id": "uuid",
    "childId": "uuid",
    "timestamp": "2024-01-15T14:23:00Z",
    "severityScore": 0.87,
    "imageHash": "a3f8c2d1...",
    "severity": "HIGH",
    "acknowledged": false,
    "acknowledgedAt": null
  }
}
```

**Connection lifecycle:**
- Server closes the connection if the JWT is invalid or expired
- Client should reconnect with a fresh token after a 401 on the REST API
- Reconnect strategy: exponential backoff starting at 1s, max 30s

---

## Error responses

All errors follow this structure:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: email must be a valid email address",
  "timestamp": "2024-01-15T14:23:00Z",
  "path": "/api/v1/auth/register-parent"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error — check `message` field |
| 401 | Missing or invalid JWT |
| 403 | Valid JWT but wrong role (e.g. child token on parent endpoint) |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 410 | Gone (e.g. pairing token expired) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
