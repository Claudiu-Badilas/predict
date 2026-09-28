import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import * as fromLayout from 'src/app/store/reducers/layout.reducer';

@Component({
  selector: 'p-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent implements OnDestroy {
  private readonly visibleSubject = new BehaviorSubject(false);
  private readonly loadingSubscription: Subscription;
  private shownAt = 0;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private minimumVisibleMs = 500;
  readonly isLoading$ = this.visibleSubject.asObservable();

  constructor(store: Store<fromLayout.State>) {
    this.loadingSubscription = store
      .select((state) => ({
        loading: fromLayout.getIsLoading(state),
        minimumVisibleMs: fromLayout.getSpinnerMinimumVisibleMs(state),
      }))
      .pipe(
        distinctUntilChanged(
          (previous, current) =>
            previous.loading === current.loading &&
            previous.minimumVisibleMs === current.minimumVisibleMs,
        ),
      )
      .subscribe(({ loading, minimumVisibleMs }) => {
        this.minimumVisibleMs = minimumVisibleMs;
        if (this.hideTimer) {
          clearTimeout(this.hideTimer);
          this.hideTimer = undefined;
        }

        if (loading) {
          this.shownAt = Date.now();
          this.visibleSubject.next(true);
          return;
        }

        if (!this.shownAt) {
          this.visibleSubject.next(false);
          return;
        }

        const remaining = this.minimumVisibleMs - (Date.now() - this.shownAt);
        if (remaining > 0) {
          this.hideTimer = setTimeout(() => {
            this.hideTimer = undefined;
            this.shownAt = 0;
            this.visibleSubject.next(false);
          }, remaining);
        } else {
          this.shownAt = 0;
          this.visibleSubject.next(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
    this.visibleSubject.complete();
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
