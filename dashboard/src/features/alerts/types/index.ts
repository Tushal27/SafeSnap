import { z } from 'zod';

export const AlertSchema = z.object({
  id: z.string(),
  childId: z.string(),
  timestamp: z.string(),
  severityScore: z.number().min(0).max(1),
  imageHash: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  acknowledged: z.boolean(),
  acknowledgedAt: z.string().nullable(),
});

export const AlertsPageSchema = z.object({
  items: z.array(AlertSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean(),
});

export const AcknowledgeResponseSchema = z.object({
  id: z.string(),
  acknowledged: z.literal(true),
  acknowledgedAt: z.string(),
});

export type AlertsPage = z.infer<typeof AlertsPageSchema>;
export type AcknowledgeResponse = z.infer<typeof AcknowledgeResponseSchema>;

export interface AlertsFilters {
  page: number;
  pageSize: number;
  severity?: string;
  childId?: string;
  acknowledged?: boolean;
}
