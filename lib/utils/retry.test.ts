import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { retry } from "./retry";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

async function runWithFakeTimers<T>(
  promise: Promise<T>
): Promise<T> {
  const result = promise;

  await vi.runAllTimersAsync();

  return result;
}

describe("retry", () => {
  it("returns the result on the first successful attempt without retrying", async () => {
    const operation = vi
      .fn()
      .mockResolvedValue("ok");

    const result = await runWithFakeTimers(
      retry(operation)
    );

    expect(result).toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries after a failure and succeeds", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("transient")
      )
      .mockResolvedValueOnce("ok");

    const result = await runWithFakeTimers(
      retry(operation, { delay: 10 })
    );

    expect(result).toBe("ok");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("throws the last error once retries are exhausted", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(
        new Error("permanent")
      );

    const result = retry(operation, {
      retries: 2,
      delay: 10,
    });

    // Attach a handler immediately so Node doesn't flag this as an
    // unhandled rejection while the fake timers below are still
    // advancing the retry loop.
    result.catch(() => {});

    await vi.runAllTimersAsync();

    await expect(result).rejects.toThrow(
      "permanent"
    );

    expect(operation).toHaveBeenCalledTimes(3);
  });
});
