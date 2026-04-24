import 'package:flutter/material.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/features/scanner/providers/scanner_provider.dart';

/// Displays live scanning progress: progress bar, counts, and status text.
class ScanProgressCard extends StatelessWidget {
  const ScanProgressCard({
    super.key,
    required this.scanState,
  });

  final ScanState scanState;

  @override
  Widget build(BuildContext context) {
    final ColorScheme colors = Theme.of(context).colorScheme;
    final TextTheme textTheme = Theme.of(context).textTheme;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius:
            BorderRadius.circular(AppConstants.cardBorderRadius),
      ),
      elevation: 0,
      color: colors.surfaceContainerHighest,
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _StatusHeader(
              isScanning: scanState.isScanning,
              colors: colors,
              textTheme: textTheme,
            ),
            const SizedBox(height: 16),
            _ProgressBar(progress: scanState.progress, colors: colors),
            const SizedBox(height: 12),
            _CountRow(
              scanned: scanState.scannedImages,
              total: scanState.totalImages,
              flagged: scanState.flaggedCount,
              textTheme: textTheme,
              colors: colors,
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusHeader extends StatelessWidget {
  const _StatusHeader({
    required this.isScanning,
    required this.colors,
    required this.textTheme,
  });

  final bool isScanning;
  final ColorScheme colors;
  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          isScanning ? Icons.radar : Icons.check_circle_outline,
          color: isScanning ? colors.primary : colors.tertiary,
        ),
        const SizedBox(width: 8),
        Text(
          isScanning ? 'Scanning photos…' : 'Scan complete',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        if (isScanning) ...[
          const SizedBox(width: 8),
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: colors.primary,
            ),
          ),
        ],
      ],
    );
  }
}

class _ProgressBar extends StatelessWidget {
  const _ProgressBar({required this.progress, required this.colors});

  final double progress;
  final ColorScheme colors;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: LinearProgressIndicator(
        value: progress,
        minHeight: 8,
        backgroundColor: colors.surfaceContainerLow,
        color: colors.primary,
      ),
    );
  }
}

class _CountRow extends StatelessWidget {
  const _CountRow({
    required this.scanned,
    required this.total,
    required this.flagged,
    required this.textTheme,
    required this.colors,
  });

  final int scanned;
  final int total;
  final int flagged;
  final TextTheme textTheme;
  final ColorScheme colors;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          '$scanned / $total images',
          style: textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
        ),
        if (flagged > 0)
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: colors.errorContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '$flagged flagged',
              style: textTheme.labelSmall?.copyWith(
                color: colors.onErrorContainer,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
      ],
    );
  }
}
