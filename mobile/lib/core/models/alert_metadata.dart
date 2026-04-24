import 'package:safesnap/core/models/scan_result.dart';

/// The ONLY data transmitted to the backend when a flagged image is detected.
///
/// Privacy contract: this object contains no image bytes, no file paths, and
/// no identifying content — only a SHA-256 hash of the image and metadata.
class AlertMetadata {
  const AlertMetadata({
    required this.childDeviceId,
    required this.timestamp,
    required this.severityScore,
    required this.imageHash,
    required this.severity,
  });

  /// Stable identifier for the child device (UUID).
  final String childDeviceId;

  /// UTC timestamp of when the image was scanned.
  final DateTime timestamp;

  /// Raw NSFW probability score from the classifier [0.0, 1.0].
  final double severityScore;

  /// SHA-256 hex digest of the image bytes — used for deduplication only.
  final String imageHash;

  final SeverityLevel severity;

  Map<String, dynamic> toJson() => {
        'childDeviceId': childDeviceId,
        'timestamp': timestamp.toIso8601String(),
        'severityScore': severityScore,
        'imageHash': imageHash,
        'severity': severity.name,
      };

  factory AlertMetadata.fromJson(Map<String, dynamic> json) {
    return AlertMetadata(
      childDeviceId: json['childDeviceId'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      severityScore: (json['severityScore'] as num).toDouble(),
      imageHash: json['imageHash'] as String,
      severity: SeverityLevel.values.byName(json['severity'] as String),
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AlertMetadata &&
          runtimeType == other.runtimeType &&
          childDeviceId == other.childDeviceId &&
          imageHash == other.imageHash &&
          timestamp == other.timestamp;

  @override
  int get hashCode =>
      Object.hash(childDeviceId, imageHash, timestamp);

  @override
  String toString() =>
      'AlertMetadata(deviceId=$childDeviceId, severity=$severity, hash=$imageHash)';
}
