# SafeSnap — Security & Privacy Model

## Core privacy guarantee

SafeSnap makes one unconditional guarantee: **image bytes never leave the child's device**. This is not a configuration option. It is an architectural constraint enforced by the type system across all three codebases.

The backend's `ReportAlertRequest` DTO has no field capable of accepting image data. The Flutter `AlertMetadata` model has no field for it. The React dashboard has no component to display it. The guarantee is structural, not policy-based.

---

## Threat model

### Assets being protected

1. **Child's private photos** — the primary asset; must never leave the device
2. **Parent's account credentials** — email + hashed password in Postgres
3. **Session tokens** — JWT access tokens and refresh tokens
4. **Alert metadata** — timestamps, severity scores, SHA-256 hashes

### Threat actors

| Actor | Capability | Mitigated by |
|-------|-----------|--------------|
| Passive network attacker | Intercept HTTPS traffic | TLS 1.3 (enforced in prod); no HTTP fallback |
| Active MITM attacker | Forge server responses | Certificate pinning (mobile, prod builds) |
| Malicious child app modification | Send image bytes to attacker-controlled server | Images are hashed client-side; the hash is what gets reported. A compromised app could send to a rogue server, but that's a device compromise — outside scope |
| Compromised backend | Access image data | No image data is ever stored or transmitted; backend cannot expose what it never received |
| Stolen refresh token | Impersonate user session | Server-side refresh token storage in Redis; revoke by deleting key |
| Stolen access token | API access for ≤15 min | Short TTL limits blast radius; cannot be revoked but expires quickly |
| Brute-force login | Enumerate passwords | Redis-based rate limiting: 5 attempts per email per 15 min |
| QR pairing replay | Re-use pairing token | Single-use tokens with 5-min TTL, deleted from Redis on first use |

### Out of scope

- **Device compromise**: if the child's OS is rooted and a malicious app has filesystem access, the attacker can access photos directly — this is not a problem SafeSnap can solve at the software level
- **Social engineering**: a parent voluntarily sharing their credentials
- **Insider threat at Anthropic/hosting provider**: mitigated by encrypting data at rest (Postgres encrypted volumes)

---

## Authentication security

### Password storage

Passwords are hashed with **bcrypt** (cost factor 12). Raw passwords are never logged, stored, or transmitted after the initial registration/login request.

### JWT design

```
Access token:
  - Algorithm: HS256 with 256-bit secret (minimum)
  - Expiry: 15 minutes
  - Claims: sub (userId), role (PARENT|CHILD), jti (token ID)
  - Stateless: validated by signature only

Refresh token:
  - Algorithm: HS256
  - Expiry: 7 days
  - Stored in Redis: key = "refresh:{userId}:{jti}"
  - Rotated on every use (old key deleted, new key inserted)
```

The `jti` claim enables refresh token rotation detection: if a refresh token is used twice (indicating theft), both the old and new tokens should be invalidated for that user. This is logged as a security event.

### Role-based access

Child tokens carry `role: CHILD` and can only call:
- `POST /api/v1/alerts/report`
- `GET /api/v1/stats/weekly` (scoped to their own childId)

Parent tokens carry `role: PARENT` and can call all other endpoints, scoped to their own children. A parent cannot access another parent's data — all queries are filtered by `parentId` extracted from the JWT.

---

## Transport security

In production:
- All HTTP traffic must be served over TLS 1.3
- HSTS header set with `max-age=31536000; includeSubDomains`
- The Flutter app uses certificate pinning in release builds (SHA-256 of the server's leaf certificate configured in `AndroidManifest.xml` and `Info.plist`)

In development:
- HTTP is permitted on localhost only
- Certificate pinning is disabled

---

## Rate limiting

Implemented with Redis sliding window counters:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 5 requests | 15 minutes per IP+email |
| POST /auth/register-parent | 3 requests | 1 hour per IP |
| POST /alerts/report | 100 requests | 1 minute per childId |
| GET /alerts/list | 60 requests | 1 minute per parentId |

The alert reporting limit (100/min) is generous enough for background scanners but prevents a compromised or malfunctioning device from flooding the database.

---

## Data retention

| Data | Retention |
|------|-----------|
| Alert metadata | 90 days, then soft-deleted |
| Acknowledged alerts | 30 days after acknowledgement |
| Refresh tokens | 7 days (Redis TTL) |
| Pairing tokens | 5 minutes (Redis TTL) |
| Login attempt logs | 30 days |

Parents can request deletion of all data via the Settings page (GDPR Article 17 compliance).

---

## Privacy by design checklist

- [x] Data minimisation: only SHA-256 hash, score, and timestamp transmitted
- [x] Purpose limitation: alert metadata used only for parent notification, never shared or sold
- [x] Storage limitation: automatic data retention limits
- [x] Integrity and confidentiality: bcrypt passwords, HTTPS in transit, encrypted volumes at rest
- [x] Accountability: all alert reports and acknowledgements are logged with timestamps
- [x] Right to erasure: parent-initiated account deletion removes all associated data

---

## Security contact

Found a vulnerability? Please do not open a public GitHub issue. Email security@safesnap.example with:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact assessment
4. Any suggested mitigations

We aim to acknowledge reports within 48 hours and patch critical issues within 7 days.
