import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, interval } from 'rxjs';

/** A single live stock change pushed by the simulated feed. */
export interface StockTick {
  id: number;
  stock: number;
}

/** How often the simulated socket emits a stock change. */
const TICK_MS = 2500;

/**
 * A SIMULATED WebSocket stock feed (`interval` + `Subject`) — no real socket.
 *
 * Consumers register the ids currently on screen via `setPool`; every tick the
 * service nudges a random one's stock and emits a `StockTick`. The product
 * store patches its rows from this stream, so badges update reactively WITHOUT
 * re-fetching the list. The same single stream is reused by the Shop (Task 3).
 */
@Injectable({ providedIn: 'root' })
export class StockStreamService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly _ticks = new Subject<StockTick>();
  /** Live stock changes for whichever ids are currently in the pool. */
  readonly ticks$: Observable<StockTick> = this._ticks.asObservable();

  /** Last-known stock per id — lets us drift a value rather than randomise it. */
  private readonly known = new Map<number, number>();

  constructor() {
    interval(TICK_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitRandom());
  }

  /**
   * Replace the set of ids the feed may touch (typically the visible page).
   * Seeds last-known stock so subsequent ticks drift from a real value.
   */
  setPool(items: ReadonlyArray<{ id: number; stock: number }>): void {
    this.known.clear();
    for (const it of items) {
      this.known.set(it.id, it.stock);
    }
  }

  /** Drift one random pooled id by a small +/- delta and emit it. */
  private emitRandom(): void {
    if (this.known.size === 0) {
      return;
    }
    const ids = [...this.known.keys()];
    const id = ids[Math.floor(Math.random() * ids.length)];
    const current = this.known.get(id) ?? 0;
    const delta = Math.floor(Math.random() * 7) - 3; // -3..+3
    const next = Math.max(0, current + delta);
    this.known.set(id, next);
    this._ticks.next({ id, stock: next });
  }
}
