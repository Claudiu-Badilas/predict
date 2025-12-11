import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as TransactionsActions from 'src/app/modules/transaction-module/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction-module/reducers/transactions.reducer';
import { DateUtils } from 'src/app/shared/utils/date.utils';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  standalone: false,
})
export class TransactionComponent {
  startDate$ = this.store
    .select(fromTransactions.getStartDate)
    .pipe(map((d) => DateUtils.fromJsDateToString(d)));
  endDate$ = this.store
    .select(fromTransactions.getEndDate)
    .pipe(map((d) => DateUtils.fromJsDateToString(d)));

  transactions$ = this.store.select(fromTransactions.getTransactions);

  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  handleRangeChange(value: any) {
    this.store.dispatch(
      TransactionsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      })
    );
    this.store.dispatch(TransactionsActions.loadTransactions());
  }
}
