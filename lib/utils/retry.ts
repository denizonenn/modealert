export interface RetryOptions {
  retries?: number;

  delay?: number;
}

function sleep(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 500,
  } = options;

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      await sleep(
        delay * (attempt + 1)
      );
    }
  }

  throw lastError;
}