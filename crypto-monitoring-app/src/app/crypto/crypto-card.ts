import { Component, Input, ChangeDetectionStrategy, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceData } from '../core/services/crypto';
import { AppHighlightChangeDirective } from '../directives/app-highlight-change.directive';

@Component({
	selector: 'crypto-card',
	standalone: true,
	imports: [CommonModule, AppHighlightChangeDirective],
	template: `
	<article class="card" [class.alert]="alertActive" appHighlightChange [value]="item.price">
		<header>
			<div style="display:flex;justify-content:space-between;align-items:center">
				<div class="title">
					<img class="coin-icon" [src]="iconSrc(item.symbol)" (error)="onIconError($event, item.symbol)" [alt]="item.symbol" />
					<div>
						<h4>{{item.symbol}}</h4>
						<small>{{item.name}}</small>
					</div>
				</div>
				<div *ngIf="alertActive" class="alert-badge" [class.up]="alertIsMax" [class.down]="alertIsMin">
					<span class="arrow" *ngIf="alertIsMax">▲</span>
					<span class="arrow" *ngIf="alertIsMin">▼</span>
					<span class="label">ALERTA</span>
				</div>
			</div>
		</header>
		<div class="body">
			<div class="price">{{item.price | number:'1.2-2'}}</div>
			<div class="change" [class.up]="change>0" [class.down]="change<0">{{change | number:'1.2-2'}}</div>
		</div>
		<div class="alert-input centered">
			<div class="step-controls two centered">
				<div class="input-wrap centered">
					<label class="small-label">Max</label>
						<div class="input-field">
							<input class="threshold-input" type="number" min="0" [attr.step]="step" [value]="maxThreshold" (input)="onMaxThreshold($any($event))" (wheel)="$event.preventDefault()" (keydown)="onNumberKeydown($event,'max')" placeholder="Umbral máximo (USD)" title="Alerta cuando el precio supere o iguale este valor">
							<span class="percent-inside">$</span>
						</div>
				</div>
				<div class="input-wrap centered">
					<label class="small-label">Min</label>
					<div class="input-field">
						<input class="threshold-input" type="number" min="0" [attr.step]="step" [value]="minThreshold" (input)="onMinThreshold($any($event))" (wheel)="$event.preventDefault()" (keydown)="onNumberKeydown($event,'min')" placeholder="Umbral mínimo (USD)" title="Alerta cuando el precio sea menor o igual a este valor">
						<span class="percent-inside">$</span>
					</div>
				</div>
			</div>
		</div>
		<footer>
			<div class="meta-row">
				<small class="meta"><span class="label">Vol:</span> <span class="val">{{volume | number:'1.0-0'}}</span></small>
				<small class="meta"><span class="label">SMA:</span> <span class="val">{{sma | number:'1.2-2'}}</span></small>
				<small class="meta"><span class="label">Volatilidad:</span> <span class="val">{{volatilityPercent | number:'1.2-2'}}%</span></small>
			</div>
		</footer>
	</article>
	`,
	styles: [`
	.card{background:var(--card);padding:14px;border-radius:10px;box-shadow:0 6px 16px rgba(0,0,0,.45);display:flex;flex-direction:column;justify-content:space-between}
	.price{font-weight:800;font-size:1.25rem;margin-bottom:6px}
	.change.up{color:#60d394}
	.change.down{color:#ff7b7b}
	.title{display:flex;align-items:center;gap:10px}
	.coin-icon{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:0 0 40px}

	.meta-row{display:flex;flex-direction:column;gap:8px;align-items:stretch;margin-top:10px}
	.meta{color:var(--muted);font-size:0.88rem;background:rgba(255,255,255,0.02);padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.02);display:flex;justify-content:space-between;align-items:center}
	.meta .label{opacity:0.85;margin-right:6px;font-weight:700;color:#fff}
	.meta .val{font-weight:700;color:var(--accent);margin-left:8px}

	/* Alert badge styles */
	.alert-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;font-weight:800}
	.alert-badge.up{background:rgba(96,211,148,0.06);color:#60d394;border:1px solid rgba(96,211,148,0.12)}
	.alert-badge.down{background:rgba(255,123,123,0.04);color:#ff7b7b;border:1px solid rgba(255,123,123,0.08)}
	.alert-badge .arrow{font-size:1rem;line-height:1}
	.alert-badge .label{font-size:0.85rem}

	/* Centered inputs for thresholds */
	.alert-input.centered{margin-top:8px;display:flex;justify-content:center}
	.step-controls.two{display:flex;flex-direction:column;gap:8px;justify-content:center;align-items:center;width:100%;padding:6px 8px;box-sizing:border-box}
	.input-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;flex:0 0 auto;min-width:0;padding:0}
	.input-wrap.centered{align-items:center}
	.small-label{font-size:0.64rem;color:var(--muted);font-weight:700;margin-bottom:4px}
	.input-field{position:relative;width:120px;max-width:100%;box-sizing:border-box;margin:0 auto}
	.threshold-input{width:100%;padding:6px 12px 6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);text-align:center;color:var(--text);font-size:0.9rem}
	.threshold-input:focus{outline:none;box-shadow:0 0 0 2px rgba(0,0,0,0.03)}
	.percent-inside{position:absolute;right:6px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;font-size:0.78rem}
	@media (max-width: 420px) {
		.step-controls.two{gap:8px;max-width:180px}
		.input-field{width:72px}
	}
	.step-buttons{display:none}
	/* hide native number spinners */
	.threshold-input::-webkit-outer-spin-button, .threshold-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
	.threshold-input { -moz-appearance: textfield; }
	`],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CryptoCard {
	@Input() item!: PriceData;
	@Input()
	set minThreshold(v: number) {
		this._minThreshold.set(Number(v ?? 0) || 0);
	}
	get minThreshold(): number {
		return this._minThreshold();
	}
	@Input()
	set maxThreshold(v: number) {
		this._maxThreshold.set(Number(v ?? 0) || 0);
	}
	get maxThreshold(): number {
		return this._maxThreshold();
	}

	@Output() minThresholdChange = new EventEmitter<number>();
	@Output() maxThresholdChange = new EventEmitter<number>();

	/** per-card thresholds (price) */
	private _minThreshold = signal<number>(0);
	private _maxThreshold = signal<number>(0);



	onMinThreshold(ev: Event | { target: any }) {
		const target = (ev as any).target ?? ev;
		const v = Number(target.value ?? 0) || 0;
		this._minThreshold.set(v);
		this.minThresholdChange.emit(v);
	}

	onMaxThreshold(ev: Event | { target: any }) {
		const target = (ev as any).target ?? ev;
		const v = Number(target.value ?? 0) || 0;
		this._maxThreshold.set(v);
		this.maxThresholdChange.emit(v);
	}


	onStepChange(v: string | number) {
		this.step = Number(v) || 0.1;
	}

	onNumberKeydown(ev: KeyboardEvent, which: 'min' | 'max' = 'max') {
		const key = ev.key;
		if (key !== 'ArrowUp' && key !== 'ArrowDown') return;
		ev.preventDefault();
		const input = ev.target as HTMLInputElement;
		if (!input) return;
		const cur = Number(input.value || 0) || 0;
		const delta = key === 'ArrowUp' ? this.step : -this.step;
		let next = +(cur + delta);
		// round to avoid floating errors based on step
		const decimals = (this.step.toString().split('.')[1] || '').length;
		next = Number(next.toFixed(decimals));
		if (next < 0) next = 0;
		input.value = String(next);
		if (which === 'min') {
			this._minThreshold.set(next);
			this.minThresholdChange.emit(next);
		} else {
			this._maxThreshold.set(next);
			this.maxThresholdChange.emit(next);
		}
	}

	/** step value used by the input */
	step = 0.1;

	onIncrease(target: 'min' | 'max') {
		if (target === 'min') {
			const next = this.roundToStep((Number((this._minThreshold() ?? 0)) + this.step));
			this._minThreshold.set(next);
			this.minThresholdChange.emit(next);
		} else {
			const next = this.roundToStep((Number((this._maxThreshold() ?? 0)) + this.step));
			this._maxThreshold.set(next);
			this.maxThresholdChange.emit(next);
		}
	}

	onDecrease(target: 'min' | 'max') {
		if (target === 'min') {
			const next = this.roundToStep((Number((this._minThreshold() ?? 0)) - this.step));
			this._minThreshold.set(Math.max(0, next));
			this.minThresholdChange.emit(Math.max(0, next));
		} else {
			const next = this.roundToStep((Number((this._maxThreshold() ?? 0)) - this.step));
			this._maxThreshold.set(Math.max(0, next));
			this.maxThresholdChange.emit(Math.max(0, next));
		}
	}

	roundToStep(v: number) {
		const decimals = (this.step.toString().split('.')[1] || '').length;
		return Number(v.toFixed(decimals));
	}

	get change(): number {
		return Number((this.item as any)?.change ?? 0);
	}

	get sma(): number {
		return Number((this.item as any)?.avg ?? 0);
	}

	get volatility(): number {
		return Number((this.item as any)?.vol ?? 0);
	}

	get volatilityPercent(): number {
		const p = Number((this.item as any)?.price ?? 0);
		return p ? (this.volatility / p) * 100 : 0;
	}

	get volume(): number {
		return Number((this.item as any)?.volume ?? 0);
	}

	get alertActive(): boolean {
		return this.alertIsMax || this.alertIsMin;
	}

	get alertIsMax(): boolean {
		const price = Number((this.item as any)?.price ?? 0);
		const max = this._maxThreshold();
		if (!max || max <= 0) return false;
		const decimals = (this.step.toString().split('.')[1] || '').length;
		return Number(price.toFixed(decimals)) >= Number(max.toFixed(decimals));
	}

	get alertIsMin(): boolean {
		const price = Number((this.item as any)?.price ?? 0);
		const min = this._minThreshold();
		if (!min || min <= 0) return false;
		const decimals = (this.step.toString().split('.')[1] || '').length;
		return Number(price.toFixed(decimals)) <= Number(min.toFixed(decimals));
	}


	/** return the best path for a coin icon (prefer public SVGs if available) */
	iconSrc(symbol: string) {
		const s = String(symbol || '').toLowerCase();
		// map common symbols to filenames present in the public/ folder
		const map: Record<string, string> = {
			btc: '/bitcoin-btc-logo.svg',
			eth: '/ethereum-eth-logo.svg',
			ada: '/cardano-ada-logo.svg',
			bnb: '/bnb-bnb-logo.svg',
			sol: '/solana-sol-logo.svg',
			usdt: '/tether-usdt-logo.svg',
			doge: '/dogecoin-doge-logo.svg',
		};

		if (map[s]) return map[s];

		// try bundled assets first (if present), prefer SVG
		const bundledSvg = `assets/icons/${s}.svg`;
		const bundledPng = `assets/icons/${s}.png`;
		return bundledSvg || bundledPng || '/logo.png';
	}

	/** on image load error, try a CDN then fall back to a default app asset */
	onIconError(ev: Event, symbol: string) {
		const img = ev.target as HTMLImageElement | null;
		if (!img) return;
		// first try CDN; if that fails use bundled default
		img.onerror = () => {
			img.onerror = null;
			img.src = `/LOGO.png`;
		};
		const s = String(symbol || '').toLowerCase();
		img.src = `https://cryptoicons.org/api/icon/${s}/64`;
	}
}
