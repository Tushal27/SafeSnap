import 'package:flutter/material.dart';

import '../../../scanner/providers/scanner_provider.dart';

class ScanSummaryWidget extends StatelessWidget {
  const ScanSummaryWidget({super.key, required this.scanState});

  final ScanState scanState;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      color: theme.colorScheme.surfaceContainerHighest,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Scan summary',
              style: theme.textTheme.titleSmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _StatTile(
                  label: 'Last scan',
                  value: _formatLastScan(scanState.lastScanTime),
                ),
                const SizedBox(width: 16),
                _StatTile(
                  label: 'Scanned today',
                  value: '${scanState.scannedImages}',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatLastScan(DateTime? lastScanAt) {
    if (lastScanAt == null) return 'Never';
    final diff = DateTime.now().difference(lastScanAt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inHours < 1) return '${diff.inMinutes}m ago';
    if (diff.inDays < 1) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value,
              style: theme.textTheme.headlineSmall
                  ?.copyWith(fontWeight: FontWeight.bold)),
          Text(label,
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
        ],
      ),
    );
  }
}
