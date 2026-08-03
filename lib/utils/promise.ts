export async function settle<T>(
  promise: Promise<T>
): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    console.error(error);

    return null;
  }
}

export async function settleAll<T>(
  promises: Promise<T>[]
): Promise<Awaited<T>[]> {
  const settled = await Promise.all(
    promises.map(settle)
  );

  return settled.filter(
    (
      value
    ): value is Awaited<T> =>
      value !== null
  );
}