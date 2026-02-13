import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LiveComponent } from './live/live.component';
import { CryptoContainer } from './crypto/crypto-container';

export const routes: Routes = [
	{ path: '', component: LandingComponent },
	{ path: 'simulated', component: CryptoContainer },
	{ path: 'live', component: LiveComponent },
	{ path: '**', redirectTo: '' },
];
