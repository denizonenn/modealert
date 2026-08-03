type LogLevel =
  | "INFO"
  | "WARN"
  | "ERROR";

function log(
  level: LogLevel,
  message: string,
  meta?: unknown
) {
  const payload = {
    level,

    timestamp:
      new Date().toISOString(),

    message,

    meta,
  };

  console.log(
    JSON.stringify(payload)
  );
}

export const logger = {
  info(
    message: string,
    meta?: unknown
  ) {
    log(
      "INFO",
      message,
      meta
    );
  },

  warn(
    message: string,
    meta?: unknown
  ) {
    log(
      "WARN",
      message,
      meta
    );
  },

  error(
    message: string,
    meta?: unknown
  ) {
    log(
      "ERROR",
      message,
      meta
    );
  },
};