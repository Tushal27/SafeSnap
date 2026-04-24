/// Describes a paired child device as returned by the pairing API.
class ChildInfo {
  const ChildInfo({
    required this.deviceId,
    required this.deviceName,
    required this.parentEmail,
  });

  /// UUID assigned by the backend during pairing.
  final String deviceId;

  /// Human-readable device name (e.g. "Alex's iPhone").
  final String deviceName;

  /// Parent's email address — displayed on the child dashboard for contact.
  final String parentEmail;

  factory ChildInfo.fromJson(Map<String, dynamic> json) {
    return ChildInfo(
      deviceId: json['deviceId'] as String,
      deviceName: json['deviceName'] as String,
      parentEmail: json['parentEmail'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'deviceId': deviceId,
        'deviceName': deviceName,
        'parentEmail': parentEmail,
      };

  ChildInfo copyWith({
    String? deviceId,
    String? deviceName,
    String? parentEmail,
  }) {
    return ChildInfo(
      deviceId: deviceId ?? this.deviceId,
      deviceName: deviceName ?? this.deviceName,
      parentEmail: parentEmail ?? this.parentEmail,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChildInfo &&
          runtimeType == other.runtimeType &&
          deviceId == other.deviceId;

  @override
  int get hashCode => deviceId.hashCode;

  @override
  String toString() =>
      'ChildInfo(deviceId=$deviceId, deviceName=$deviceName)';
}
