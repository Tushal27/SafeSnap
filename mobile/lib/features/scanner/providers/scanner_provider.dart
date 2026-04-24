import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:safesnap/core/models/scan_result.dart';
import 'package:safesnap/features/scanner/data/nsfw_classifier.dart';
import 'package:safesnap/features/scanner/data/scanner_repository.dart';
import 'package:safesnap/core/models/alert_metadata.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:safesnap/core/constants/app_constants.dart';

// ── Dependency providers ───────────────────────────────────────────────────

final scannerRepositoryProvider = Provider<ScannerRepository>((Ref ref) {
  return ScannerRepository();
});

final nsfwClassifierProvider = Provider<NsfwClassifier>((Ref ref) {
  final NsfwClassifier classifier = NsfwClassifier();
  ref.onDispose(classifier.dispose);
  return classifier;
});

// ── State ──────────────────────────────────────────────────────────────────

class ScanState {
  const ScanState({
    this.isScanning = false,
    this.totalImages = 0,
    this.scannedImages = 0,
    this.flaggedCount = 0,
    this.lastScanTime,
    this.results = const [],
    this.error,
  });

  final bool isScanning;
  final int totalImages;
  final int scannedImages;
  final int flaggedCount;
  final DateTime? lastScanTime;
  final List<ScanResult> results;
  final String? error;

  double get progress =>
      totalImages == 0 ? 0.0 : scannedImages / totalImages;

  ScanState copyWith({
    bool? isScanning,
    int? totalImages,
    int? scannedImages,
    int? flaggedCount,
    DateTime? lastScanTime,
    List<ScanResult>? results,
    String? error,
  }) {
    return ScanState(
      isScanning: isScanning ?? this.isScanning,
      totalImages: totalImages ?? this.totalImages,
      scannedImages: scannedImages ?? this.scannedImages,
      flaggedCount: flaggedCount ?? this.flaggedCount,
      lastScanTime: lastScanTime ?? this.lastScanTime,
      results: results ?? this.results,
      error: error,
    );
  }
}

// ── Notifier ───────────────────────────────────────────────────────────────

class ScannerNotifier extends AsyncNotifier<ScanState> {
  @override
  Future<ScanState> build() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? raw =
        prefs.getString(AppConstants.prefKeyLastScanTimestamp);
    final DateTime? lastScan =
        raw != null ? DateTime.tryParse(raw) : null;

    return ScanState(lastScanTime: lastScan);
  }

  /// Starts a full foreground scan and updates state incrementally.
  Future<void> startScan() async {
    final ScanState current = state.valueOrNull ?? const ScanState();
    if (current.isScanning) return;

    state = AsyncData(current.copyWith(
      isScanning: true,
      scannedImages: 0,
      flaggedCount: 0,
      results: [],
      error: null,
    ));

    final NsfwClassifier classifier = ref.read(nsfwClassifierProvider);
    final ScannerRepository repository = ref.read(scannerRepositoryProvider);

    try {
      await classifier.loadModel();

      final DateTime? lastScan =
          state.valueOrNull?.lastScanTime;
      final List<String> paths =
          await repository.getRecentImages(since: lastScan);

      state = AsyncData(state.requireValue.copyWith(totalImages: paths.length));

      final List<ScanResult> results = [];
      int flaggedCount = 0;

      for (final String path in paths) {
        final ScanResult result = await classifier.classify(path);
        results.add(result);

        if (result.severity.shouldReport) {
          flaggedCount++;
          final String hash = await repository.computeImageHash(path);
          final String deviceId = await _readDeviceId();

          await repository.reportAlert(AlertMetadata(
            childDeviceId: deviceId,
            timestamp: result.timestamp,
            severityScore: result.severityScore,
            imageHash: hash,
            severity: result.severity,
          ));
        }

        final ScanState next = state.requireValue.copyWith(
          scannedImages: results.length,
          flaggedCount: flaggedCount,
          results: List.unmodifiable(results),
        );
        state = AsyncData(next);
      }

      final DateTime now = DateTime.now().toUtc();
      await _persistLastScanTimestamp(now);

      state = AsyncData(state.requireValue.copyWith(
        isScanning: false,
        lastScanTime: now,
      ));
    } on Exception catch (e) {
      state = AsyncData(state.requireValue.copyWith(
        isScanning: false,
        error: e.toString(),
      ));
    } finally {
      classifier.dispose();
    }
  }

  Future<String> _readDeviceId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.prefKeyDeviceId) ?? '';
  }

  Future<void> _persistLastScanTimestamp(DateTime dt) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      AppConstants.prefKeyLastScanTimestamp,
      dt.toIso8601String(),
    );
  }
}

final scannerProvider =
    AsyncNotifierProvider<ScannerNotifier, ScanState>(ScannerNotifier.new);
