import { retry } from "@/lib/utils/retry";

interface RequestOptions
  extends RequestInit {
  timeout?: number;

  retries?: number;
}

export async function http<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeout = 10_000,
    retries = 3,
    ...fetchOptions
  } = options;

  return retry(
    async () => {
      const controller =
        new AbortController();

      const timer = setTimeout(
        () => controller.abort(),
        timeout
      );

      try {
        const response =
          await fetch(url, {
            ...fetchOptions,
            signal:
              controller.signal,
          });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status} ${response.statusText}`
          );
        }

        return (await response.json()) as T;
      } finally {
        clearTimeout(timer);
      }
    },
    {
      retries,
    }
  );
}