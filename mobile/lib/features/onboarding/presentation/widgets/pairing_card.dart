import 'package:flutter/material.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/features/onboarding/providers/onboarding_provider.dart';

/// A selection card displayed on the onboarding screen for choosing a role.
class RoleSelectionCard extends StatelessWidget {
  const RoleSelectionCard({
    super.key,
    required this.role,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final DeviceRole role;
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final ColorScheme colors = Theme.of(context).colorScheme;
    final TextTheme textTheme = Theme.of(context).textTheme;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        borderRadius:
            BorderRadius.circular(AppConstants.cardBorderRadius),
        border: Border.all(
          color: isSelected ? colors.primary : colors.outlineVariant,
          width: isSelected ? 2 : 1,
        ),
        color: isSelected
            ? colors.primaryContainer.withOpacity(0.3)
            : colors.surface,
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius:
            BorderRadius.circular(AppConstants.cardBorderRadius),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.defaultPadding),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? colors.primary
                      : colors.surfaceContainerHighest,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color:
                      isSelected ? colors.onPrimary : colors.onSurfaceVariant,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isSelected ? colors.primary : null,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: textTheme.bodySmall
                          ?.copyWith(color: colors.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                Icon(Icons.check_circle, color: colors.primary),
            ],
          ),
        ),
      ),
    );
  }
}
