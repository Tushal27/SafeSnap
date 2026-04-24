import 'package:flutter_test/flutter_test.dart';
import 'package:safesnap/core/models/scan_result.dart';
import 'package:safesnap/core/constants/app_constants.dart';

void main() {
  group('SeverityLevel thresholds', () {
    test('score below thresholdSafe maps to safe', () {
      final level = SeverityLevel.fromScore(AppConstants.thresholdSafe - 0.01);
      expect(level, SeverityLevel.safe);
    });

    test('score at thresholdLow boundary maps to low', () {
      final level = SeverityLevel.fromScore(AppConstants.thresholdSafe);
      expect(level, SeverityLevel.low);
    });

    test('score at thresholdMedium boundary maps to medium', () {
      final level = SeverityLevel.fromScore(AppConstants.thresholdLow);
      expect(level, SeverityLevel.medium);
    });

    test('score at thresholdHigh boundary maps to high', () {
      final level = SeverityLevel.fromScore(AppConstants.thresholdMedium);
      expect(level, SeverityLevel.high);
    });

    test('score at 1.0 maps to critical', () {
      final level = SeverityLevel.fromScore(1.0);
      expect(level, SeverityLevel.critical);
    });
  });

  group('SeverityLevel.shouldReport', () {
    test('safe does not trigger a report', () {
      expect(SeverityLevel.safe.shouldReport, isFalse);
    });

    test('low does not trigger a report', () {
      expect(SeverityLevel.low.shouldReport, isFalse);
    });

    test('medium triggers a report', () {
      expect(SeverityLevel.medium.shouldReport, isTrue);
    });

    test('high triggers a report', () {
      expect(SeverityLevel.high.shouldReport, isTrue);
    });

    test('critical triggers a report', () {
      expect(SeverityLevel.critical.shouldReport, isTrue);
    });
  });

  group('ScanResult.fromClassification', () {
    test('clamps score above 1.0 to 1.0', () {
      final result = ScanResult.fromClassification(
        imagePath: '/test/img.jpg',
        score: 1.5,
      );
      expect(result.severityScore, 1.0);
      expect(result.severity, SeverityLevel.critical);
    });

    test('clamps negative score to 0.0', () {
      final result = ScanResult.fromClassification(
        imagePath: '/test/img.jpg',
        score: -0.1,
      );
      expect(result.severityScore, 0.0);
      expect(result.severity, SeverityLevel.safe);
    });

    test('stores imagePath without modification', () {
      const path = '/storage/emulated/0/DCIM/photo.jpg';
      final result = ScanResult.fromClassification(imagePath: path, score: 0.5);
      expect(result.imagePath, path);
    });

    test('timestamp is UTC', () {
      final result = ScanResult.fromClassification(
        imagePath: '/test/img.jpg',
        score: 0.5,
      );
      expect(result.timestamp.isUtc, isTrue);
    });
  });
}
