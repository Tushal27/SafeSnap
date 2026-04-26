import 'dart:io';
import 'dart:typed_data';

import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:safesnap/core/constants/app_constants.dart';
import 'package:safesnap/core/models/scan_result.dart';

/// Runs on-device NSFW image classification using a MobileNet TFLite model.
///
/// Usage:
/// ```dart
/// final classifier = NsfwClassifier();
/// await classifier.loadModel();
/// final result = await classifier.classify('/path/to/image.jpg');
/// classifier.dispose();
/// ```
class NsfwClassifier {
  Interpreter? _interpreter;

  bool get isLoaded => _interpreter != null;

  /// Loads the TFLite model from the app's asset bundle.
  ///
  /// Throws [StateError] if the model has already been loaded.
  Future<void> loadModel() async {
    if (_interpreter != null) {
      throw StateError('NsfwClassifier: model already loaded');
    }
    _interpreter = await Interpreter.fromAsset(
      AppConstants.modelAssetPath,
      options: InterpreterOptions()..threads = 2,
    );
  }

  /// Classifies the image at [imagePath] and returns a [ScanResult].
  ///
  /// Throws [StateError] if [loadModel] has not been called.
  /// Throws [FileSystemException] if the file does not exist.
  Future<ScanResult> classify(String imagePath) async {
    final Interpreter interpreter = _requireInterpreter();

    final File file = File(imagePath);
    if (!file.existsSync()) {
      throw FileSystemException('Image not found', imagePath);
    }

    final Uint8List imageBytes = await file.readAsBytes();
    final double score = _runInference(interpreter, imageBytes);

    return ScanResult.fromClassification(imagePath: imagePath, score: score);
  }

  /// Releases the interpreter resources.
  void dispose() {
    _interpreter?.close();
    _interpreter = null;
  }

  // ─────────────────────────────────────────────────────────────────────────

  Interpreter _requireInterpreter() {
    final Interpreter? interp = _interpreter;
    if (interp == null) {
      throw StateError(
        'NsfwClassifier: call loadModel() before classify()',
      );
    }
    return interp;
  }

  /// Decodes, resizes, normalises the image and runs inference.
  ///
  /// Returns the NSFW probability score in [0.0, 1.0].
  double _runInference(Interpreter interpreter, Uint8List imageBytes) {
    final img.Image? decoded = img.decodeImage(imageBytes);
    if (decoded == null) return 0.0;

    final img.Image resized = img.copyResize(
      decoded,
      width: AppConstants.modelInputSize,
      height: AppConstants.modelInputSize,
      interpolation: img.Interpolation.linear,
    );

    final List<List<List<List<double>>>> input = _buildInputTensor(resized);

    // GantMan mobilenet_v2_140_224 output shape: [1, 5]
    // indices: 0=drawings, 1=hentai, 2=neutral, 3=porn, 4=sexy
    final List<List<double>> output = [
      [0.0, 0.0, 0.0, 0.0, 0.0],
    ];

    interpreter.run(input, output);

    // NSFW score = sum of explicitly adult classes (hentai + porn + sexy)
    final double nsfwScore = output[0][1] + output[0][3] + output[0][4];
    return nsfwScore.clamp(0.0, 1.0);
  }

  /// Converts a decoded [img.Image] into the normalised [0, 1] float tensor
  /// expected by the model: shape [1, 224, 224, 3].
  List<List<List<List<double>>>> _buildInputTensor(img.Image image) {
    const int size = AppConstants.modelInputSize;
    final List<List<List<List<double>>>> tensor = List.generate(
      1,
      (_) => List.generate(
        size,
        (y) => List.generate(
          size,
          (x) {
            final img.Pixel pixel = image.getPixel(x, y);
            return [
              pixel.r / 255.0,
              pixel.g / 255.0,
              pixel.b / 255.0,
            ];
          },
        ),
      ),
    );
    return tensor;
  }
}
