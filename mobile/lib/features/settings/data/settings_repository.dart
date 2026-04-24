import 'package:shared_preferences/shared_preferences.dart';
import 'package:safesnap/core/constants/app_constants.dart';

/// Persists and retrieves user-configurable settings from [SharedPreferences].
class AppSettings {
  const AppSettings({
    required this.sensitivityThreshold,
    required this.parentEmail,
    required this.syncFrequencyMinutes,
  });

  /// NSFW score threshold above which an image is considered flagged.
  /// Range: [0.5, 0.95].
  final double sensitivityThreshold;

  final String parentEmail;

  /// How often the background scan runs, in minutes.
  /// Must be one of [AppConstants.syncFrequencyOptions].
  final int syncFrequencyMinutes;

  AppSettings copyWith({
    double? sensitivityThreshold,
    String? parentEmail,
    int? syncFrequencyMinutes,
  }) {
    return AppSettings(
      sensitivityThreshold:
          sensitivityThreshold ?? this.sensitivityThreshold,
      parentEmail: parentEmail ?? this.parentEmail,
      syncFrequencyMinutes:
          syncFrequencyMinutes ?? this.syncFrequencyMinutes,
    );
  }

  static AppSettings get defaults => AppSettings(
        sensitivityThreshold: AppConstants.defaultSensitivityThreshold,
        parentEmail: '',
        syncFrequencyMinutes: AppConstants.defaultSyncFrequencyMinutes,
      );
}

class SettingsRepository {
  const SettingsRepository();

  /// Loads [AppSettings] from [SharedPreferences].
  Future<AppSettings> load() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    final double threshold = prefs.getDouble(
          AppConstants.prefKeySensitivityThreshold,
        ) ??
        AppConstants.defaultSensitivityThreshold;

    final String email =
        prefs.getString(AppConstants.prefKeyParentEmail) ?? '';

    final int frequency = prefs.getInt(
          AppConstants.prefKeySyncFrequencyMinutes,
        ) ??
        AppConstants.defaultSyncFrequencyMinutes;

    return AppSettings(
      sensitivityThreshold: threshold.clamp(0.5, 0.95),
      parentEmail: email,
      syncFrequencyMinutes: frequency,
    );
  }

  /// Persists [settings] to [SharedPreferences].
  Future<void> save(AppSettings settings) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.setDouble(
        AppConstants.prefKeySensitivityThreshold,
        settings.sensitivityThreshold,
      ),
      prefs.setString(
        AppConstants.prefKeyParentEmail,
        settings.parentEmail,
      ),
      prefs.setInt(
        AppConstants.prefKeySyncFrequencyMinutes,
        settings.syncFrequencyMinutes,
      ),
    ]);
  }
}
