import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { LoanEncryptionKeyBase64 } from '../../services/loan.service';

@Component({
  selector: 'p-loan-settings',
  imports: [FormsModule],
  template: `
    <section class="settings" [class.settings--editing]="isEditing()">
      <!-- Header -->
      <header class="settings__header">
        <div class="settings__heading">
          <span class="settings__badge" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>
          <div class="settings__heading-text">
            <h2 class="settings__title">Encryption Key</h2>
            <p class="settings__hint">
              Base64-encoded key used to decrypt repayment schedules.
            </p>
          </div>
        </div>

        <div class="settings__status" [attr.data-state]="status()">
          <span class="settings__status-dot"></span>
          {{ statusLabel() }}
        </div>
      </header>

      <!-- Body -->
      <div class="settings__body">
        @if (isEditing()) {
          <div class="field">
            <textarea
              class="field__input"
              [ngModel]="value()"
              (ngModelChange)="value.set($event)"
              rows="5"
              spellcheck="false"
              autocomplete="off"
              placeholder="Paste your Base64 key here…"
              (keydown.escape)="cancel()"
            ></textarea>

            <div class="field__meta">
              <span class="field__count">{{ value().length }} chars</span>
            </div>
          </div>
        } @else {
          <div
            class="preview"
            [class.preview--empty]="!hasValue()"
            role="button"
            tabindex="0"
            (click)="edit()"
            (keydown.enter)="edit()"
            (keydown.space)="edit(); $event.preventDefault()"
          >
            @if (hasValue()) {
              <code class="preview__code">{{ maskedValue() }}</code>
            } @else {
              <span class="preview__empty"
                >No key configured — tap to add one.</span
              >
            }
            <span class="preview__edit" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
              </svg>
            </span>
          </div>
        }
      </div>

      <!-- Footer -->
      <footer class="settings__footer">
        @if (isEditing()) {
          <button type="button" class="btn btn--ghost" (click)="cancel()">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn--primary"
            [disabled]="!canSave()"
            (click)="save()"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
              ></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save changes
          </button>
        } @else {
          <button type="button" class="btn btn--secondary" (click)="edit()">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
            </svg>
            Edit key
          </button>
        }
      </footer>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      /* ---------- Shell ---------- */
      .settings {
        --radius: 14px;
        --border: #e5e7eb;
        --border-strong: #d1d5db;
        --bg: #ffffff;
        --bg-muted: #f9fafb;
        --fg: #0f172a;
        --fg-muted: #6b7280;
        --accent: #4f46e5;
        --accent-hover: #4338ca;
        --accent-soft: #eef2ff;
        --success: #10b981;
        --warning: #f59e0b;

        display: flex;
        flex-direction: column;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 8px 24px -12px rgba(15, 23, 42, 0.12);
        overflow: hidden;
        transition:
          box-shadow 0.2s ease,
          border-color 0.2s ease;
      }

      .settings--editing {
        border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
        box-shadow:
          0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent),
          0 12px 32px -12px rgba(79, 70, 229, 0.25);
      }

      /* ---------- Header ---------- */
      .settings__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--border);
        background: linear-gradient(180deg, #fbfbfd 0%, #ffffff 100%);
      }

      .settings__heading {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        min-width: 0;
        flex: 1;
      }

      .settings__heading-text {
        min-width: 0;
      }

      .settings__badge {
        flex-shrink: 0;
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: var(--accent-soft);
        color: var(--accent);
      }

      .settings__badge svg {
        width: 18px;
        height: 18px;
      }

      .settings__title {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--fg);
      }

      .settings__hint {
        margin: 0.125rem 0 0;
        font-size: 0.78125rem;
        line-height: 1.4;
        color: var(--fg-muted);
      }

      /* Status pill */
      .settings__status {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.3125rem 0.625rem;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        border-radius: 999px;
        background: #f3f4f6;
        color: #4b5563;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .settings__status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      .settings__status[data-state='configured'] {
        background: color-mix(in srgb, var(--success) 12%, #ffffff);
        color: #047857;
      }

      .settings__status[data-state='missing'] {
        background: color-mix(in srgb, var(--warning) 15%, #ffffff);
        color: #b45309;
      }

      .settings__status[data-state='editing'] {
        background: var(--accent-soft);
        color: var(--accent);
      }

      /* ---------- Body ---------- */
      .settings__body {
        padding: 1.25rem 1.5rem;
      }

      /* ---------- Textarea field ---------- */
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field__input {
        width: 100%;
        padding: 0.875rem 1rem;
        font-family:
          ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
          'Liberation Mono', monospace;
        font-size: 0.8125rem;
        line-height: 1.6;
        color: var(--fg);
        background: var(--bg-muted);
        border: 1px solid var(--border-strong);
        border-radius: 10px;
        resize: vertical;
        box-sizing: border-box;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease,
          background-color 0.15s ease;
        animation: fade-in 0.2s ease;
        /* Prevent iOS zoom on focus */
        font-size: max(0.8125rem, 16px);
      }

      .field__input:focus {
        outline: none;
        background: #ffffff;
        border-color: var(--accent);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent);
      }

      .field__input::placeholder {
        color: #9ca3af;
      }

      .field__meta {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 0.71875rem;
        color: var(--fg-muted);
      }

      .field__count {
        font-variant-numeric: tabular-nums;
      }

      /* ---------- Read-only preview ---------- */
      .preview {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.875rem 1rem;
        background: var(--bg-muted);
        border: 1px dashed var(--border-strong);
        border-radius: 10px;
        cursor: pointer;
        min-height: 52px;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          box-shadow 0.15s ease;
        -webkit-tap-highlight-color: transparent;
      }

      .preview:hover,
      .preview:focus-visible {
        outline: none;
        background: var(--accent-soft);
        border-color: color-mix(
          in srgb,
          var(--accent) 45%,
          var(--border-strong)
        );
      }

      .preview:active {
        background: color-mix(in srgb, var(--accent) 10%, #ffffff);
      }

      .preview--empty {
        border-style: dashed;
      }

      .preview__code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.8125rem;
        color: #1f2937;
        letter-spacing: 0.02em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
        flex: 1;
      }

      .preview__empty {
        font-size: 0.8125rem;
        font-style: italic;
        color: #9ca3af;
        flex: 1;
      }

      .preview__edit {
        flex-shrink: 0;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        color: var(--accent);
        background: #ffffff;
        border: 1px solid var(--border);
        transition: transform 0.15s ease;
      }

      .preview:hover .preview__edit {
        transform: translateY(-1px);
      }

      .preview__edit svg {
        width: 14px;
        height: 14px;
      }

      /* ---------- Footer ---------- */
      .settings__footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        border-top: 1px solid var(--border);
        background: var(--bg-muted);
      }

      /* ---------- Buttons ---------- */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4375rem;
        padding: 0.5rem 0.9375rem;
        min-height: 40px;
        font-size: 0.8125rem;
        font-weight: 500;
        line-height: 1;
        border-radius: 9px;
        border: 1px solid transparent;
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease,
          box-shadow 0.15s ease,
          transform 0.1s ease;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }

      .btn svg {
        width: 14px;
        height: 14px;
      }

      .btn:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent);
      }

      .btn:active:not(:disabled) {
        transform: translateY(1px);
      }

      .btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .btn--primary {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
        box-shadow: 0 1px 2px rgba(79, 70, 229, 0.35);
      }

      .btn--primary:hover:not(:disabled) {
        background: var(--accent-hover);
        border-color: var(--accent-hover);
      }

      .btn--secondary {
        background: #ffffff;
        color: var(--fg);
        border-color: var(--border-strong);
      }

      .btn--secondary:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .btn--ghost {
        background: transparent;
        color: var(--fg-muted);
        border-color: transparent;
      }

      .btn--ghost:hover:not(:disabled) {
        background: #e5e7eb;
        color: var(--fg);
      }

      /* ---------- Animation ---------- */
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(-2px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.001ms !important;
          transition-duration: 0.001ms !important;
        }
      }

      /* ---------- Mobile ---------- */
      @media (max-width: 640px) {
        .settings__header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.125rem;
        }

        .settings__status {
          align-self: flex-start;
        }

        .settings__body {
          padding: 1rem 1.125rem;
        }

        .settings__footer {
          padding: 0.875rem 1.125rem;
        }

        /* Full-width stacked buttons on mobile */
        .settings__footer .btn {
          flex: 1 1 auto;
          width: 100%;
          min-height: 44px;
          font-size: 0.875rem;
        }

        .settings__footer {
          flex-direction: column-reverse;
        }

        .field__input {
          rows: 4;
          padding: 0.75rem 0.875rem;
        }

        .preview {
          padding: 0.8125rem 0.875rem;
        }
      }

      @media (max-width: 380px) {
        .settings__badge {
          width: 34px;
          height: 34px;
        }

        .settings__badge svg {
          width: 16px;
          height: 16px;
        }

        .settings__title {
          font-size: 0.875rem;
        }

        .settings__hint {
          font-size: 0.75rem;
        }

        .settings__status {
          font-size: 0.625rem;
          padding: 0.25rem 0.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LoanSettingsComponent {
  private readonly store = inject(Store<fromLoan.LoanState>);
  private readonly _localStorageService = inject(LocalStorageService);

  readonly value = signal<string>(this.readFromStorage());
  readonly isEditing = signal<boolean>(false);

  readonly hasValue = computed(() => this.value().trim().length > 0);
  readonly canSave = computed(
    () => this.hasValue() && this.value() !== this.originalValue,
  );
  readonly status = computed<'editing' | 'configured' | 'missing'>(() => {
    if (this.isEditing()) return 'editing';
    return this.hasValue() ? 'configured' : 'missing';
  });
  readonly statusLabel = computed(() => {
    switch (this.status()) {
      case 'editing':
        return 'Editing';
      case 'configured':
        return 'Configured';
      default:
        return 'Not set';
    }
  });

  readonly maskedValue = computed(() => {
    const v = this.value();
    if (v.length <= 12) return v;
    return `${v.slice(0, 6)}${'•'.repeat(8)}${v.slice(-4)}`;
  });

  private originalValue = '';

  edit(): void {
    this.originalValue = this.value();
    this.isEditing.set(true);
  }

  cancel(): void {
    this.value.set(this.originalValue);
    this.isEditing.set(false);
  }

  save(): void {
    if (!this.canSave()) return;
    this._localStorageService.setItem(LoanEncryptionKeyBase64, this.value());
    this.originalValue = this.value();
    this.isEditing.set(false);
    this.reloadData();
  }

  reloadData(): void {
    this.store.dispatch(LoanActions.loadRepaymentSchedules());
  }

  private readFromStorage(): string {
    return this._localStorageService.getItem(LoanEncryptionKeyBase64) ?? '';
  }
}
