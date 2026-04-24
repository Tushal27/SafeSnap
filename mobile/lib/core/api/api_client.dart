import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:safesnap/core/constants/app_constants.dart';

/// Provides a pre-configured [Dio] instance for the whole app.
///
/// Auth interceptor automatically attaches the stored JWT as a Bearer token.
/// On 401 responses the token is cleared so the user is redirected to login
/// on next navigation guard check.
class ApiClient {
  ApiClient({
    FlutterSecureStorage? secureStorage,
    Dio? dio,
  })  : _secureStorage = secureStorage ?? const FlutterSecureStorage(),
        _dio = dio ?? Dio() {
    _configureDio();
  }

  final FlutterSecureStorage _secureStorage;
  final Dio _dio;

  Dio get dio => _dio;

  void _configureDio() {
    _dio.options = BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: AppConstants.connectTimeoutSeconds),
      receiveTimeout: const Duration(seconds: AppConstants.receiveTimeoutSeconds),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    _dio.interceptors.addAll([
      _AuthInterceptor(_secureStorage, _dio),
      LogInterceptor(
        requestBody: false, // never log request bodies — may contain PII
        responseBody: false,
        error: true,
      ),
    ]);
  }

  /// Persists [token] in secure storage so subsequent requests include it.
  Future<void> persistToken(String token) async {
    await _secureStorage.write(
      key: AppConstants.prefKeyJwt,
      value: token,
    );
  }

  /// Removes the stored JWT (call on logout).
  Future<void> clearToken() async {
    await _secureStorage.delete(key: AppConstants.prefKeyJwt);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

class _AuthInterceptor extends Interceptor {
  _AuthInterceptor(this._secureStorage, this._dio);

  final FlutterSecureStorage _secureStorage;
  final Dio _dio;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final String? token = await _secureStorage.read(key: AppConstants.prefKeyJwt);
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // Token is invalid or expired — evict it so guards can redirect.
      await _secureStorage.delete(key: AppConstants.prefKeyJwt);
    }
    handler.next(err);
  }
}
