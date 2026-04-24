import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:safesnap/features/settings/data/settings_repository.dart';
import 'package:safesnap/core/constants/app_constants.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('SettingsRepository.load', () {
    test('returns defaults when SharedPreferences is empty', () async {
      final settings = await const SettingsRepository().load();
      expect(settings.sensitivityThreshold, AppConstants.defaultSensitivityThreshold);
      expect(settings.syncFrequencyMinutes, AppConstants.defaultSyncFrequencyMinutes);
      expect(settings.parentEmail, '');
    });

    test('clamps threshold below 0.5 to 0.5', () async {
      SharedPreferences.setMockInitialValues({
        AppConstants.prefKeySensitivityThreshold: 0.1,
      });
      final settings = await const SettingsRepository().load();
      expect(settings.sensitivityThreshold, 0.5);
    });

    test('clamps threshold above 0.95 to 0.95', () async {
      SharedPreferences.setMockInitialValues({
        AppConstants.prefKeySensitivityThreshold: 1.0,
      });
      final settings = await const SettingsRepository().load();
      expect(settings.sensitivityThreshold, 0.95);
    });
  });

  group('SettingsRepository.save and reload', () {
    test('saves and reloads all fields correctly', () async {
      const repo = SettingsRepository();
      final original = AppSettings(
        sensitivityThreshold: 0.80,
        parentEmail: 'parent@example.com',
        syncFrequencyMinutes: 15,
      );
      await repo.save(original);
      final loaded = await repo.load();
      expect(loaded.sensitivityThreshold, closeTo(0.80, 0.001));
      expect(loaded.parentEmail, 'parent@example.com');
      expect(loaded.syncFrequencyMinutes, 15);
    });

    test('overwriting settings persists new values', () async {
      const repo = SettingsRepository();
      await repo.save(AppSettings(
        sensitivityThreshold: 0.60,
        parentEmail: 'old@example.com',
        syncFrequencyMinutes: 60,
      ));
      await repo.save(AppSettings(
        sensitivityThreshold: 0.90,
        parentEmail: 'new@example.com',
        syncFrequencyMinutes: 360,
      ));
      final loaded = await repo.load();
      expect(loaded.sensitivityThreshold, closeTo(0.90, 0.001));
      expect(loaded.parentEmail, 'new@example.com');
      expect(loaded.syncFrequencyMinutes, 360);
    });
  });

  group('AppSettings.copyWith', () {
    test('only changes specified field', () {
      final original = AppSettings.defaults;
      final updated = original.copyWith(parentEmail: 'test@example.com');
      expect(updated.parentEmail, 'test@example.com');
      expect(updated.sensitivityThreshold, original.sensitivityThreshold);
      expect(updated.syncFrequencyMinutes, original.syncFrequencyMinutes);
    });
  });
}
