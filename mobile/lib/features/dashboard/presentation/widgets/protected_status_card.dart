import 'package:flutter/material.dart';
import 'package:safesnap/core/constants/app_constants.dart';

/// The prominent "your phone is protected" shield card shown on the child
/// dashboard.  Uses reassuring, child-appropriate language throughout.
class ProtectedStatusCard extends StatelessWidget {
  const ProtectedStatusCard({super.key});

  @override
  Widget build(BuildContext context) {
    final ColorScheme colors = Theme.of(context).colorScheme;
    final TextTheme textTheme = Theme.of(context).textTheme;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardBorderRadius * 2),
      ),
      color: colors.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _AnimatedShieldIcon(colors: colors),
            const SizedBox(height: 24),
            Text(
              'Your phone is protected',
              style: textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w800,
                color: colors.onPrimaryContainer,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'SafeSnap is running quietly in the background, '
              'keeping your phone safe. Everything is working great!',
              style: textTheme.bodyMedium?.copyWith(
                color: colors.onPrimaryContainer.withOpacity(0.8),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _AnimatedShieldIcon extends StatefulWidget {
  const _AnimatedShieldIcon({required this.colors});

  final ColorScheme colors;

  @override
  State<_AnimatedShieldIcon> createState() => _AnimatedShieldIconState();
}

class _AnimatedShieldIconState extends State<_AnimatedShieldIcon>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _pulse,
      child: Container(
        width: AppConstants.shieldIconSize,
        height: AppConstants.shieldIconSize,
        decoration: BoxDecoration(
          color: widget.colors.primary,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: widget.colors.primary.withOpacity(0.4),
              blurRadius: 32,
              spreadRadius: 8,
            ),
          ],
        ),
        child: Icon(
          Icons.shield,
          size: 64,
          color: widget.colors.onPrimary,
        ),
      ),
    );
  }
}
