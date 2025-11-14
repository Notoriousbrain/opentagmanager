export interface EventRow {
  project_id: string;
  type: string;
  project_name?: string | null;
  region?: string | null;
  props?: Record<string, unknown> | null;
  occurred_at: string;
}
