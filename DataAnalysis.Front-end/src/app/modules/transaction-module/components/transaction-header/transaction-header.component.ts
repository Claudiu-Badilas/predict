import { Component, Input } from '@angular/core';
import { TransactionDomain } from '../../models/transactions.model';

@Component({
  selector: 'app-transaction-header',
  imports: [],
  templateUrl: './transaction-header.component.html',
  styleUrls: ['./transaction-header.component.scss'],
})
export class TransactionHeaderComponent {
  @Input({ required: true }) transactions: TransactionDomain[];

  get incomes() {
    return this.transactions.filter((t) => t.amount > 0);
  }

  get totalIncome() {
    return this.incomes.map((a) => a.amount).reduce((sum, val) => sum + val, 0);
  }

  get payments() {
    return this.transactions.filter((t) => t.amount < 0);
  }

  get totalPayment() {
    return this.payments
      .map((a) => a.amount)
      .reduce((sum, val) => sum + val, 0);
  }
}
