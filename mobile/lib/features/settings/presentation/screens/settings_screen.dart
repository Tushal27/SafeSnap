import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/features/settings/data/settings_repository.dart';
import 'package:safesnap/features/settings/presentation/widgets/sensitivity_slider.dart';
import 'package:safesnap/features/settings/providers/settings_provider.dart';

/// Allows the parent to configure detection sensitivity, email, and sync rate.
class SettingsScreen extends HookConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<AppSettings> asyncSettings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: true,
      ),
      body: asyncSettings.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (Object e, _) => Center(child: Text('Failed to load: $e')),
        data: (AppSettings settings) =>
            _SettingsForm(initialSettings: settings),
      ),
    );
  }
}

class _SettingsForm extends HookConsumerWidget {
  const _SettingsForm({required this.initialSettings});

  final AppSettings initialSettings;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final TextEditingController emailController =
        useTextEditingController(text: initialSettings.parentEmail);
    final ValueNotifier<double> threshold =
        useState(initialSettings.sensitivityThreshold);
    final ValueNotifier<int> syncFrequency =
        useState(initialSettings.syncFrequencyMinutes);
    final ValueNotifier<bool> isSaving = useState(false);
    final ValueNotifier<bool> saved = useState(false);

    Future<void> handleSave() async {
      isSaving.value = true;
      saved.value = false;
      try {
        await ref.read(settingsProvider.notifier).saveAll(
              AppSettings(
                sensitivityThreshold: threshold.value,
                parentEmail: emailController.text.trim(),
                syncFrequencyMinutes: syncFrequency.value,
              ),
            );
        saved.value = true;
      } finally {
        isSaving.value = false;
      }
    }

    return ListView(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      children: [
        _SectionHeader(title: 'Detection'),
        const SizedBox(height: 8),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius:
                BorderRadius.circular(AppConstants.cardBorderRadius),
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppConstants.defaultPadding),
            child: SensitivitySlider(
              value: threshold.value,
              onChanged: (double v) => threshold.value = v,
            ),
          ),
        ),
        const SizedBox(height: 24),
        _SectionHeader(title: 'Notifications'),
        const SizedBox(height: 8),
        TextField(
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Parent email',
            hintText: 'you@example.com',
            prefixIcon: Icon(Icons.email_outlined),
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 24),
        _SectionHeader(title: 'Background sync'),
        const SizedBox(height: 8),
        _SyncFrequencyDropdown(
          value: syncFrequency.value,
          onChanged: (int v) => syncFrequency.value = v,
        ),
        const SizedBox(height: 32),
        if (saved.value)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle,
                    color: Theme.of(context).colorScheme.primary, size: 18),
                const SizedBox(width: 6),
                const Text('Settings saved'),
              ],
            ),
          ),
        FilledButton(
          onPressed: isSaving.value ? null : handleSave,
          child: isSaving.value
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('Save settings'),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title.toUpperCase(),
      style: Theme.of(context).textTheme.labelSmall?.copyWith(
            letterSpacing: 1.2,
            color: Theme.of(context).colorScheme.primary,
            fontWeight: FontWeight.w700,
          ),
    );
  }
}

class _SyncFrequencyDropdown extends StatelessWidget {
  const _SyncFrequencyDropdown({
    required this.value,
    required this.onChanged,
  });

  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<int>(
      value: value,
      decoration: const InputDecoration(
        labelText: 'Sync frequency',
        prefixIcon: Icon(Icons.sync),
        border: OutlineInputBorder(),
      ),
      items: AppConstants.syncFrequencyOptions
          .map(
            (int minutes) => DropdownMenuItem<int>(
              value: minutes,
              child: Text(_label(minutes)),
            ),
          )
          .toList(),
      onChanged: (int? v) {
        if (v != null) onChanged(v);
      },
    );
  }

  String _label(int minutes) {
    if (minutes < 60) return '$minutes min';
    final int hours = minutes ~/ 60;
    return hours == 1 ? '1 hour' : '$hours hours';
  }
}
