export async function parallel<T>(
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  return Promise.all(
    tasks.map((task) => task())
  );
}

export async function parallelSettled<T>(
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  const settled =
    await Promise.allSettled(
      tasks.map((task) => task())
    );

  return settled.flatMap((result) =>
    result.status === "fulfilled"
      ? [result.value]
      : []
  );
}