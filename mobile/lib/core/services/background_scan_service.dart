import 'package:shared_preferences/shared_preferences.dart';
import 'package:workmanager/workmanager.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/core/models/alert_metadata.dart';
import 'package:safesnap/core/models/scan_result.dart';
import 'package:safesnap/features/scanner/data/nsfw_classifier.dart';
import 'package:safesnap/features/scanner/data/scanner_repository.dart';

/// Top-level callback required by [Workmanager].
///
/// Must be a top-level or static function — Flutter isolate limitation.
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((String taskName, Map<String, dynamic>? inputData) async {
    if (taskName == AppConstants.backgroundTaskName) {
      await BackgroundScanService.runScan();
    }
    return Future.value(true);
  });
}

/// Registers and executes periodic background photo scans.
class BackgroundScanService {
  const BackgroundScanService._();

  /// Initialises Workmanager with the [callbackDispatcher].
  ///
  /// Call once from [main] before [runApp].
  static Future<void> initialise() async {
    await Workmanager().initialize(
      callbackDispatcher,
      isInDebugMode: false,
    );
  }

  /// Schedules (or reschedules) the periodic scan task.
  ///
  /// [frequencyMinutes] must be ≥ 15 (Android constraint).
  static Future<void> schedulePeriodicScan({
    int frequencyMinutes = AppConstants.defaultSyncFrequencyMinutes,
  }) async {
    // Cancel any existing registration before re-registering.
    await Workmanager().cancelByUniqueName(AppConstants.backgroundTaskUniqueName);

    await Workmanager().registerPeriodicTask(
      AppConstants.backgroundTaskUniqueName,
      AppConstants.backgroundTaskName,
      frequency: Duration(minutes: frequencyMinutes),
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
      backoffPolicy: BackoffPolicy.linear,
      backoffPolicyDelay: const Duration(minutes: 5),
    );
  }

  /// Cancels the periodic scan task.
  static Future<void> cancelPeriodicScan() async {
    await Workmanager().cancelByUniqueName(AppConstants.backgroundTaskUniqueName);
  }

  /// Core scan logic executed inside the Workmanager isolate.
  ///
  /// 1. Reads [lastScanTimestamp] from [SharedPreferences].
  /// 2. Fetches images added since that timestamp.
  /// 3. Classifies each image with [NsfwClassifier].
  /// 4. Reports flagged images (severity ≥ medium) via [ScannerRepository].
  /// 5. Updates [lastScanTimestamp].
  static Future<void> runScan() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final NsfwClassifier classifier = NsfwClassifier();
    final ScannerRepository repository = ScannerRepository();

    await classifier.loadModel();

    try {
      final DateTime? lastScan = _readLastScanTimestamp(prefs);
      final List<String> imagePaths =
          await repository.getRecentImages(since: lastScan);

      final String deviceId =
          prefs.getString(AppConstants.prefKeyDeviceId) ?? '';

      for (final String path in imagePaths) {
        final ScanResult result = await classifier.classify(path);
        if (result.severity.shouldReport) {
          final String imageHash = await repository.computeImageHash(path);
          final AlertMetadata alert = AlertMetadata(
            childDeviceId: deviceId,
            timestamp: result.timestamp,
            severityScore: result.severityScore,
            imageHash: imageHash,
            severity: result.severity,
          );
          await repository.reportAlert(alert);
        }
      }

      await prefs.setString(
        AppConstants.prefKeyLastScanTimestamp,
        DateTime.now().toUtc().toIso8601String(),
      );
    } finally {
      classifier.dispose();
    }
  }

  static DateTime? _readLastScanTimestamp(SharedPreferences prefs) {
    final String? raw =
        prefs.getString(AppConstants.prefKeyLastScanTimestamp);
    if (raw == null) return null;
    return DateTime.tryParse(raw);
  }
}
