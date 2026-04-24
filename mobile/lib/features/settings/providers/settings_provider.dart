import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:safesnap/core/services/background_scan_service.dart';
import 'package:safesnap/features/settings/data/settings_repository.dart';

final settingsRepositoryProvider = Provider<SettingsRepository>((Ref ref) {
  return const SettingsRepository();
});

class SettingsNotifier extends AsyncNotifier<AppSettings> {
  @override
  Future<AppSettings> build() async {
    return ref.read(settingsRepositoryProvider).load();
  }

  Future<void> updateSensitivityThreshold(double value) async {
    final AppSettings current = state.valueOrNull ?? AppSettings.defaults;
    final AppSettings updated =
        current.copyWith(sensitivityThreshold: value.clamp(0.5, 0.95));
    await _persist(updated);
  }

  Future<void> updateParentEmail(String email) async {
    final AppSettings current = state.valueOrNull ?? AppSettings.defaults;
    await _persist(current.copyWith(parentEmail: email));
  }

  Future<void> updateSyncFrequency(int minutes) async {
    final AppSettings current = state.valueOrNull ?? AppSettings.defaults;
    final AppSettings updated =
        current.copyWith(syncFrequencyMinutes: minutes);
    await _persist(updated);

    // Reschedule the background task with the new frequency.
    await BackgroundScanService.schedulePeriodicScan(
      frequencyMinutes: minutes,
    );
  }

  Future<void> saveAll(AppSettings settings) async {
    await _persist(settings);
    await BackgroundScanService.schedulePeriodicScan(
      frequencyMinutes: settings.syncFrequencyMinutes,
    );
  }

  Future<void> _persist(AppSettings settings) async {
    state = AsyncData(settings);
    await ref.read(settingsRepositoryProvider).save(settings);
  }
}

final settingsProvider =
    AsyncNotifierProvider<SettingsNotifier, AppSettings>(SettingsNotifier.new);
