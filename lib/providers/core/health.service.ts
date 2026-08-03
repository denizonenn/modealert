import {
  getProviders,
} from "./registry";

export const providerHealthService = {
  async check() {
    const providers =
      getProviders();

    return providers.map(
      (provider) => ({
        id: provider.id,

        name: provider.name,

        enabled:
          provider.enabled,
      })
    );
  },
};