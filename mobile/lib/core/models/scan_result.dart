import 'package:safesnap/core/constants/app_constants.dart';

/// The severity classification of a scanned image.
enum SeverityLevel {
  safe,
  low,
  medium,
  high,
  critical;

  /// Derives a [SeverityLevel] from a raw model output score in [0, 1].
  factory SeverityLevel.fromScore(double score) {
    if (score < AppConstants.thresholdSafe) return SeverityLevel.safe;
    if (score < AppConstants.thresholdLow) return SeverityLevel.low;
    if (score < AppConstants.thresholdMedium) return SeverityLevel.medium;
    if (score < AppConstants.thresholdHigh) return SeverityLevel.high;
    return SeverityLevel.critical;
  }

  /// Returns true for severity levels that must be reported to the backend.
  bool get shouldReport =>
      this == SeverityLevel.medium ||
      this == SeverityLevel.high ||
      this == SeverityLevel.critical;

  String get displayLabel {
    switch (this) {
      case SeverityLevel.safe:
        return 'Safe';
      case SeverityLevel.low:
        return 'Low';
      case SeverityLevel.medium:
        return 'Medium';
      case SeverityLevel.high:
        return 'High';
      case SeverityLevel.critical:
        return 'Critical';
    }
  }
}

/// The result of running the NSFW classifier on a single image.
///
/// [imagePath] is the local filesystem path — it is never transmitted.
/// Only metadata derived from this result is sent to the backend.
class ScanResult {
  const ScanResult({
    required this.imagePath,
    required this.severityScore,
    required this.severity,
    required this.timestamp,
  });

  final String imagePath;

  /// Raw model output: probability of NSFW content, clamped to [0.0, 1.0].
  final double severityScore;

  final SeverityLevel severity;
  final DateTime timestamp;

  factory ScanResult.fromClassification({
    required String imagePath,
    required double score,
  }) {
    final double clamped = score.clamp(0.0, 1.0);
    return ScanResult(
      imagePath: imagePath,
      severityScore: clamped,
      severity: SeverityLevel.fromScore(clamped),
      timestamp: DateTime.now().toUtc(),
    );
  }

  @override
  String toString() =>
      'ScanResult(path=$imagePath, score=$severityScore, severity=$severity)';
}
