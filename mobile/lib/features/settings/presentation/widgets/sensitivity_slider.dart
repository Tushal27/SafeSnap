import 'package:flutter/material.dart';

/// A labelled slider for adjusting the NSFW detection sensitivity threshold.
///
/// The slider range is [0.5, 0.95].  Lower values flag more images (higher
/// sensitivity); higher values are more permissive.
class SensitivitySlider extends StatelessWidget {
  const SensitivitySlider({
    super.key,
    required this.value,
    required this.onChanged,
  });

  /// Current threshold value, must be in [0.5, 0.95].
  final double value;

  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    final ColorScheme colors = Theme.of(context).colorScheme;
    final TextTheme textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Detection sensitivity',
              style: textTheme.titleSmall,
            ),
            _ThresholdChip(value: value, colors: colors),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          _sensitivityDescription(value),
          style: textTheme.bodySmall
              ?.copyWith(color: colors.onSurfaceVariant),
        ),
        Slider(
          value: value,
          min: 0.5,
          max: 0.95,
          divisions: 45,
          label: value.toStringAsFixed(2),
          onChanged: (double v) => onChanged(
            double.parse(v.toStringAsFixed(2)),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'More sensitive',
                style: textTheme.labelSmall
                    ?.copyWith(color: colors.onSurfaceVariant),
              ),
              Text(
                'Less sensitive',
                style: textTheme.labelSmall
                    ?.copyWith(color: colors.onSurfaceVariant),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _sensitivityDescription(double threshold) {
    if (threshold < 0.60) {
      return 'High sensitivity — flags more content, may produce false positives.';
    } else if (threshold < 0.75) {
      return 'Balanced — recommended for most families.';
    } else {
      return 'Low sensitivity — only flags very explicit content.';
    }
  }
}

class _ThresholdChip extends StatelessWidget {
  const _ThresholdChip({required this.value, required this.colors});

  final double value;
  final ColorScheme colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: colors.primaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        value.toStringAsFixed(2),
        style: TextStyle(
          color: colors.onPrimaryContainer,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}
