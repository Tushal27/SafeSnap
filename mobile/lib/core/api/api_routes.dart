/// All API endpoint paths in one place.
///
/// Every path is relative to the base URL configured in [AppConstants.baseUrl].
/// No URL strings should appear anywhere else in the codebase.
library api_routes;

abstract final class ApiRoutes {
  // ── Authentication ────────────────────────────────────────────────────────
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refreshToken = '/auth/refresh';

  // ── Pairing ───────────────────────────────────────────────────────────────
  /// POST  body: { pairingToken }  → returns { deviceId, parentEmail }
  static const String pairDevice = '/devices/pair';

  /// GET   returns list of paired child devices for the authenticated parent.
  static const String listDevices = '/devices';

  // ── Alerts ────────────────────────────────────────────────────────────────
  /// POST  body: AlertMetadata JSON  → acknowledges receipt.
  static const String reportAlert = '/alerts';

  /// GET   ?deviceId=…  returns alert history for a child device.
  static const String listAlerts = '/alerts';

  // ── Settings ──────────────────────────────────────────────────────────────
  /// GET / PUT  device-level settings (sensitivity, syncFrequency).
  static const String deviceSettings = '/devices/settings';
}
