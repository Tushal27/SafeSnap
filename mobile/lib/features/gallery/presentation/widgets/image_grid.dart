import 'dart:io';

import 'package:flutter/material.dart';
import 'package:safesnap/core/models/scan_result.dart';
import 'package:safesnap/features/gallery/data/gallery_repository.dart';

/// Renders a grid of device images with a severity-colour overlay badge.
class ImageGrid extends StatelessWidget {
  const ImageGrid({
    super.key,
    required this.items,
    required this.onItemVisible,
  });

  final List<GalleryItem> items;

  /// Called when a cell becomes visible, triggering lazy classification.
  final ValueChanged<int> onItemVisible;

  @override
  Widget build(BuildContext context) {
    return SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 2,
        mainAxisSpacing: 2,
      ),
      delegate: SliverChildBuilderDelegate(
        (BuildContext context, int index) {
          return _ImageCell(
            item: items[index],
            index: index,
            onVisible: onItemVisible,
          );
        },
        childCount: items.length,
      ),
    );
  }
}

class _ImageCell extends StatefulWidget {
  const _ImageCell({
    required this.item,
    required this.index,
    required this.onVisible,
  });

  final GalleryItem item;
  final int index;
  final ValueChanged<int> onVisible;

  @override
  State<_ImageCell> createState() => _ImageCellState();
}

class _ImageCellState extends State<_ImageCell> {
  @override
  void initState() {
    super.initState();
    // Trigger classification as soon as the cell is built.
    if (!widget.item.isScanned) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        widget.onVisible(widget.index);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        _ImageTile(path: widget.item.imagePath),
        if (widget.item.isScanned && widget.item.scanResult != null)
          Align(
            alignment: Alignment.topRight,
            child: _SeverityBadge(
              severity: widget.item.scanResult!.severity,
            ),
          ),
        if (!widget.item.isScanned)
          const Align(
            alignment: Alignment.topRight,
            child: _LoadingIndicator(),
          ),
      ],
    );
  }
}

class _ImageTile extends StatelessWidget {
  const _ImageTile({required this.path});

  final String path;

  @override
  Widget build(BuildContext context) {
    return Image.file(
      File(path),
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => Container(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: Icon(
          Icons.broken_image_outlined,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _SeverityBadge extends StatelessWidget {
  const _SeverityBadge({required this.severity});

  final SeverityLevel severity;

  @override
  Widget build(BuildContext context) {
    if (severity == SeverityLevel.safe) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.all(4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
        decoration: BoxDecoration(
          color: _colorFor(severity, Theme.of(context).colorScheme),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          severity.displayLabel[0], // single character: L / M / H / C
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 10,
          ),
        ),
      ),
    );
  }

  Color _colorFor(SeverityLevel level, ColorScheme colors) {
    switch (level) {
      case SeverityLevel.safe:
        return colors.tertiary;
      case SeverityLevel.low:
        return Colors.amber.shade700;
      case SeverityLevel.medium:
        return Colors.orange.shade700;
      case SeverityLevel.high:
      case SeverityLevel.critical:
        return colors.error;
    }
  }
}

class _LoadingIndicator extends StatelessWidget {
  const _LoadingIndicator();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(4),
      child: SizedBox(
        width: 14,
        height: 14,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }
}
