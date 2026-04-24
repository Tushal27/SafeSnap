import 'dart:io';

import 'package:safesnap/core/models/scan_result.dart';
import 'package:safesnap/features/scanner/data/nsfw_classifier.dart';
import 'package:safesnap/features/scanner/data/scanner_repository.dart';

/// Associates an image path with its scan result (if classified).
class GalleryItem {
  const GalleryItem({
    required this.imagePath,
    this.scanResult,
  });

  final String imagePath;

  /// Null if this image has not yet been scanned.
  final ScanResult? scanResult;

  bool get isScanned => scanResult != null;

  GalleryItem withResult(ScanResult result) =>
      GalleryItem(imagePath: imagePath, scanResult: result);
}

/// Provides gallery images for the [GalleryScreen].
///
/// Loads images from the device, classifies them lazily, and returns
/// combined [GalleryItem] objects.
class GalleryRepository {
  GalleryRepository({
    ScannerRepository? scannerRepository,
    NsfwClassifier? classifier,
  })  : _scannerRepository = scannerRepository ?? ScannerRepository(),
        _classifier = classifier ?? NsfwClassifier();

  final ScannerRepository _scannerRepository;
  final NsfwClassifier _classifier;

  bool _modelLoaded = false;

  /// Returns recent images as unscanned [GalleryItem]s.
  Future<List<GalleryItem>> getRecentGalleryItems() async {
    final List<String> paths =
        await _scannerRepository.getRecentImages();
    return paths
        .map((String p) => GalleryItem(imagePath: p))
        .toList();
  }

  /// Classifies the image at [imagePath] and returns an updated [GalleryItem].
  Future<GalleryItem> classifyItem(GalleryItem item) async {
    await _ensureModelLoaded();
    final ScanResult result =
        await _classifier.classify(item.imagePath);
    return item.withResult(result);
  }

  Future<void> _ensureModelLoaded() async {
    if (!_modelLoaded) {
      await _classifier.loadModel();
      _modelLoaded = true;
    }
  }

  /// Checks whether a file actually exists on disk (guards stale paths).
  bool imageExists(String path) => File(path).existsSync();

  void dispose() {
    _classifier.dispose();
  }
}
