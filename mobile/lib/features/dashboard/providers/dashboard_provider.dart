import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/core/models/child_info.dart';

class DashboardState {
  const DashboardState({
    this.childInfo,
    this.lastScanTime,
    this.isChildDevice = false,
  });

  final ChildInfo? childInfo;
  final DateTime? lastScanTime;
  final bool isChildDevice;

  DashboardState copyWith({
    ChildInfo? childInfo,
    DateTime? lastScanTime,
    bool? isChildDevice,
  }) {
    return DashboardState(
      childInfo: childInfo ?? this.childInfo,
      lastScanTime: lastScanTime ?? this.lastScanTime,
      isChildDevice: isChildDevice ?? this.isChildDevice,
    );
  }
}

class DashboardNotifier extends AsyncNotifier<DashboardState> {
  @override
  Future<DashboardState> build() async {
    return _loadFromPrefs();
  }

  /// Re-reads prefs (e.g. after a background scan updates the timestamp).
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = AsyncData(await _loadFromPrefs());
  }

  Future<DashboardState> _loadFromPrefs() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    final String? deviceId = prefs.getString(AppConstants.prefKeyDeviceId);
    final String? deviceName =
        prefs.getString(AppConstants.prefKeyDeviceName);
    final String? parentEmail =
        prefs.getString(AppConstants.prefKeyParentEmail);
    final bool isChild =
        prefs.getBool(AppConstants.prefKeyIsChildDevice) ?? false;

    final String? rawTimestamp =
        prefs.getString(AppConstants.prefKeyLastScanTimestamp);
    final DateTime? lastScan =
        rawTimestamp != null ? DateTime.tryParse(rawTimestamp) : null;

    ChildInfo? childInfo;
    if (deviceId != null && deviceName != null && parentEmail != null) {
      childInfo = ChildInfo(
        deviceId: deviceId,
        deviceName: deviceName,
        parentEmail: parentEmail,
      );
    }

    return DashboardState(
      childInfo: childInfo,
      lastScanTime: lastScan,
      isChildDevice: isChild,
    );
  }
}

final dashboardProvider =
    AsyncNotifierProvider<DashboardNotifier, DashboardState>(
  DashboardNotifier.new,
);
