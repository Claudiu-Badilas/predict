import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionDomain } from '../../models/transactions.model';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';

@Component({
  selector: 'p-most-common-transaction',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './most-common-transaction.component.html',
  styleUrls: ['./most-common-transaction.component.scss'],
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);

  groupedMultiple = computed(() => {
    const transactions = this.transactions();
    if (!transactions?.length) return [];
    const grouped = this.groupTransactions(transactions);
    return grouped.filter((g) => g.count >= 2);
  });

  groupedSingle = computed(() => {
    const transactions = this.transactions();
    if (!transactions?.length) return [];
    const grouped = this.groupTransactions(transactions);
    return grouped.filter((g) => g.count === 1);
  });

  totalIncome = computed(() => {
    const transactions = this.transactions();
    if (!transactions?.length) return 0;
    return transactions
      .filter((tx) => (tx.amount ?? 0) > 0)
      .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  });

  totalExpense = computed(() => {
    const transactions = this.transactions();
    if (!transactions?.length) return 0;
    const total = transactions
      .filter((tx) => (tx.amount ?? 0) < 0)
      .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
    return Math.abs(total);
  });

  private groupTransactions(transactions: TransactionDomain[]): any[] {
    const grouped = transactions.reduce(
      (acc, tx) => {
        const key = tx.serviceProvider || 'Unknown';
        if (!acc[key]) {
          acc[key] = {
            provider: key,
            count: 0,
            total: 0,
            currency: tx.currency,
          };
        }
        acc[key].count++;
        acc[key].total += tx.amount ?? 0;
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(grouped).sort((a: any, b: any) => {
      if (a.count !== b.count) return b.count - a.count;
      return Math.abs(b.total) - Math.abs(a.total);
    });
  }
}
