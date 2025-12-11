import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as TransactionsActions from 'src/app/modules/transaction-module/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction-module/reducers/transactions.reducer';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  standalone: false,
})
export class TransactionComponent {
  transactions$ = this.store.select(fromTransactions.getTransactions);

  startDate = '2025-01-01';
  endDate = '2026-02-01';

  handleRangeChange(value: any) {
    console.log('Range updated:', value);
  }

  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }
}
