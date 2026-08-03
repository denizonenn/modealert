import type {
  EventProvider,
  ProviderEvent,
} from "./provider";

export interface ProviderExecutionResult {
  providerId: string;

  providerName: string;

  events: ProviderEvent[];

  success: boolean;

  duration: number;

  error?: unknown;
}

export async function executeProvider(
  provider: EventProvider
): Promise<ProviderExecutionResult> {
  const startedAt = Date.now();

  try {
    const events =
      await provider.getEvents();

    return {
      providerId: provider.id,

      providerName: provider.name,

      events,

      success: true,

      duration:
        Date.now() - startedAt,
    };
  } catch (error) {
    console.error(
      `[Provider ${provider.name}]`,
      error
    );

    return {
      providerId: provider.id,

      providerName: provider.name,

      events: [],

      success: false,

      duration:
        Date.now() - startedAt,

      error,
    };
  }
}