# SafeSnap — Architecture

## Design philosophy

SafeSnap was designed around one constraint that shapes every other decision: **the image never leaves the device**. This is not a marketing claim bolted on at the end — it is the load-bearing wall of the architecture. Every component exists either to enforce that constraint or to deliver value within it.

---

## Component overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Child's Smartphone                           │
│                                                                  │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐  │
│  │ Photo Gallery│───▶│ Background Scanner│───▶│ TFLite Engine  │  │
│  │  (OS API)   │    │  (WorkManager)   │    │ (MobileNet V2) │  │
│  └─────────────┘    └──────────────────┘    └───────┬────────┘  │
│                                                      │           │
│                                              severity ≥ MEDIUM?  │
│                                                      │           │
│                                             ┌────────▼────────┐  │
│                                             │  AlertMetadata  │  │
│                                             │  (hash+score+ts)│  │
│                                             └────────┬────────┘  │
└──────────────────────────────────────────────────────┼──────────┘
                                                       │ HTTPS POST
                                          ┌────────────▼────────────┐
                                          │    Spring Boot API      │
                                          │                         │
                                          │  ┌──────────────────┐   │
                                          │  │  Auth Service    │   │
                                          │  │  (JWT + Redis)   │   │
                                          │  └──────────────────┘   │
                                          │  ┌──────────────────┐   │
                                          │  │  Alert Service   │   │
                                          │  └──────────────────┘   │
                                          │  ┌──────────────────┐   │
                                          │  │ WebSocket Handler│   │
                                          │  └────────┬─────────┘   │
                                          └───────────┼─────────────┘
                                                      │ WebSocket push
                                          ┌───────────▼─────────────┐
                                          │   Parent Dashboard      │
                                          │   (React 18 + Vite)     │
                                          └─────────────────────────┘
```

---

## Mobile app architecture

### Feature-first vertical slices

```
mobile/lib/features/
  onboarding/    ← QR code pairing flow
  gallery/       ← Permission + image browsing
  scanner/       ← TFLite inference + reporting
  settings/      ← Thresholds, sync frequency
  dashboard/     ← Child-facing "protected" UI
```

Each feature owns its own: data layer (repository), state layer (Riverpod providers), and presentation layer (screens + widgets). This mirrors how a growing team would split ownership — one engineer per feature.

### On-device inference pipeline

```
1. WorkManager triggers BackgroundScanService every N minutes
2. Service reads lastScanTimestamp from SharedPreferences
3. Queries MediaStore for images newer than lastScanTimestamp
4. For each image:
   a. Decode JPEG/PNG → dart:ui Image
   b. Resize to 224×224 (MobileNet input size)
   c. Normalise pixel values to [0.0, 1.0]
   d. Run tflite_flutter interpreter
   e. Read output tensor → single sigmoid score
   f. Map score to SeverityLevel enum
5. If severity >= MEDIUM: compute SHA-256(raw bytes), build AlertMetadata
6. POST AlertMetadata to /api/v1/alerts/report
7. Update lastScanTimestamp
```

**Why SHA-256 of the raw bytes?** The hash gives the backend a stable identifier for a specific image file. If the same image is scanned across multiple runs (e.g. because it was re-downloaded), we can deduplicate alerts server-side without ever storing the image.

### State management rationale

Riverpod was chosen over BLoC for three reasons:
1. **Compile-time safety**: providers are referenced by type, not string keys
2. **Testability**: providers can be overridden in tests without mocking frameworks
3. **Async-first**: `AsyncNotifier` handles loading/error/data states without boilerplate

---

## Backend architecture

### Layered design

```
Controller → Service → Repository → Database
     ↑           ↓
  DTOs       Domain models (never exposed to controllers)
```

Controllers speak DTOs. Services speak domain models. Repositories speak JPA entities. This boundary prevents accidental field exposure (e.g. a password hash accidentally serialized into a response).

### Authentication flow

```
Registration:
  POST /auth/register-parent
    → validate email + password
    → bcrypt hash password
    → save Parent entity
    → return { accessToken, refreshToken }

Child pairing:
  POST /auth/pair-child (authenticated as parent)
    → generate pairingToken (UUID)
    → store in Redis: "pair:{pairingToken}" → parentId, TTL=5min
    → return { pairingToken } (encoded into QR code by dashboard)

  Child app scans QR, calls POST /auth/exchange-pairing-token
    → lookup pairingToken in Redis
    → create Child entity linked to parent
    → return { accessToken, refreshToken } scoped to childId
```

### Session management

Access tokens (JWT, 15 min) are stateless and validated by signature. Refresh tokens are stored in Redis:

```
Key: "refresh:{userId}:{tokenId}"
Value: userId
TTL: 7 days
```

On refresh: validate JWT signature → lookup Redis key → generate new access token → rotate refresh token (delete old key, insert new). On logout or device deregistration: delete the Redis key. This gives us server-side revocation without querying the database on every request.

### WebSocket alert delivery

```
Parent connects: ws://host/ws/alerts?token=<JWT>
  → WebSocketSessionRegistry stores session keyed by parentId
  → Session authenticated once at connect time

Alert reported by child app:
  → AlertService saves Alert to Postgres
  → Broadcasts serialised AlertResponse to all sessions for parentId
  → Parent dashboard receives push, updates React Query cache
```

Sessions are stored in a `ConcurrentHashMap` in `WebSocketSessionRegistry`. In a horizontally scaled deployment, this would be replaced with a Redis pub/sub fan-out pattern.

---

## Dashboard architecture

### Feature-based structure (Bulletproof React pattern)

```
dashboard/src/features/
  auth/        ← Login, register, token management
  dashboard/   ← Main view, stats chart, child cards
  alerts/      ← Feed, detail modal, acknowledgement
  children/    ← Device list, QR pairing modal
  settings/    ← Notification prefs, profile
```

### Data flow

```
React Query (server state) ←→ Axios (HTTP) ←→ Spring Boot API
       ↕
WebSocket hook (real-time) → invalidate React Query cache on new alert

Component state (UI-only): modal open/closed, form dirty, theme
```

Server state (alerts, children, stats) lives in React Query. Local UI state (modal open, form values) lives in `useState`. There is no global client state store (no Redux, no Zustand) — React Query + Context is sufficient for this app's complexity.

### Type safety end-to-end

All API responses are parsed through Zod schemas at the boundary (inside each feature's hook). This means a backend schema change causes a runtime `ZodError` at the parsing step — not a silent `undefined` somewhere deep in a component tree. The Zod schema doubles as the TypeScript type source via `z.infer<>`.

---

## Data flow: the privacy guarantee in code

```typescript
// dashboard/src/types/index.ts
export interface Alert {
  imageHash: string;   // SHA-256 hex — the only image-related data the server ever touches
  // Note: no imageUrl, no imageThumbnail, no imageBytes field exists anywhere in this codebase
}
```

```dart
// mobile/lib/features/scanner/data/scanner_repository.dart
Future<void> reportAlert(AlertMetadata metadata) async {
  // AlertMetadata contains: childDeviceId, timestamp, severityScore, imageHash, severity
  // It does NOT contain: imagePath, imageBytes, imageThumbnail
  await _apiClient.post(ApiRoutes.reportAlert, data: metadata.toJson());
}
```

```java
// backend: ReportAlertRequest.java
public record ReportAlertRequest(
    String childDeviceId,
    Instant timestamp,
    Double severityScore,
    String imageHash,    // SHA-256 hex string
    SeverityLevel severity
    // No image field. No url field. The schema physically cannot receive image data.
) {}
```

The privacy guarantee is enforced by **type system constraints** across three languages, not by runtime checks or policy documents.
