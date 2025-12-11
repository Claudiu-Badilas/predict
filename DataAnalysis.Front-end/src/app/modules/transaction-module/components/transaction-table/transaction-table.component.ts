import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromTransactions from 'src/app/modules/transaction-module/reducers/transactions.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';

@Component({
  selector: 'app-transaction-table',
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
})
export class TransactionTableComponent {
  transactions$ = this.store.select(fromTransactions.getAvailableTransactions);

  constructor(private readonly store: Store<fromTransactions.State>) {}
}
