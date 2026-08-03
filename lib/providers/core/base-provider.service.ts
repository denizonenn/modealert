import type {
  ProviderEvent,
} from "./provider";

export abstract class BaseProviderService {
  protected abstract fetchEvents(): Promise<
    ProviderEvent[]
  >;

  async getEvents(): Promise<
    ProviderEvent[]
  > {
    return this.fetchEvents();
  }
}