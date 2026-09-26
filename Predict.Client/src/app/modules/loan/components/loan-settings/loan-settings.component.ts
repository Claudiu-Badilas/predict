import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import {
  LoanService_MANUAL_FILENAME_KEY,
  LoanService_MANUAL_STORAGE_KEY,
  LoanService_STORAGE_KEY,
} from 'src/app/modules/loan/services/loan.service';
import { ReceiptsService_STORAGE_KEY } from 'src/app/modules/receipts/services/receipts.service';
import { TransactionService_STORAGE_KEY } from 'src/app/modules/transaction/services/transaction.service';
import {
  StorageManagerConfig,
  StorageManagerModalComponent,
} from 'src/app/shared/components/modals/storage-manager/storage-manager-modal.component';

@Component({
  selector: 'p-loan-settings',
  imports: [StorageManagerModalComponent],
  template: `
    <p-storage-manager-modal
      [config]="config"
      (reloadRequested)="reloadData()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LoanSettingsComponent {
  private readonly store = inject(Store<fromLoan.LoanState>);

  readonly config: StorageManagerConfig = {
    title: 'Loan storage',
    manualStorageKey: LoanService_MANUAL_STORAGE_KEY,
    automaticStorageKey: LoanService_STORAGE_KEY,
    loadFailureActionType: LoanActions.loadRepaymentSchedulesFailure.type,
    showAllStorage: true,
    ignoredStorageKeys: [
      TransactionService_STORAGE_KEY,
      ReceiptsService_STORAGE_KEY,
      LoanService_MANUAL_FILENAME_KEY,
    ],
    obsoleteStorageKeys: [LoanService_MANUAL_FILENAME_KEY],
  };

  reloadData(): void {
    this.store.dispatch(LoanActions.loadRepaymentSchedules());
  }
}
