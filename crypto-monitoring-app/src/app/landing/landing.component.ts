import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-landing',
  imports: [RouterModule],
  template: `
  <div class="landing">
    <div class="card new">
      <div class="icon-wrap"><img src="/logo.png" alt="logo" /></div>
      <h1>Crypto Monitor</h1>
      <p class="sub">Monitorea precios, SMA y volatilidad en tiempo real</p>

      <div class="buttons">
        <a routerLink="/simulated" class="btn primary">Simulador de mercado</a>
        <a routerLink="/live" class="btn secondary">Mercado en tiempo real</a>
      </div>

      <div class="notes">
        <div class="note">Actualizaciones 200ms</div>
        <div class="note">Cálculos en Web Workers</div>
        <div class="note">Alertas por umbral</div>
      </div>
    </div>
  </div>
  `,
  styles: [
    `.landing{display:flex;min-height:70vh;align-items:center;justify-content:center;padding:2rem}
     .card.new{width:min(880px,96%);padding:36px;border-radius:16px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));box-shadow:0 18px 60px rgba(2,6,23,0.6);border:1px solid rgba(255,255,255,0.03);text-align:center}
     .icon-wrap{width:96px;height:96px;margin:0 auto 12px;border-radius:18px;background:linear-gradient(135deg,#1e90ff,#37d39a);display:flex;align-items:center;justify-content:center}
     .icon-wrap img{width:56px;height:56px}
     h1{margin:6px 0 6px;font-size:28px}
     .sub{color:var(--muted);margin-bottom:18px}
     .buttons{display:flex;gap:12px;justify-content:center;margin-bottom:18px}
     .btn{padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:700}
     .btn.primary{background:linear-gradient(90deg,#1e90ff,#37d39a);color:#031012;box-shadow:0 8px 24px rgba(30,144,255,0.08)}
     .btn.secondary{background:transparent;border:1px solid rgba(255,255,255,0.06);color:var(--muted)}
     .notes{display:flex;gap:12px;justify-content:center;margin-top:6px;flex-wrap:wrap}
     .note{background:rgba(255,255,255,0.02);padding:8px 12px;border-radius:8px;color:var(--muted);font-weight:600;border:1px solid rgba(255,255,255,0.02)}
     @media (max-width:640px){.buttons{flex-direction:column}.note{width:100%;text-align:center}}
    `,
  ],
})
export class LandingComponent {}
