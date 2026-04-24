import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:safesnap/core/api/api_client.dart';
import 'package:safesnap/core/api/api_routes.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/core/models/child_info.dart';

class PairingResult {
  const PairingResult({required this.childInfo, required this.jwt});

  final ChildInfo childInfo;
  final String jwt;
}

class RegistrationResult {
  const RegistrationResult({required this.jwt, required this.email});

  final String jwt;
  final String email;
}

/// Handles all network and storage operations for the onboarding flow.
class OnboardingRepository {
  OnboardingRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  /// Sends [pairingToken] to the backend and returns the paired [ChildInfo].
  ///
  /// Throws [DioException] on network or server errors.
  Future<PairingResult> pairDevice(String pairingToken) async {
    final Response<Map<String, dynamic>> response =
        await _apiClient.dio.post<Map<String, dynamic>>(
      ApiRoutes.pairDevice,
      data: {'pairingToken': pairingToken},
    );

    final Map<String, dynamic> data = response.data!;
    final ChildInfo childInfo =
        ChildInfo.fromJson(data['device'] as Map<String, dynamic>);
    final String jwt = data['jwt'] as String;

    await _persistChildDevice(childInfo, jwt);
    return PairingResult(childInfo: childInfo, jwt: jwt);
  }

  /// Registers a new parent account.
  ///
  /// Throws [DioException] on network or server errors.
  Future<RegistrationResult> registerParent({
    required String email,
    required String password,
  }) async {
    final Response<Map<String, dynamic>> response =
        await _apiClient.dio.post<Map<String, dynamic>>(
      ApiRoutes.register,
      data: {'email': email, 'password': password},
    );

    final Map<String, dynamic> data = response.data!;
    final String jwt = data['jwt'] as String;

    await _apiClient.persistToken(jwt);
    await _persistParentPrefs(email);

    return RegistrationResult(jwt: jwt, email: email);
  }

  /// Returns true if this device has already been paired/registered.
  Future<bool> isOnboardingComplete() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? deviceId = prefs.getString(AppConstants.prefKeyDeviceId);
    return deviceId != null && deviceId.isNotEmpty;
  }

  Future<void> _persistChildDevice(ChildInfo info, String jwt) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.setString(AppConstants.prefKeyDeviceId, info.deviceId),
      prefs.setString(AppConstants.prefKeyDeviceName, info.deviceName),
      prefs.setString(AppConstants.prefKeyParentEmail, info.parentEmail),
      prefs.setBool(AppConstants.prefKeyIsChildDevice, true),
    ]);
    await _apiClient.persistToken(jwt);
  }

  Future<void> _persistParentPrefs(String email) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.setString(AppConstants.prefKeyParentEmail, email),
      prefs.setBool(AppConstants.prefKeyIsChildDevice, false),
    ]);
  }
}
