/// All API endpoint paths in one place.
///
/// Every path is relative to the base URL configured in [AppConstants.baseUrl].
/// No URL strings should appear anywhere else in the codebase.
library api_routes;

abstract final class ApiRoutes {
  // ── Authentication ────────────────────────────────────────────────────────
  static const String register = '/api/v1/auth/register-parent';
  static const String login = '/api/v1/auth/login';
  static const String refreshToken = '/api/v1/auth/refresh';

  // ── Pairing ───────────────────────────────────────────────────────────────
  /// POST  ?pairingToken=UUID  body: { deviceName, deviceId }
  /// → returns { accessToken, refreshToken, parentId }
  static const String pairDevice = '/api/v1/auth/pair-child';

  /// GET   returns list of paired child devices for the authenticated parent.
  static const String listDevices = '/api/v1/children';

  // ── Alerts ────────────────────────────────────────────────────────────────
  /// POST  body: AlertMetadata JSON  → acknowledges receipt.
  static const String reportAlert = '/api/v1/alerts/report';

  /// GET   ?deviceId=…  returns alert history for a child device.
  static const String listAlerts = '/api/v1/alerts/list';

  /// POST  ?alertId=…  marks an alert as acknowledged.
  static const String acknowledgeAlert = '/api/v1/alerts/acknowledge';

  // ── Stats ─────────────────────────────────────────────────────────────────
  /// GET   ?deviceId=…  returns weekly scan statistics.
  static const String weeklyStats = '/api/v1/stats/weekly';

  // ── Settings ──────────────────────────────────────────────────────────────
  /// GET / PUT  device-level settings (sensitivity, syncFrequency).
  static const String deviceSettings = '/api/v1/devices/settings';
}
