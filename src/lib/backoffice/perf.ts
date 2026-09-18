export type PerfTimer = {
  mark: (label: string, metadata?: PerfMetadata) => void;
  end: (metadata?: PerfMetadata) => void;
};

export type PerfMetadata = {
  authenticated?: boolean;
  configured?: boolean;
  calls?: number;
  rows?: number;
  ok?: boolean;
};

function isPerfDebugEnabled(): boolean {
  return process.env.BACKOFFICE_PERF_DEBUG === "true";
}

function createCorrelationId(): string {
  return Math.random().toString(36).slice(2, 8);
}

function writeMeasurement(
  correlationId: string,
  operation: string,
  label: string,
  duration: number,
  metadata?: PerfMetadata,
): void {
  const suffix = metadata
    ? ` ${Object.entries(metadata)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(" ")}`
    : "";

  console.info(
    `[perf][${correlationId}] ${operation}.${label} ${duration.toFixed(1)}ms${suffix}`,
  );
}

/**
 * Lightweight, opt-in server timing. It is deliberately a no-op apart from
 * taking a timestamp while BACKOFFICE_PERF_DEBUG is disabled.
 */
export function startPerf(operation: string): PerfTimer {
  const enabled = isPerfDebugEnabled();
  const startedAt = performance.now();
  const correlationId = enabled ? createCorrelationId() : "";
  let previousAt = startedAt;

  return {
    mark(label, metadata) {
      if (!enabled) return;
      const now = performance.now();
      writeMeasurement(correlationId, operation, label, now - previousAt, metadata);
      previousAt = now;
    },
    end(metadata) {
      if (!enabled) return;
      writeMeasurement(correlationId, operation, "total", performance.now() - startedAt, metadata);
    },
  };
}

export async function withPerf<T>(
  operation: string,
  callback: (timer: PerfTimer) => Promise<T>,
): Promise<T> {
  const timer = startPerf(operation);
  try {
    return await callback(timer);
  } finally {
    timer.end();
  }
}
