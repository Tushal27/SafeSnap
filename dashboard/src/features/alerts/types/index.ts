import { z } from 'zod';

export const AlertSchema = z.object({
  id: z.string(),
  childId: z.string(),
  childDeviceName: z.string().optional(),
  timestamp: z.string(),
  severityScore: z.number().min(0).max(1),
  imageHash: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  acknowledged: z.boolean(),
  acknowledgedAt: z.string().nullable(),
});

// Spring Page<T> response shape
const SpringPageSchema = z.object({
  content: z.array(AlertSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  number: z.number(),   // 0-indexed current page
  size: z.number(),
  last: z.boolean(),
});

// Transform Spring Page into the shape the rest of the app uses
export const AlertsPageSchema = SpringPageSchema.transform((data) => ({
  items: data.content,
  total: data.totalElements,
  page: data.number,
  pageSize: data.size,
  hasMore: !data.last,
}));

export const AcknowledgeResponseSchema = z.object({
  id: z.string(),
  acknowledged: z.literal(true),
  acknowledgedAt: z.string(),
});

export type AlertsPage = {
  items: z.infer<typeof AlertSchema>[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
export type AcknowledgeResponse = z.infer<typeof AcknowledgeResponseSchema>;

export interface AlertsFilters {
  page: number;       // 0-indexed (Spring convention)
  pageSize: number;
  severity?: string;
  childId?: string;
  acknowledged?: boolean;
}
