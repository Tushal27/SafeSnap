import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart' show openAppSettings;

/// Displayed when photo permission is denied or permanently denied.
class PermissionPromptCard extends StatelessWidget {
  const PermissionPromptCard({
    super.key,
    required this.isPermanentlyDenied,
    required this.onRequestPermission,
  });

  final bool isPermanentlyDenied;
  final VoidCallback onRequestPermission;

  @override
  Widget build(BuildContext context) {
    final ColorScheme colors = Theme.of(context).colorScheme;
    final TextTheme textTheme = Theme.of(context).textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.photo_library_outlined,
              size: 72,
              color: colors.primary,
            ),
            const SizedBox(height: 24),
            Text(
              'Photo access needed',
              style: textTheme.headlineSmall
                  ?.copyWith(fontWeight: FontWeight.w700),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              isPermanentlyDenied
                  ? 'You\'ve permanently denied photo access. '
                      'Please enable it in your device Settings so '
                      'SafeSnap can protect your photos.'
                  : 'SafeSnap needs read access to your photo library '
                      'to scan for harmful content. '
                      'No images are ever uploaded.',
              style: textTheme.bodyMedium
                  ?.copyWith(color: colors.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: isPermanentlyDenied
                  ? () => openAppSettings()
                  : onRequestPermission,
              icon: Icon(
                isPermanentlyDenied
                    ? Icons.settings_outlined
                    : Icons.lock_open_outlined,
              ),
              label: Text(
                isPermanentlyDenied ? 'Open settings' : 'Grant access',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
