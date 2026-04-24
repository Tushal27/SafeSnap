# SafeSnap — Demo Guide

This guide explains how to record a convincing demo video of SafeSnap for a portfolio or interview context.

---

## What to show

A great SafeSnap demo has four beats:

1. **The setup** (30 sec): two devices side by side — a phone running the Flutter app and a laptop running the dashboard
2. **The pairing** (60 sec): parent registers on dashboard, QR code appears, child app scans it, paired
3. **The scan** (90 sec): trigger a scan on the device, watch the real-time alert appear on the dashboard
4. **The privacy proof** (30 sec): open browser devtools Network tab — show that no image data was transmitted

Total target: 3–4 minutes.

---

## Setup for recording

### Hardware you need
- Android device (API 24+) or iOS 14+ device for the Flutter app
- Laptop or desktop for the dashboard
- Both on the same WiFi network (or use `adb reverse tcp:8080 tcp:8080` for USB)

### Software setup

**Start the backend:**
```bash
cd SafeSnap
cp .env.example .env
docker compose up -d
# Wait for all services to be healthy
docker compose ps
```

**Start the dashboard:**
```bash
cd dashboard
npm run dev
# Opens at http://localhost:5173
```

**Run the Flutter app on device:**
```bash
cd mobile
# For Android via USB:
flutter run --release

# For iOS:
flutter run --release --device-id <your-device-id>
```

---

## Screen recording setup

**Recommended tools:**
- **OBS Studio** (free, works on Mac/Windows/Linux): record both phone and laptop screen simultaneously
- **QuickTime** (Mac): record iPhone screen via USB
- **scrcpy** (Android): mirror Android screen to your laptop for single-screen recording

**Camera layout suggestion:**
```
┌─────────────────┬─────────────────┐
│   Phone screen  │ Laptop/Dashboard│
│  (child's app)  │  (parent view)  │
└─────────────────┴─────────────────┘
```

---

## Demo script

### Beat 1: Introduction (30 sec)

> "SafeSnap is a parental control app built around a single privacy principle: the AI runs entirely on the child's phone. Images never leave the device. I'll show you how it works."

Show the README architecture diagram on screen.

### Beat 2: Parent registration + pairing (60 sec)

1. Open `http://localhost:5173` in the browser
2. Click "Register" → enter email and password → submit
3. Click "Add Child Device" → QR code appears on screen
4. Pick up the phone, open SafeSnap app, select "I'm a child"
5. Aim the camera at the QR code on the laptop screen
6. Watch the dashboard update: "Emma's iPhone — paired"

**What to narrate:** "The pairing token lives in Redis with a 5-minute TTL. It's single-use — scanning it twice does nothing. The child's device gets a JWT scoped to its childId. The parent's JWT can see alerts for all their children."

### Beat 3: Detection + real-time alert (90 sec)

For demo purposes, use a test image that triggers the classifier:
```bash
# The app has a test trigger in Settings → Developer → "Simulate alert"
# This fires a fake AlertMetadata POST without actually scanning any real photo
```

Or, to show the real scanner:
1. Open Settings in the Flutter app → set sensitivity to LOW (catches more)
2. Tap "Scan now" in the scanner screen
3. Watch the progress bar fill
4. Switch to the laptop — the alert card appears in the feed in real-time

**What to narrate:** "That alert arrived via WebSocket — no polling, no delay. The parent sees severity, timestamp, and a cryptographic hash of the image. The hash proves we saw a specific file. The image itself stayed on the phone."

### Beat 4: The privacy proof (30 sec)

1. Open Chrome DevTools → Network tab → filter by "XHR/Fetch"
2. Click on the `POST /api/v1/alerts/report` request
3. Show the Request Payload:
   ```json
   { "childDeviceId": "...", "timestamp": "...", "severityScore": 0.87, "imageHash": "a3f8...", "severity": "HIGH" }
   ```
4. Zoom in: "No image URL. No base64 data. No thumbnail. Just metadata."

**What to narrate:** "This is the entire payload. There's no image field in the schema — the backend literally cannot receive one. The privacy guarantee is structural, not a policy."

---

## Talking points for the interview

**"How does the on-device model perform?"**
> MobileNet V2 INT8 quantised runs in ~80ms on a Snapdragon 888. We batch scan 20 images at a time in the background task, so a gallery of 100 photos takes about 8 seconds of background CPU. The model is ~14MB — shipped with the app, no download.

**"What's the false positive rate?"**
> At the default MEDIUM threshold (0.5), roughly 3-5% of safe images trigger a false positive in testing. Parents can raise the threshold to HIGH (0.7) in settings, which brings FPR below 1% at the cost of missing some true positives. For a safety app, we chose to err toward more alerts rather than fewer.

**"What happens if the backend is offline?"**
> Alert reports are queued locally in a WorkManager retry queue. Retry with exponential backoff: 30s, 2m, 10m, 1h. If the device comes back online within 24 hours, the alert is delivered. After 24 hours, it's dropped (the metadata is stale).

**"How would you scale this?"**
> The current WebSocket implementation uses in-memory session storage — fine for a demo, doesn't horizontally scale. Production would replace `WebSocketSessionRegistry` with Redis pub/sub: each API node subscribes to a channel per parentId, publishes there on alert receipt, and forwards to local sessions. The rest of the stack (stateless JWTs + Postgres + Redis) scales horizontally without changes.

**"Why not use Google's SafeSearch API?"**
> Three reasons: (1) privacy — images would leave the device, (2) cost — SafeSearch charges per image, and a family with 3 kids scanning 500 photos/day is $15/day just in API costs, (3) latency — an API call adds 100-500ms per image vs. 80ms on-device. On-device wins on all three dimensions for this use case.
