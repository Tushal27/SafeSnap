import 'package:flutter_test/flutter_test.dart';
import 'package:safesnap/core/models/alert_metadata.dart';
import 'package:safesnap/core/models/scan_result.dart';

void main() {
  final DateTime testTime = DateTime.utc(2024, 1, 15, 14, 23, 0);

  AlertMetadata buildMetadata({String? imageHash}) => AlertMetadata(
        childDeviceId: 'test-device-uuid',
        timestamp: testTime,
        severityScore: 0.87,
        imageHash: imageHash ?? 'a3f8c2d1' * 8,
        severity: SeverityLevel.high,
      );

  group('AlertMetadata serialization', () {
    test('toJson produces correct keys', () {
      final json = buildMetadata().toJson();
      expect(json.keys, containsAll(['childDeviceId', 'timestamp', 'severityScore', 'imageHash', 'severity']));
    });

    test('toJson contains NO image or path field', () {
      final json = buildMetadata().toJson();
      // The privacy guarantee in code: no image data can be serialized
      expect(json.keys, isNot(contains('imagePath')));
      expect(json.keys, isNot(contains('imageBytes')));
      expect(json.keys, isNot(contains('imageUrl')));
    });

    test('toJson severity uses enum name (uppercase)', () {
      final json = buildMetadata().toJson();
      expect(json['severity'], 'high');
    });

    test('roundtrip toJson → fromJson preserves all fields', () {
      final original = buildMetadata();
      final restored = AlertMetadata.fromJson(original.toJson());
      expect(restored.childDeviceId, original.childDeviceId);
      expect(restored.severityScore, original.severityScore);
      expect(restored.imageHash, original.imageHash);
      expect(restored.severity, original.severity);
      expect(restored.timestamp, original.timestamp);
    });

    test('timestamp is serialized as ISO 8601 UTC', () {
      final json = buildMetadata().toJson();
      final ts = json['timestamp'] as String;
      expect(ts, contains('T'));
      expect(ts, endsWith('Z'));
    });
  });

  group('AlertMetadata equality', () {
    test('two metadata with same deviceId + hash + timestamp are equal', () {
      final a = buildMetadata(imageHash: 'abc123');
      final b = buildMetadata(imageHash: 'abc123');
      expect(a, equals(b));
    });

    test('different imageHash yields different equality', () {
      final a = buildMetadata(imageHash: 'abc123');
      final b = buildMetadata(imageHash: 'def456');
      expect(a, isNot(equals(b)));
    });
  });
}
