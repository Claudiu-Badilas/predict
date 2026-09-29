import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ScrollableDirective } from 'src/app/shared/directives/scrollable.directive';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { TransactionDomain } from '../../models/transactions.model';
import { TransactionFeedComponent } from '../transaction-feed/transaction-feed.component';

type TransactionSort = 'amount' | 'recent' | 'oldest';

interface PeriodGroup {
  id: string;
  title: string;
  year: number;
  monthIndex?: number;
  totalIncome: number;
  totalExpense: number;
  difference: number;
  transactionCount: number;
  transactions: TransactionDomain[];
  isExpanded: boolean;
  month?: string;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [
    CommonModule,
    NumberFormatPipe,
    ScrollableDirective,
    NgbTooltip,
    TransactionFeedComponent,
  ],
  templateUrl: './most-common-transaction.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './most-common-transaction.component.scss',
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);
  viewMode = input<'all' | 'monthly' | 'yearly'>('monthly');
  viewModeChange = output<'all' | 'monthly' | 'yearly'>();

  searchTerm = signal('');
  sortMode = signal<TransactionSort>('recent');

  private normalizedSearch = computed(() =>
    this.searchTerm().trim().toLowerCase(),
  );

  selectedTransaction = computed(() =>
    this.transactions().filter((transaction) =>
      this.matchesSearch(transaction),
    ),
  );

  allTransactions = computed(() =>
    this.sortTransactionRecords(this.selectedTransaction()),
  );

  private expandedPeriodId = signal<string | null>(null);

  togglePeriod(period: PeriodGroup) {
    const currentExpanded = this.expandedPeriodId();
    if (currentExpanded === period.id) {
      this.expandedPeriodId.set(null);
    } else {
      this.expandedPeriodId.set(period.id);
    }
  }

  formatDay(date: Date | null): string {
    if (!date) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month}`;
  }

  currentPeriods = computed((): PeriodGroup[] => {
    if (this.viewMode() === 'monthly') {
      return this.groupedByMonth();
    } else if (this.viewMode() === 'yearly') {
      return this.groupedByYear();
    }
    return [];
  });

  private groupedByMonth = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const map = new Map<string, TransactionDomain[]>();
    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([key, txs]) => {
        const [year, monthIndex] = key.split('-').map(Number);
        const month = new Date(year, monthIndex).toLocaleString('default', {
          month: 'short',
        });
        const id = `month-${year}-${monthIndex}`;

        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${month} ${year}`,
          year,
          monthIndex,
          month,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex! - a.monthIndex!;
      });
  });

  private groupedByYear = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const map = new Map<number, TransactionDomain[]>();
    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;
      const year = date.getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([year, txs]) => {
        const id = `year-${year}`;
        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${year}`,
          year,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => b.year - a.year);
  });

  private processTransactions(txs: TransactionDomain[]) {
    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    return {
      totalIncome,
      totalExpense,
      difference: totalIncome - totalExpense,
      transactionCount: txs.length,
      transactions: this.sortTransactionRecords(txs),
    };
  }

  private sortTransactionRecords(
    transactions: TransactionDomain[],
  ): TransactionDomain[] {
    const dateValue = (transaction: TransactionDomain) =>
      (transaction.completionDate || transaction.registrationDate)?.getTime() ??
      0;

    return [...transactions].sort((a, b) => {
      if (this.sortMode() === 'amount') {
        return Math.abs(b.amount ?? 0) - Math.abs(a.amount ?? 0);
      }
      if (this.sortMode() === 'oldest') {
        return dateValue(a) - dateValue(b);
      }
      return dateValue(b) - dateValue(a);
    });
  }

  totalIncome = computed(
    () =>
      this.selectedTransaction()
        ?.filter((tx) => (tx.amount ?? 0) > 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
  );

  totalExpense = computed(() =>
    Math.abs(
      this.selectedTransaction()
        ?.filter((tx) => (tx.amount ?? 0) < 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
    ),
  );

  totalTransactions = computed(() => this.selectedTransaction()?.length ?? 0);

  private matchesSearch(transaction: TransactionDomain): boolean {
    const query = this.normalizedSearch();
    if (!query) return true;

    return [
      transaction.serviceProvider,
      transaction.merchantName,
      transaction.description,
      transaction.categoryLabel,
      transaction.transactionType,
    ]
      .filter(Boolean)
      .some(
        (value) =>
          typeof value === 'string' && value.toLowerCase().includes(query),
      );
  }

  onSearchInput(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setSortMode(sortMode: TransactionSort) {
    this.sortMode.set(sortMode);
  }

  setViewMode(viewMode: 'all' | 'monthly' | 'yearly') {
    this.viewModeChange.emit(viewMode);
  }

  clearSearch() {
    this.searchTerm.set('');
  }
}
