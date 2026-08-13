export interface ClientConfigQueueEntry {
  queueId: number;

  isEnabled: boolean;

  isVisibleInClient: boolean;
}

// The real response bundles hundreds of unrelated client-config keys
// (locale strings, feature flags, UI toggles) under flat dotted names
// like "lol.na1.operational.queues.queueConfigs". Only that one key
// per region is ours to care about — the rest of the payload isn't
// typed since ModeAlert never reads it.
export type ClientConfigResponse = Record<string, unknown>;
