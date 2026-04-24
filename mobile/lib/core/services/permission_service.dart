import 'package:permission_handler/permission_handler.dart';

/// Wraps [permission_handler] to provide typed, testable permission checks.
class PermissionService {
  const PermissionService();

  /// Returns true when the app can access the device photo library.
  Future<bool> hasPhotoPermission() async {
    final PermissionStatus status = await Permission.photos.status;
    // On Android API < 33 the storage permission covers gallery access.
    if (status.isGranted) return true;
    final PermissionStatus storageStatus = await Permission.storage.status;
    return storageStatus.isGranted;
  }

  /// Requests photo/storage access.  Returns the resulting [PermissionStatus].
  Future<PermissionStatus> requestPhotoPermission() async {
    // On Android 13+ use photos permission; fall back to storage for older.
    final PermissionStatus photosStatus = await Permission.photos.request();
    if (photosStatus.isGranted) return photosStatus;
    // Fallback for Android < 13.
    return Permission.storage.request();
  }

  /// Returns true when the camera permission is granted (needed for QR scan).
  Future<bool> hasCameraPermission() async {
    final PermissionStatus status = await Permission.camera.status;
    return status.isGranted;
  }

  /// Requests camera permission and returns the resulting [PermissionStatus].
  Future<PermissionStatus> requestCameraPermission() async {
    return Permission.camera.request();
  }

  /// Opens the operating system app settings screen so the user can manually
  /// grant a permanently denied permission.
  Future<bool> openAppSettings() => openAppSettings();
}
