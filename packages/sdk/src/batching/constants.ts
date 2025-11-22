export interface BatchingConfig {
  maxBatchEvents: number;
  maxRetries: number;
  baseBackoffMs: number;
  maxQueueSize: number;
}

export const DEFAULT_BATCHING_CONFIG: BatchingConfig = {
  maxBatchEvents: 50,
  maxRetries: 5,
  baseBackoffMs: 300,
  maxQueueSize: 300,
};
