import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:workmanager/workmanager.dart';

import 'core/constants/app_constants.dart';
import 'core/services/background_scan_service.dart';
import 'features/onboarding/presentation/screens/onboarding_screen.dart';
import 'features/onboarding/presentation/screens/qr_scan_screen.dart';
import 'features/dashboard/presentation/screens/child_dashboard_screen.dart';
import 'features/gallery/presentation/screens/gallery_screen.dart';
import 'features/scanner/presentation/screens/scan_status_screen.dart';
import 'features/settings/presentation/screens/settings_screen.dart';

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((taskName, inputData) async {
    if (taskName == AppConstants.backgroundTaskName) {
      await BackgroundScanService.runScan();
    }
    return true;
  });
}

final _router = GoRouter(
  initialLocation: AppConstants.routeOnboarding,
  routes: [
    GoRoute(
      path: AppConstants.routeOnboarding,
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(
      path: AppConstants.routeQrScan,
      builder: (context, state) => const QrScanScreen(),
    ),
    GoRoute(
      path: AppConstants.routeDashboard,
      builder: (context, state) => const ChildDashboardScreen(),
    ),
    GoRoute(
      path: AppConstants.routeGallery,
      builder: (context, state) => const GalleryScreen(),
    ),
    GoRoute(
      path: AppConstants.routeScanStatus,
      builder: (context, state) => const ScanStatusScreen(),
    ),
    GoRoute(
      path: AppConstants.routeSettings,
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
  runApp(const ProviderScope(child: SafeSnapApp()));
}

class SafeSnapApp extends StatelessWidget {
  const SafeSnapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SafeSnap',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
      ),
      themeMode: ThemeMode.system,
    );
  }
}
