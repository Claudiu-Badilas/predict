import { Component, computed, input } from '@angular/core';
import { TransactionDomain } from '../../models/transactions.model';
import { MonthlyMostCommonTransactionComponent } from '../monthly-most-common-transaction/monthly-most-common-transaction.component';
import { MostCommonTransactionComponent } from '../most-common-transaction/most-common-transaction.component';

@Component({
  selector: 'p-transaction-header',
  imports: [
    MostCommonTransactionComponent,
    MonthlyMostCommonTransactionComponent,
  ],
  templateUrl: './transaction-header.component.html',
  styleUrls: ['./transaction-header.component.scss'],
})
export class TransactionHeaderComponent {
  readonly transactions = input.required<TransactionDomain[]>();

  readonly ValidTransactions = computed(() =>
    this.transactions().filter((t) => !t.ignored),
  );
}
