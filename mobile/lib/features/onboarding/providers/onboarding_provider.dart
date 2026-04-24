import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:safesnap/core/models/child_info.dart';
import 'package:safesnap/features/onboarding/data/onboarding_repository.dart';

// ── Dependency ─────────────────────────────────────────────────────────────

final onboardingRepositoryProvider =
    Provider<OnboardingRepository>((Ref ref) {
  return OnboardingRepository();
});

// ── State ──────────────────────────────────────────────────────────────────

enum DeviceRole { unselected, child, parent }

class OnboardingState {
  const OnboardingState({
    this.role = DeviceRole.unselected,
    this.isLoading = false,
    this.isPaired = false,
    this.childInfo,
    this.error,
  });

  final DeviceRole role;
  final bool isLoading;
  final bool isPaired;
  final ChildInfo? childInfo;
  final String? error;

  OnboardingState copyWith({
    DeviceRole? role,
    bool? isLoading,
    bool? isPaired,
    ChildInfo? childInfo,
    String? error,
  }) {
    return OnboardingState(
      role: role ?? this.role,
      isLoading: isLoading ?? this.isLoading,
      isPaired: isPaired ?? this.isPaired,
      childInfo: childInfo ?? this.childInfo,
      error: error,
    );
  }
}

// ── Notifier ───────────────────────────────────────────────────────────────

class OnboardingNotifier extends Notifier<OnboardingState> {
  @override
  OnboardingState build() => const OnboardingState();

  void selectRole(DeviceRole role) {
    state = state.copyWith(role: role, error: null);
  }

  /// Called after the QR scanner decodes a pairing token.
  Future<void> pairChildDevice(String pairingToken) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final OnboardingRepository repo =
          ref.read(onboardingRepositoryProvider);
      final PairingResult result = await repo.pairDevice(pairingToken);
      state = state.copyWith(
        isLoading: false,
        isPaired: true,
        childInfo: result.childInfo,
      );
    } on Exception catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _friendlyError(e),
      );
    }
  }

  /// Called on parent registration form submit.
  Future<void> registerParent({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final OnboardingRepository repo =
          ref.read(onboardingRepositoryProvider);
      await repo.registerParent(email: email, password: password);
      state = state.copyWith(isLoading: false, isPaired: true);
    } on Exception catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _friendlyError(e),
      );
    }
  }

  void clearError() => state = state.copyWith(error: null);

  String _friendlyError(Exception e) {
    final String msg = e.toString();
    if (msg.contains('SocketException') ||
        msg.contains('Connection refused')) {
      return 'Cannot reach server. Check your connection and try again.';
    }
    if (msg.contains('401') || msg.contains('Unauthorized')) {
      return 'Invalid pairing code. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }
}

final onboardingProvider =
    NotifierProvider<OnboardingNotifier, OnboardingState>(
  OnboardingNotifier.new,
);
