import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/features/onboarding/presentation/widgets/pairing_card.dart';
import 'package:safesnap/features/onboarding/providers/onboarding_provider.dart';

/// Entry screen: lets the user choose Parent or Child device role.
///
/// Child flow  → navigates to [QrScanScreen].
/// Parent flow → shows inline registration form.
class OnboardingScreen extends HookConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final OnboardingState state = ref.watch(onboardingProvider);

    return Scaffold(
      body: SafeArea(
        child: state.role == DeviceRole.parent
            ? _ParentRegistrationView(isLoading: state.isLoading, error: state.error)
            : _RoleSelectionView(selectedRole: state.role),
      ),
    );
  }
}

// ─── Role selection ────────────────────────────────────────────────────────

class _RoleSelectionView extends ConsumerWidget {
  const _RoleSelectionView({required this.selectedRole});

  final DeviceRole selectedRole;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final TextTheme textTheme = Theme.of(context).textTheme;
    final ColorScheme colors = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 40),
          Icon(Icons.shield, size: 64, color: colors.primary),
          const SizedBox(height: 16),
          Text(
            'SafeSnap',
            style: textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: colors.primary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Who is using this device?',
            style: textTheme.titleMedium
                ?.copyWith(color: colors.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          RoleSelectionCard(
            role: DeviceRole.child,
            title: "Child's device",
            subtitle: 'Scan the QR code from the parent app to pair.',
            icon: Icons.child_care,
            isSelected: selectedRole == DeviceRole.child,
            onTap: () => ref
                .read(onboardingProvider.notifier)
                .selectRole(DeviceRole.child),
          ),
          const SizedBox(height: 16),
          RoleSelectionCard(
            role: DeviceRole.parent,
            title: "Parent's account",
            subtitle: 'Register to manage and monitor your child\'s device.',
            icon: Icons.supervised_user_circle_outlined,
            isSelected: selectedRole == DeviceRole.parent,
            onTap: () => ref
                .read(onboardingProvider.notifier)
                .selectRole(DeviceRole.parent),
          ),
          const Spacer(),
          if (selectedRole == DeviceRole.child)
            FilledButton.icon(
              onPressed: () => context.push(AppConstants.routeQrScan),
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Scan pairing code'),
            ),
          if (selectedRole == DeviceRole.unselected)
            Text(
              'Select a role to continue',
              textAlign: TextAlign.center,
              style: textTheme.bodySmall
                  ?.copyWith(color: colors.onSurfaceVariant),
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

// ─── Parent registration ───────────────────────────────────────────────────

class _ParentRegistrationView extends HookConsumerWidget {
  const _ParentRegistrationView({
    required this.isLoading,
    required this.error,
  });

  final bool isLoading;
  final String? error;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final TextEditingController emailController = useTextEditingController();
    final TextEditingController passwordController =
        useTextEditingController();
    final ValueNotifier<bool> obscurePassword = useState(true);
    final GlobalKey<FormState> formKey =
        useMemoized(GlobalKey<FormState>.new);

    Future<void> handleSubmit() async {
      if (!formKey.currentState!.validate()) return;
      await ref.read(onboardingProvider.notifier).registerParent(
            email: emailController.text.trim(),
            password: passwordController.text,
          );
      final OnboardingState state = ref.read(onboardingProvider);
      if (state.isPaired && context.mounted) {
        context.go(AppConstants.routeDashboard);
      }
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),
            IconButton(
              onPressed: () => ref
                  .read(onboardingProvider.notifier)
                  .selectRole(DeviceRole.unselected),
              icon: const Icon(Icons.arrow_back),
              alignment: Alignment.centerLeft,
              padding: EdgeInsets.zero,
            ),
            const SizedBox(height: 16),
            Text(
              'Create parent account',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your account lets you review alerts across all paired devices.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 32),
            TextFormField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Email address',
                prefixIcon: Icon(Icons.email_outlined),
                border: OutlineInputBorder(),
              ),
              validator: _validateEmail,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: passwordController,
              obscureText: obscurePassword.value,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => handleSubmit(),
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outlined),
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(
                    obscurePassword.value
                        ? Icons.visibility_off
                        : Icons.visibility,
                  ),
                  onPressed: () =>
                      obscurePassword.value = !obscurePassword.value,
                ),
              ),
              validator: _validatePassword,
            ),
            if (error != null) ...[
              const SizedBox(height: 16),
              _ErrorBanner(message: error!),
            ],
            const SizedBox(height: 32),
            FilledButton(
              onPressed: isLoading ? null : handleSubmit,
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Create account'),
            ),
          ],
        ),
      ),
    );
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    final bool valid = RegExp(
      r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$',
    ).hasMatch(value.trim());
    return valid ? null : 'Enter a valid email address';
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
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
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: colors.onErrorContainer),
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
