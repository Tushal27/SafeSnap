import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:safesnap/core/models/scan_result.dart';
import 'package:safesnap/core/services/permission_service.dart';
import 'package:safesnap/features/gallery/data/gallery_repository.dart';

final permissionServiceProvider = Provider<PermissionService>((Ref ref) {
  return const PermissionService();
});

final galleryRepositoryProvider = Provider<GalleryRepository>((Ref ref) {
  final GalleryRepository repo = GalleryRepository();
  ref.onDispose(repo.dispose);
  return repo;
});

// ── State ──────────────────────────────────────────────────────────────────

class GalleryState {
  const GalleryState({
    this.items = const [],
    this.permissionStatus = PermissionStatus.denied,
    this.isLoading = false,
    this.error,
  });

  final List<GalleryItem> items;
  final PermissionStatus permissionStatus;
  final bool isLoading;
  final String? error;

  bool get hasPermission => permissionStatus == PermissionStatus.granted;

  bool get isPermanentlyDenied =>
      permissionStatus == PermissionStatus.permanentlyDenied;

  GalleryState copyWith({
    List<GalleryItem>? items,
    PermissionStatus? permissionStatus,
    bool? isLoading,
    String? error,
  }) {
    return GalleryState(
      items: items ?? this.items,
      permissionStatus: permissionStatus ?? this.permissionStatus,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// ── Notifier ───────────────────────────────────────────────────────────────

class GalleryNotifier extends AsyncNotifier<GalleryState> {
  @override
  Future<GalleryState> build() async {
    final PermissionService permService =
        ref.read(permissionServiceProvider);
    final bool hasPermission = await permService.hasPhotoPermission();

    if (!hasPermission) {
      return const GalleryState(
        permissionStatus: PermissionStatus.denied,
      );
    }

    return _loadImages(PermissionStatus.granted);
  }

  Future<void> requestPermission() async {
    final PermissionService permService =
        ref.read(permissionServiceProvider);
    final PermissionStatus status =
        await permService.requestPhotoPermission();

    if (status.isGranted) {
      state = AsyncData(await _loadImages(status));
    } else {
      state = AsyncData(GalleryState(permissionStatus: status));
    }
  }

  /// Classifies a single item and updates it in the list in-place.
  Future<void> classifyItem(int index) async {
    final GalleryState current =
        state.value ?? const GalleryState();
    if (index < 0 || index >= current.items.length) return;

    final GalleryItem item = current.items[index];
    if (item.isScanned) return;

    final GalleryRepository repo = ref.read(galleryRepositoryProvider);
    try {
      final GalleryItem classified = await repo.classifyItem(item);
      final List<GalleryItem> updated = List.of(current.items);
      updated[index] = classified;
      state = AsyncData(current.copyWith(items: updated));
    } on Exception {
      // Model missing or inference error — mark item safe so spinner clears.
      final GalleryItem fallback = item.withResult(
        ScanResult.fromClassification(imagePath: item.imagePath, score: 0.0),
      );
      final List<GalleryItem> updated = List.of(current.items);
      updated[index] = fallback;
      state = AsyncData(current.copyWith(items: updated));
    }
  }

  Future<GalleryState> _loadImages(PermissionStatus status) async {
    final GalleryRepository repo = ref.read(galleryRepositoryProvider);
    try {
      final List<GalleryItem> items =
          await repo.getRecentGalleryItems();
      return GalleryState(
        items: items,
        permissionStatus: status,
      );
    } on Exception catch (e) {
      return GalleryState(
        permissionStatus: status,
        error: e.toString(),
      );
    }
  }
}

final galleryProvider =
    AsyncNotifierProvider<GalleryNotifier, GalleryState>(GalleryNotifier.new);
