import { Injectable, signal, WritableSignal } from '@angular/core';

export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  prevPrice?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  avg?: number;
  vol?: number;
  threshold?: number;
  history: number[];
}

const INITIAL: PriceData[] = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 45000, history: [45000] },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3200, history: [3200] },
  { id: 'bnb', symbol: 'BNB', name: 'Binance Coin', price: 420, history: [420] },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', price: 0.45, history: [0.45] },
  { id: 'sol', symbol: 'SOL', name: 'Solana', price: 110, history: [110] },
];

@Injectable({ providedIn: 'root' })
export class CryptoService {
  readonly prices: WritableSignal<PriceData[]> = signal(INITIAL.map((p) => ({ ...p })));

  private timer: number | undefined;
  private worker: Worker | undefined;

  constructor() {
    this.setupWorker();
    this.start();
  }

  private setupWorker() {
    try {
      // instantiate the worker and wire message handling
      // use import.meta.url so bundlers resolve the worker file
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.worker = new Worker(new URL('../workers/crypto.worker', import.meta.url), { type: 'module' });
      this.worker.onmessage = (ev: MessageEvent) => {
        const data = ev.data as { id?: string; avg?: number; vol?: number };
        if (!data || !data.id) return;
        // update the matching asset with avg/vol
        const updated = this.prices().map((p) => {
          if (p.id === data.id) {
            return { ...p, avg: Number(data.avg ?? 0), vol: Number(data.vol ?? 0) } as PriceData;
          }
          return p;
        });
        this.prices.set(updated);
      };
    } catch (e) {
      // worker instantiation failed — silently ignore, calculations will remain on main thread
      this.worker = undefined;
    }
  }

  start() {
    if (this.timer) return;
    this.timer = window.setInterval(() => this.tick(), 200);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private tick() {
    const updated = this.prices().map((p) => {
      const prev = p.price;
      const changeFactor = 1 + (Math.random() - 0.5) * 0.01; // small moves
      const price = Number((prev * changeFactor).toFixed(6));
      const history = [...p.history, price].slice(-200);
      const change = Number((price - prev).toFixed(6));
      const changePercent = Number((((price - prev) / prev) * 100).toFixed(4));
      const volume = Math.max(1, Math.round((Math.random() * 2000)));
      return { ...p, prevPrice: prev, price, change, changePercent, volume, history } as PriceData;
    });
    this.prices.set(updated);

    // send histories to worker for avg/vol computation
    if (this.worker) {
      for (const p of updated) {
        // send the recent history window
        this.worker.postMessage({ id: p.id, prices: p.history });
      }
    }
  }

  getById(id: string) {
    return this.prices().find((p) => p.id === id);
  }
}
