/**
 * Attach `PerformanceObserver`s for LCP and CLS and log them to the console.
 *
 * Used on the catalogue route to surface the two core metrics during dev.
 * Returns a disconnect function (wire it to `DestroyRef`). No-ops where the
 * API is unavailable (older browsers / SSR).
 */
export function observeWebVitals(log: (message: string) => void = console.log): () => void {
  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const observers: PerformanceObserver[] = [];

  // Largest Contentful Paint — report the latest candidate.
  try {
    const lcp = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };
      const value = last.renderTime || last.loadTime || last.startTime;
      log(`[web-vitals] LCP: ${Math.round(value)} ms`);
    });
    lcp.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcp);
  } catch {
    // type unsupported — ignore
  }

  // Cumulative Layout Shift — accumulate non-input shifts.
  try {
    let cls = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & { value: number; hadRecentInput?: boolean }
      >) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      log(`[web-vitals] CLS: ${cls.toFixed(4)}`);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);
  } catch {
    // type unsupported — ignore
  }

  return () => observers.forEach((o) => o.disconnect());
}
