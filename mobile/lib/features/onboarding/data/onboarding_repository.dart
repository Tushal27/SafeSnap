import 'dart:io';
import 'dart:math';

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

  /// Pairs this child device using [qrPayload].
  ///
  /// [qrPayload] is the raw QR code value, expected to be a URI of the form
  /// `safesnap://pair?token=<UUID>`.  A bare UUID is also accepted as a
  /// fallback for manual entry.
  ///
  /// Throws [ArgumentError] if no pairing token can be found in the payload.
  /// Throws [DioException] on network or server errors.
  Future<PairingResult> pairDevice(String qrPayload) async {
    final String pairingToken = _extractPairingToken(qrPayload);

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String deviceId = await _ensureDeviceId(prefs);
    final String deviceName = _getDeviceName();

    final Response<Map<String, dynamic>> response =
        await _apiClient.dio.post<Map<String, dynamic>>(
      ApiRoutes.pairDevice,
      queryParameters: {'pairingToken': pairingToken},
      data: {'deviceName': deviceName, 'deviceId': deviceId},
    );

    final Map<String, dynamic> data = response.data!;
    final String accessToken = data['accessToken'] as String;
    final String parentId = (data['parentId'] ?? '').toString();

    final ChildInfo childInfo = ChildInfo(
      deviceId: deviceId,
      deviceName: deviceName,
      parentEmail: parentId,
    );

    await _persistChildDevice(childInfo, accessToken, prefs);
    return PairingResult(childInfo: childInfo, jwt: accessToken);
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
    final String accessToken = data['accessToken'] as String;

    await _apiClient.persistToken(accessToken);
    await _persistParentPrefs(email);

    return RegistrationResult(jwt: accessToken, email: email);
  }

  /// Logs in an existing parent account.
  ///
  /// Throws [DioException] on network or server errors, including 401 for
  /// wrong credentials.
  Future<RegistrationResult> loginParent({
    required String email,
    required String password,
  }) async {
    final Response<Map<String, dynamic>> response =
        await _apiClient.dio.post<Map<String, dynamic>>(
      ApiRoutes.login,
      data: {'email': email, 'password': password},
    );

    final Map<String, dynamic> data = response.data!;
    final String accessToken = data['accessToken'] as String;

    await _apiClient.persistToken(accessToken);
    await _persistParentPrefs(email);

    return RegistrationResult(jwt: accessToken, email: email);
  }

  /// Returns true if this device has already been paired/registered.
  Future<bool> isOnboardingComplete() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? deviceId = prefs.getString(AppConstants.prefKeyDeviceId);
    return deviceId != null && deviceId.isNotEmpty;
  }

  // ─────────────────────────────────────────────────────────────────────────

  /// Extracts the `token` query parameter from a `safesnap://pair?token=…` URI.
  String _extractPairingToken(String qrPayload) {
    final Uri? uri = Uri.tryParse(qrPayload);
    final String? token = uri?.queryParameters['token'];
    if (token != null && token.isNotEmpty) return token;
    // Accept a bare UUID passed directly (e.g. manual entry / deep-link).
    if (qrPayload.isNotEmpty && !qrPayload.contains('://')) return qrPayload;
    throw ArgumentError('No pairing token found in QR payload: $qrPayload');
  }

  /// Returns the stored device UUID, creating and persisting one if absent.
  Future<String> _ensureDeviceId(SharedPreferences prefs) async {
    final String? existing = prefs.getString(AppConstants.prefKeyDeviceId);
    if (existing != null && existing.isNotEmpty) return existing;
    final String newId = _generateUuidV4();
    await prefs.setString(AppConstants.prefKeyDeviceId, newId);
    return newId;
  }

  String _getDeviceName() {
    try {
      final String hostname = Platform.localHostname;
      return hostname.isNotEmpty ? hostname : 'SafeSnap Device';
    } catch (_) {
      return 'SafeSnap Device';
    }
  }

  String _generateUuidV4() {
    final Random rng = Random.secure();
    final List<int> bytes =
        List<int>.generate(16, (_) => rng.nextInt(256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
    return [
      bytes.sublist(0, 4),
      bytes.sublist(4, 6),
      bytes.sublist(6, 8),
      bytes.sublist(8, 10),
      bytes.sublist(10),
    ]
        .map((seg) => seg
            .map((b) => b.toRadixString(16).padLeft(2, '0'))
            .join())
        .join('-');
  }

  Future<void> _persistChildDevice(
    ChildInfo info,
    String accessToken,
    SharedPreferences prefs,
  ) async {
    await Future.wait([
      prefs.setString(AppConstants.prefKeyDeviceId, info.deviceId),
      prefs.setString(AppConstants.prefKeyDeviceName, info.deviceName),
      prefs.setString(AppConstants.prefKeyParentEmail, info.parentEmail),
      prefs.setBool(AppConstants.prefKeyIsChildDevice, true),
    ]);
    await _apiClient.persistToken(accessToken);
  }

  Future<void> _persistParentPrefs(String email) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.setString(AppConstants.prefKeyParentEmail, email),
      prefs.setBool(AppConstants.prefKeyIsChildDevice, false),
    ]);
  }
}
