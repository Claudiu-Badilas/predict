import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AppState, selectToast } from 'src/app/store/app-state.reducer';
import * as ToastActions from './actions/toast-notification.actions';

@Component({
  selector: 'p-toast',
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./toast-notification.component.scss'],
})
export class ToastNotificationComponent {
  private readonly store = inject(Store<AppState>);
  private readonly destroyRef = inject(DestroyRef);
  readonly toast$ = this.store.select(selectToast);
  private readonly dismissTimers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor() {
    this.toast$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((toasts) => {
      const activeIds = new Set(toasts.map(({ id }) => id));
      for (const [id, timer] of this.dismissTimers) {
        if (!activeIds.has(id)) {
          clearTimeout(timer);
          this.dismissTimers.delete(id);
        }
      }

      for (const { id } of toasts) {
        if (!this.dismissTimers.has(id)) {
          this.dismissTimers.set(
            id,
            setTimeout(() => this.dismiss(id), 5000),
          );
        }
      }
    });
  }

  dismiss(id: number): void {
    const timer = this.dismissTimers.get(id);
    if (timer) clearTimeout(timer);
    this.dismissTimers.delete(id);
    this.store.dispatch(ToastActions.dismissToast({ id }));
  }
}
