import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-center min-h-screen' },
  styles: [`
    :host {
      background: var(--p-surface-950);
    }
  `],
  template: `
    <p class="text-xl text-center max-w-xl px-6"
       style="color: var(--p-surface-0)">
      Si estás viendo esto en fondo negro y letras blancas,
      todo está listo para que comiences a trabajar con esta plantilla
    </p>
  `,
})
export class Home {}
