import 'dart:io';
import 'dart:typed_data';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:safesnap/core/api/api_client.dart';
import 'package:safesnap/core/api/api_routes.dart';
import 'package:safesnap/core/models/alert_metadata.dart';

/// Handles all data operations for the scanner feature.
///
/// - [getRecentImages]: enumerates device photos since a given timestamp.
/// - [reportAlert]: POSTs [AlertMetadata] (no image bytes) to the backend.
/// - [computeImageHash]: produces a SHA-256 hex digest of an image file.
class ScannerRepository {
  ScannerRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  /// Returns file-system paths of images modified since [since].
  ///
  /// If [since] is null all images in the standard picture directories are
  /// returned (capped at [_maxImages] to prevent runaway first-scan cost).
  Future<List<String>> getRecentImages({DateTime? since}) async {
    final List<Directory> pictureDirectories = _pictureDirectories();
    final List<String> paths = [];

    for (final Directory dir in pictureDirectories) {
      if (!dir.existsSync()) continue;
      await _collectImages(dir, since, paths);
      if (paths.length >= _maxImages) break;
    }

    return paths.take(_maxImages).toList();
  }

  /// Reports [alert] to the SafeSnap backend.
  ///
  /// Throws [DioException] on network or server errors.
  Future<void> reportAlert(AlertMetadata alert) async {
    await _apiClient.dio.post<void>(
      ApiRoutes.reportAlert,
      data: alert.toJson(),
    );
  }

  /// Computes the SHA-256 hex digest of the file at [imagePath].
  ///
  /// Throws [FileSystemException] if the file does not exist.
  Future<String> computeImageHash(String imagePath) async {
    final File file = File(imagePath);
    final Uint8List bytes = await file.readAsBytes();
    final Digest digest = sha256.convert(bytes);
    return digest.toString();
  }

  // ─────────────────────────────────────────────────────────────────────────

  static const int _maxImages = 50;

  List<Directory> _pictureDirectories() {
    if (Platform.isAndroid) {
      return [
        Directory('/storage/emulated/0/DCIM'),
        Directory('/storage/emulated/0/Pictures'),
      ];
    } else if (Platform.isIOS) {
      // On iOS the photo library is accessed through the Photos framework;
      // here we use the Documents/tmp path for sideloaded images in tests.
      // In production the gallery_repository handles PHAsset enumeration.
      return [Directory('${Platform.environment['HOME'] ?? ''}/Pictures')];
    }
    return [];
  }

  Future<void> _collectImages(
    Directory dir,
    DateTime? since,
    List<String> accumulator,
  ) async {
    await for (final FileSystemEntity entity
        in dir.list(recursive: true, followLinks: false)) {
      if (entity is! File) continue;
      if (!_isImageFile(entity.path)) continue;
      if (since != null) {
        final FileStat stat = await entity.stat();
        if (stat.modified.isBefore(since)) continue;
      }
      accumulator.add(entity.path);
      if (accumulator.length >= _maxImages) return;
    }
  }

  bool _isImageFile(String path) {
    final String lower = path.toLowerCase();
    return lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.heic') ||
        lower.endsWith('.heif');
  }
}
