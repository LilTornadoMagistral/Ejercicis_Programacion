import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { CryptoCard } from '../crypto/crypto-card';
import { CryptoService } from '../core/services/crypto';
import { RouterModule } from '@angular/router';
import { PriceData } from '../core/services/crypto';

@Component({
  standalone: true,
  selector: 'app-live',
  imports: [CommonModule, CryptoCard, RouterModule],
  template: `
  <section class="live-page">
    <div class="controls"><a routerLink="/" class="btn outline">Volver</a></div>
    <div *ngIf="list().length === 0" class="muted">Cargando datos en vivo…</div>
    <div class="grid">
      <div *ngFor="let item of list(); trackBy: trackById">
        <crypto-card
          [item]="item"
          [minThreshold]="getMinThreshold(item.id)"
          [maxThreshold]="getMaxThreshold(item.id)"
          (minThresholdChange)="setMinThreshold(item.id, $event)"
          (maxThresholdChange)="setMaxThreshold(item.id, $event)"
        ></crypto-card>
      </div>
    </div>
  </section>
  `,
  styles: [`.live-page{padding:1rem}
    .controls{margin:12px 0 18px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}`],
})
export class LiveComponent implements OnDestroy {
  private interval = 0;
  private lastNetworkFetch = 0;
  private readonly networkFetchMs = 30000; // fetch from CoinGecko every 30s
  private readonly uiIntervalMs = 200; // update UI every 200ms

  readonly list = signal<PriceData[]>([]);
  private statsWorker: Worker | undefined;
  private thresholds = new Map<string, { min?: number; max?: number }>();

  getMinThreshold(id: string) {
    return this.thresholds.get(id)?.min ?? 0;
  }

  getMaxThreshold(id: string) {
    return this.thresholds.get(id)?.max ?? 0;
  }

  setMinThreshold(id: string, v: number) {
    const cur = this.thresholds.get(id) ?? {};
    cur.min = Number(v) || 0;
    this.thresholds.set(id, cur);
  }

  setMaxThreshold(id: string, v: number) {
    const cur = this.thresholds.get(id) ?? {};
    cur.max = Number(v) || 0;
    this.thresholds.set(id, cur);
  }

  constructor(private crypto: CryptoService) {
    // seed UI with local simulated initial prices so cards are visible immediately
    const seed = this.crypto.prices().map((p) => ({ ...p }));
    if (seed && seed.length) this.list.set(seed);
      // create a worker local to LiveComponent to compute avg/vol for live data
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.statsWorker = new Worker(new URL('../workers/crypto.worker', import.meta.url), { type: 'module' });
        this.statsWorker.onmessage = (ev: MessageEvent) => {
          const data = ev.data as { id?: string; avg?: number; vol?: number };
          if (!data || !data.id) return;
          const updated = this.list().map((p) => (p.id === data.id ? { ...p, avg: Number(data.avg ?? 0), vol: Number(data.vol ?? 0) } : p));
          this.list.set(updated);
        };
      } catch (e) {
        this.statsWorker = undefined;
      }
    this.fetch();
    this.lastNetworkFetch = Date.now();
    this.interval = window.setInterval(() => this.tick(), this.uiIntervalMs);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
    if (this.statsWorker) {
      this.statsWorker.terminate();
      this.statsWorker = undefined;
    }
  }

  trackById(_i: number, item: PriceData) {
    return item.id;
  }

  private async fetch() {
    try {
      const ids = ['bitcoin','ethereum','cardano','binancecoin','solana','dogecoin','tether'];
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const current = this.list();
      const mapped: PriceData[] = data.map((d: any) => {
        const id = (d.symbol || d.id || '').toLowerCase();
        const price = Number(d.current_price || 0);
        const existing = current.find((p) => p.id === id);
        const history = [...(existing?.history || []), price].slice(-200);
        return {
          id,
          symbol: (d.symbol || '').toUpperCase(),
          name: d.name || d.id,
          price,
          change: Number(d.price_change_24h || 0),
          changePercent: Number(d.price_change_percentage_24h || 0),
          volume: Number(d.total_volume || 0),
          history,
          avg: existing?.avg ?? 0,
          vol: existing?.vol ?? 0,
        } as PriceData;
      });
      this.list.set(mapped as PriceData[]);
      this.lastNetworkFetch = Date.now();
      // send histories to the local stats worker to compute avg/vol
      if (this.statsWorker) {
        for (const p of mapped) {
          this.statsWorker.postMessage({ id: p.id, prices: p.history });
        }
      }
    } catch (e) {
      // ignore fetch errors silently
    }
  }

  /** tick called every uiIntervalMs; fetch from network periodically and otherwise simulate small updates */
  private tick() {
    const now = Date.now();
    if (now - this.lastNetworkFetch > this.networkFetchMs) {
      // perform a real network fetch (async)
      void this.fetch();
      return;
    }

    // simulate smooth small movements based on last known prices
    const current = this.list();
    if (!current || current.length === 0) return;

    const updated = current.map((p) => {
      const prev = p.price || 0;
      const changeFactor = 1 + (Math.random() - 0.5) * 0.002; // smaller moves for live smoothing
      const price = Number((prev * changeFactor).toFixed(6));
      const history = [...(p.history || []), price].slice(-200);
      const change = Number((price - prev).toFixed(6));
      const changePercent = prev ? Number((((price - prev) / prev) * 100).toFixed(4)) : 0;
      const volume = Math.max(1, Math.round((Math.random() * 2000)));
      return { ...p, price, change, changePercent, volume, history } as PriceData;
    });
    this.list.set(updated);
    // after simulated tick update, post histories to worker for recalculation
    if (this.statsWorker) {
      for (const p of updated) {
        this.statsWorker.postMessage({ id: p.id, prices: p.history });
      }
    }
  }
}
