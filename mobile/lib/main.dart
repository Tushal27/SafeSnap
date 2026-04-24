import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workmanager/workmanager.dart';

import 'core/constants/app_constants.dart';
import 'core/services/background_scan_service.dart';
import 'features/onboarding/presentation/screens/onboarding_screen.dart';
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

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
  runApp(const ProviderScope(child: SafeSnapApp()));
}

class SafeSnapApp extends StatelessWidget {
  const SafeSnapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SafeSnap',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E8A78),
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E8A78),
          brightness: Brightness.dark,
        ),
      ),
      themeMode: ThemeMode.system,
      initialRoute: AppConstants.routeOnboarding,
      routes: {
        AppConstants.routeOnboarding: (_) => const OnboardingScreen(),
        AppConstants.routeDashboard: (_) => const ChildDashboardScreen(),
        AppConstants.routeGallery: (_) => const GalleryScreen(),
        AppConstants.routeScanStatus: (_) => const ScanStatusScreen(),
        AppConstants.routeSettings: (_) => const SettingsScreen(),
      },
    );
  }
}
