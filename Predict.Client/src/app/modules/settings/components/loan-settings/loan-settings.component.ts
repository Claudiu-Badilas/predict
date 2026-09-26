import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import {
  LoanService_MANUAL_FILENAME_KEY,
  LoanService_MANUAL_STORAGE_KEY,
  LoanService_STORAGE_KEY,
} from 'src/app/modules/loan/services/loan.service';
import { LoanSettingsService } from 'src/app/modules/loan/services/loan-settings.service';
import { ReceiptsService_STORAGE_KEY } from 'src/app/modules/receipts/services/receipts.service';
import { TransactionService_STORAGE_KEY } from 'src/app/modules/transaction/services/transaction.service';

type LoanStorageItem = {
  key: string;
  storageType: 'local' | 'session';
  origin?: 'manual' | 'automatic';
};

type ViewedStorageData = {
  key: string;
  storageType: 'local' | 'session';
  content: string;
};

@Component({
  selector: 'p-loan-settings',
  imports: [CommonModule],
  templateUrl: './loan-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./loan-settings.component.scss'],
})
export class LoanSettingsComponent implements OnInit {
  private settingsService = inject(LoanSettingsService);
  private store = inject(Store<fromLoan.LoanState>);
  private actions = inject(Actions);
  private destroyRef = inject(DestroyRef);
  activeModal = inject(NgbActiveModal);
  errorMessage = signal<string | null>(null);

  storageKeys = signal<LoanStorageItem[]>([]);
  viewedData = signal<ViewedStorageData | null>(null);

  ngOnInit(): void {
    localStorage.removeItem(LoanService_MANUAL_FILENAME_KEY);
    this.loadKeys();
    this.actions
      .pipe(
        ofType(LoanActions.loadRepaymentSchedulesFailure),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ message }) => this.errorMessage.set(message));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    input.value = '';
    this.errorMessage.set(null);
    this.settingsService
      .uploadStorageItemFromJson(LoanService_MANUAL_STORAGE_KEY, file)
      .then(() => {
        this.viewedData.set(null);
        this.loadKeys();
        this.store.dispatch(LoanActions.loadRepaymentSchedules());
      })
      .catch((error: unknown) => {
        this.errorMessage.set(
          error instanceof Error ? error.message : 'Failed to upload file.',
        );
      });
  }

  loadKeys(): void {
    const storageKeys: LoanStorageItem[] = [];
    const ignoredKey = [
      TransactionService_STORAGE_KEY,
      ReceiptsService_STORAGE_KEY,
      LoanService_MANUAL_FILENAME_KEY,
    ];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !ignoredKey.some((k) => key === k)) {
        storageKeys.push(this.createStorageItem(key, 'local'));
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && !ignoredKey.some((k) => key === k)) {
        storageKeys.push(this.createStorageItem(key, 'session'));
      }
    }

    this.storageKeys.set(storageKeys);
  }

  private createStorageItem(
    key: string,
    storageType: 'local' | 'session',
  ): LoanStorageItem {
    const origin =
      key === LoanService_MANUAL_STORAGE_KEY
        ? 'manual'
        : key === LoanService_STORAGE_KEY
          ? 'automatic'
          : undefined;
    return { key, storageType, origin };
  }

  removeItem(item: LoanStorageItem): void {
    const storage =
      item.storageType === 'local' ? localStorage : sessionStorage;

    this.errorMessage.set(null);
    try {
      if (item.key === LoanService_MANUAL_STORAGE_KEY) {
        localStorage.removeItem(LoanService_MANUAL_FILENAME_KEY);
      }
      storage.removeItem(item.key);
      this.viewedData.set(null);
      this.loadKeys();
    } catch (error: unknown) {
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'Failed to remove storage item.',
      );
      return;
    }

    this.store.dispatch(LoanActions.loadRepaymentSchedules());
  }

  viewItem(item: LoanStorageItem): void {
    const currentView = this.viewedData();
    if (
      currentView?.key === item.key &&
      currentView.storageType === item.storageType
    ) {
      this.viewedData.set(null);
      return;
    }

    const storage =
      item.storageType === 'local' ? localStorage : sessionStorage;
    const value = storage.getItem(item.key);
    if (value === null) {
      this.errorMessage.set('No data found for this storage item.');
      this.loadKeys();
      return;
    }

    this.errorMessage.set(null);
    this.viewedData.set({
      key: item.key,
      storageType: item.storageType,
      content: this.formatStorageData(value),
    });
  }

  private formatStorageData(value: string): string {
    try {
      return JSON.stringify(JSON.parse(value), null, 2) ?? value;
    } catch {
      return value;
    }
  }

  downloadItem(item: LoanStorageItem): void {
    this.settingsService.downloadItem(item);
  }
}
