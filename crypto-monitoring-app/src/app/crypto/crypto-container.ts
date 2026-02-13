import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CryptoService, PriceData } from '../core/services/crypto';
import { CryptoCard } from './crypto-card';

@Component({
	selector: 'crypto-container',
	standalone: true,
	imports: [CommonModule, CryptoCard, RouterModule],
	template: `

<section class="crypto-container">
	<div class="controls"><a routerLink="/" class="btn outline">Volver</a></div>
	<div class="grid">
		<div *ngFor="let item of list(); trackBy: trackById">
			<crypto-card [item]="item"></crypto-card>
		</div>
	</div>
</section>
	`,
	styles: [`.crypto-container{padding:1rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.controls{margin-bottom:10px}`],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryptoContainer {
	readonly list = computed(() => this.crypto.prices());

	constructor(private crypto: CryptoService) {}

	trackById(_i: number, item: PriceData) {
		return item.id;
	}
}
