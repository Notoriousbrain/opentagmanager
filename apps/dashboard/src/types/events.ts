export interface EventRow {
  project_id: string;
  type: string;
  region?: string | null;
  props?: Record<string, unknown> | null;
  occurred_at: string;
}
