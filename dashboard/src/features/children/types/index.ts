import { z } from 'zod';

export const ChildSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  deviceId: z.string(),
  pairedAt: z.string(),
  lastSeenAt: z.string().nullable(),
  isOnline: z.boolean(),
});

export const ChildrenListSchema = z.array(ChildSchema);

export const PairChildResponseSchema = z.object({
  pairingCode: z.string(),
  qrData: z.string(), // the data to encode in the QR
  expiresAt: z.string(),
});

export type PairChildResponse = z.infer<typeof PairChildResponseSchema>;
