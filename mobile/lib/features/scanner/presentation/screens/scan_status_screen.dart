import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart' show DateFormat;
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/features/scanner/presentation/widgets/scan_progress_card.dart';
import 'package:safesnap/features/scanner/providers/scanner_provider.dart';

/// Shows the current (or most recent) scan's progress and summary statistics.
class ScanStatusScreen extends ConsumerWidget {
  const ScanStatusScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<ScanState> asyncState = ref.watch(scannerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Status'),
        centerTitle: true,
      ),
      body: asyncState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (Object e, _) => _ErrorView(message: e.toString()),
        data: (ScanState state) => _ScanStatusBody(state: state),
      ),
    );
  }
}

class _ScanStatusBody extends ConsumerWidget {
  const _ScanStatusBody({required this.state});

  final ScanState state;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final TextTheme textTheme = Theme.of(context).textTheme;
    final ColorScheme colors = Theme.of(context).colorScheme;

    return RefreshIndicator(
      onRefresh: () => ref.read(scannerProvider.notifier).startScan(),
      child: ListView(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        children: [
          ScanProgressCard(scanState: state),
          const SizedBox(height: 24),
          _StatCard(
            icon: Icons.photo_library_outlined,
            label: 'Total scanned',
            value: '${state.scannedImages}',
            colors: colors,
            textTheme: textTheme,
          ),
          const SizedBox(height: 12),
          _StatCard(
            icon: Icons.flag_outlined,
            label: 'Flagged images',
            value: '${state.flaggedCount}',
            valueColor: state.flaggedCount > 0 ? colors.error : null,
            colors: colors,
            textTheme: textTheme,
          ),
          const SizedBox(height: 12),
          _StatCard(
            icon: Icons.schedule_outlined,
            label: 'Last scan',
            value: state.lastScanTime != null
                ? DateFormat('MMM d, h:mm a').format(
                    state.lastScanTime!.toLocal(),
                  )
                : 'Never',
            colors: colors,
            textTheme: textTheme,
          ),
          if (state.error != null) ...[
            const SizedBox(height: 16),
            _ErrorBanner(message: state.error!),
          ],
          const SizedBox(height: 32),
          if (!state.isScanning)
            FilledButton.icon(
              onPressed: () =>
                  ref.read(scannerProvider.notifier).startScan(),
              icon: const Icon(Icons.search),
              label: const Text('Scan now'),
            ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.colors,
    required this.textTheme,
    this.valueColor,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;
  final ColorScheme colors;
  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: colors.surfaceContainerLow,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardBorderRadius),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Icon(icon, color: colors.primary),
            const SizedBox(width: 16),
            Expanded(
              child: Text(label, style: textTheme.bodyLarge),
            ),
            Text(
              value,
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: valueColor ?? colors.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final ColorScheme colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.errorContainer,
        borderRadius:
            BorderRadius.circular(AppConstants.cardBorderRadius),
      ),
      child: Row(
        children: [
          Icon(Icons.warning_amber_rounded,
              color: colors.onErrorContainer, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: colors.onErrorContainer),
            ),
          ),
        ],
      ),
    );
  }
}
