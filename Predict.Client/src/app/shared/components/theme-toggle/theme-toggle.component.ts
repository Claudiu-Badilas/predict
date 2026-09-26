import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'p-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="theme-toggle"
      aria-label="Toggle theme"
      [attr.aria-pressed]="themeService.theme() === 'dark'"
      (click)="themeService.toggleTheme()"
    >
      <svg
        class="theme-toggle__icon"
        [class.theme-toggle__icon--dark]="themeService.theme() === 'dark'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        @if (themeService.theme() === 'dark') {
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
          />
        } @else {
          <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
        }
      </svg>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
    }

    .theme-toggle {
      display: inline-flex;
      width: 36px;
      height: 36px;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 1px solid var(--theme-border);
      border-radius: 50%;
      background: var(--theme-surface);
      color: var(--theme-text-primary);
      cursor: pointer;
      transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;
    }

    .theme-toggle:hover {
      background: var(--theme-hover);
    }

    .theme-toggle:focus-visible {
      outline: 2px solid var(--theme-accent);
      outline-offset: 2px;
    }

    .theme-toggle__icon {
      width: 20px;
      height: 20px;
      transition: transform 0.2s ease;
    }

    .theme-toggle__icon--dark {
      transform: rotate(-25deg);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}
