import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:safesnap/features/gallery/data/gallery_repository.dart';
import 'package:safesnap/features/gallery/presentation/widgets/image_grid.dart';
import 'package:safesnap/features/gallery/presentation/widgets/permission_prompt.dart';
import 'package:safesnap/features/gallery/providers/gallery_provider.dart';

/// Displays the device photo library with scan-status overlays.
///
/// Handles permission gating: shows [PermissionPromptCard] when access is
/// denied and the grid once permission is granted.
class GalleryScreen extends ConsumerWidget {
  const GalleryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<GalleryState> asyncState =
        ref.watch(galleryProvider);

    return Scaffold(
      body: asyncState.when(
        loading: () => const CustomScrollView(
          slivers: [
            _GalleryAppBar(),
            SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            ),
          ],
        ),
        error: (Object e, _) => CustomScrollView(
          slivers: [
            const _GalleryAppBar(),
            SliverFillRemaining(
              child: Center(child: Text('Error: $e')),
            ),
          ],
        ),
        data: (GalleryState state) => _GalleryBody(state: state),
      ),
    );
  }
}

class _GalleryBody extends ConsumerWidget {
  const _GalleryBody({required this.state});

  final GalleryState state;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!state.hasPermission) {
      return CustomScrollView(
        slivers: [
          const _GalleryAppBar(),
          SliverFillRemaining(
            child: PermissionPromptCard(
              isPermanentlyDenied: state.isPermanentlyDenied,
              onRequestPermission: () =>
                  ref.read(galleryProvider.notifier).requestPermission(),
            ),
          ),
        ],
      );
    }

    if (state.items.isEmpty) {
      return const CustomScrollView(
        slivers: [
          _GalleryAppBar(),
          SliverFillRemaining(
            child: Center(child: Text('No photos found.')),
          ),
        ],
      );
    }

    return CustomScrollView(
      slivers: [
        const _GalleryAppBar(),
        _GallerySummaryBar(
          total: state.items.length,
          scanned: state.items.where((GalleryItem i) => i.isScanned).length,
        ),
        ImageGrid(
          items: state.items,
          onItemVisible: (int index) =>
              ref.read(galleryProvider.notifier).classifyItem(index),
        ),
      ],
    );
  }
}

class _GalleryAppBar extends StatelessWidget {
  const _GalleryAppBar();

  @override
  Widget build(BuildContext context) {
    return const SliverAppBar(
      title: Text('Photo Gallery'),
      centerTitle: true,
      floating: true,
      snap: true,
    );
  }
}

class _GallerySummaryBar extends StatelessWidget {
  const _GallerySummaryBar({
    required this.total,
    required this.scanned,
  });

  final int total;
  final int scanned;

  @override
  Widget build(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Text(
          '$scanned / $total photos scanned',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
      ),
    );
  }
}
