/// Central home for all compile-time constants used across the app.
///
/// Nothing should be hard-coded in feature code — reference a constant here.
library app_constants;

abstract final class AppConstants {
  // ── Network ──────────────────────────────────────────────────────────────
  /// Base URL for the SafeSnap backend.  Override via --dart-define=BASE_URL=…
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'https://safesnap-backend.onrender.com',
  );

  /// Default connection timeout in seconds.
  static const int connectTimeoutSeconds = 15;

  /// Default receive timeout in seconds.
  static const int receiveTimeoutSeconds = 30;

  // ── SharedPreferences keys ────────────────────────────────────────────────
  static const String prefKeyJwt = 'jwt_token';
  static const String prefKeyDeviceId = 'device_id';
  static const String prefKeyParentEmail = 'parent_email';
  static const String prefKeyLastScanTimestamp = 'last_scan_timestamp';
  static const String prefKeySensitivityThreshold = 'sensitivity_threshold';
  static const String prefKeySyncFrequencyMinutes = 'sync_frequency_minutes';
  static const String prefKeyIsChildDevice = 'is_child_device';
  static const String prefKeyPairingToken = 'pairing_token';
  static const String prefKeyDeviceName = 'device_name';

  // ── ML Model ──────────────────────────────────────────────────────────────
  static const String modelAssetPath = 'assets/models/nsfw_mobilenet.tflite';
  static const int modelInputSize = 224;

  /// Default sensitivity threshold.  Images with score ≥ this value are
  /// considered flagged (severity ≥ medium) when the slider is at maximum.
  static const double defaultSensitivityThreshold = 0.70;

  // ── Scanner ───────────────────────────────────────────────────────────────
  static const int maxImagesPerBatch = 50;

  // ── Background task ───────────────────────────────────────────────────────
  static const String backgroundTaskUniqueName = 'safesnap_background_scan';
  static const String backgroundTaskName = 'safesnap_scan_task';
  static const int defaultSyncFrequencyMinutes = 60;

  // ── Sync frequency options (minutes) ─────────────────────────────────────
  static const List<int> syncFrequencyOptions = [15, 60, 360];

  // ── Severity thresholds ───────────────────────────────────────────────────
  static const double thresholdSafe = 0.30;
  static const double thresholdLow = 0.50;
  static const double thresholdMedium = 0.70;
  static const double thresholdHigh = 0.90;

  // ── Routes ────────────────────────────────────────────────────────────────
  static const String routeOnboarding = '/';
  static const String routeQrScan = '/qr-scan';
  static const String routeDashboard = '/dashboard';
  static const String routeGallery = '/gallery';
  static const String routeScanStatus = '/scan-status';
  static const String routeSettings = '/settings';

  // ── UI ────────────────────────────────────────────────────────────────────
  static const double defaultPadding = 16.0;
  static const double cardBorderRadius = 16.0;
  static const double shieldIconSize = 120.0;
}
