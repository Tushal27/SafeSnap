# SafeSnap — Flutter Mobile App

Flutter app installed on the child's phone. Runs on-device NSFW detection — images never leave the device.

**Backend API:** https://safesnap-backend.onrender.com

## Stack

| | |
|---|---|
| Framework | Flutter 3.22+ / Dart 3 |
| State | Riverpod (AsyncNotifier) |
| ML inference | TFLite (MobileNet V2 INT8, ~14MB) |
| Background | WorkManager (hourly scan) |
| Navigation | go_router |
| Storage | flutter_secure_storage + shared_preferences |
| Camera / QR | mobile_scanner |
| Networking | Dio |

## How it works

1. **Onboarding** — child scans a QR code from the parent dashboard to pair the device
2. **Background scan** — WorkManager wakes the app hourly, scans new gallery images through the TFLite model
3. **Privacy** — only `{childDeviceId, timestamp, severityScore, SHA-256(image), severity}` is ever transmitted
4. **Alert** — if severity ≥ MEDIUM the metadata is POSTed to the backend, which pushes a WebSocket notification to the parent dashboard in real time

## Build

```bash
flutter pub get

# Run on connected device (debug)
flutter run --dart-define=BASE_URL=https://safesnap-backend.onrender.com

# Release APK
flutter build apk --dart-define=BASE_URL=https://safesnap-backend.onrender.com
# → build/app/outputs/flutter-apk/app-release.apk
```

## First-time setup

After cloning you need to generate the Android/iOS platform folders and add the TFLite model:

```bash
# 1. Generate platform folders (won't overwrite lib/)
flutter create --project-name safesnap --org com.safesnap .

# 2. Add Android permissions to android/app/src/main/AndroidManifest.xml:
#    INTERNET, READ_MEDIA_IMAGES, CAMERA, RECEIVE_BOOT_COMPLETED

# 3. Place the TFLite model at:
#    assets/models/nsfw_mobilenet.tflite
#    (MobileNet V2 binary classifier, output shape [1, 2]: [safe_prob, nsfw_prob])
```

## Run tests

```bash
flutter test
```
