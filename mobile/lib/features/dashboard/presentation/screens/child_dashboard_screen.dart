import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../scanner/providers/scanner_provider.dart';
import '../widgets/protected_status_card.dart';
import '../widgets/scan_summary_widget.dart';

/// The child-facing home screen.
///
/// Intentionally calm and reassuring — no alert counts, no scary UI.
/// The child simply knows their device is protected.
class ChildDashboardScreen extends ConsumerWidget {
  const ChildDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scanAsyncValue = ref.watch(scannerProvider);
    final scanState = scanAsyncValue.value;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            children: [
              _buildHeader(context),
              const SizedBox(height: 48),
              const ProtectedStatusCard(),
              const SizedBox(height: 32),
              if (scanState != null) ScanSummaryWidget(scanState: scanState),
              const Spacer(),
              _buildNavRow(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'SafeSnap',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.primary,
              ),
        ),
        IconButton(
          icon: const Icon(Icons.settings_outlined),
          onPressed: () => context.push(AppConstants.routeSettings),
          tooltip: 'Settings',
        ),
      ],
    );
  }

  Widget _buildNavRow(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            icon: const Icon(Icons.photo_library_outlined),
            label: const Text('Gallery'),
            onPressed: () => context.push(AppConstants.routeGallery),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            icon: const Icon(Icons.shield_outlined),
            label: const Text('Scan status'),
            onPressed: () => context.push(AppConstants.routeScanStatus),
          ),
        ),
      ],
    );
  }
}
