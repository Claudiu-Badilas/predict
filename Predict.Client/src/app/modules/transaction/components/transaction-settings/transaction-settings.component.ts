import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { TransactionService_STORAGE_KEY } from 'src/app/modules/transaction/services/transaction.service';
import { TransactionService_MANUAL_STORAGE_KEY } from 'src/app/modules/transaction/services/transaction-settings.constants';
import {
  StorageManagerConfig,
  StorageManagerModalComponent,
} from 'src/app/shared/components/modals/storage-manager/storage-manager-modal.component';

@Component({
  selector: 'p-transactions-settings',
  imports: [StorageManagerModalComponent],
  template: `
    <p-storage-manager-modal
      [config]="config"
      (reloadRequested)="reloadData()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TransactionsSettingsComponent {
  private readonly store = inject(Store<fromTransactions.State>);

  readonly config: StorageManagerConfig = {
    title: 'Transaction storage',
    manualStorageKey: TransactionService_MANUAL_STORAGE_KEY,
    automaticStorageKey: TransactionService_STORAGE_KEY,
    loadFailureActionType: TransactionsActions.loadTransactionsFailure.type,
  };

  reloadData(): void {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }
}
