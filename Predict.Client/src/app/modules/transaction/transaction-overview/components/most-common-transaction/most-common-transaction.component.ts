import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  TransactionCategorizer,
  TransactionCategory,
  TransactionDomain,
} from '../../../models/transactions.model';
import { TransactionOverviewHeaderComponent } from '../transaction-overview-header/transaction-overview-header.component';

interface GroupedTransaction {
  provider: string;
  description: string;
  count: number;
  total: number;
  currency: string | null;
  latestDate: Date | null;
  dates: Date[];
  category: TransactionCategory;
  percentageOfTotal: number;
  percentageOfIncome: number;
  percentageOfExpense: number;
}

interface CategoryBarSegment {
  category: TransactionCategory;
  label: string;
  color: string;
  total: number;
  percentage: number;
}

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
  multiple: GroupedTransaction[];
  categorySegments: CategoryBarSegment[];
  isExpanded: boolean;
  month?: string;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [
    CommonModule,
    NumberFormatPipe,
    NgbTooltip,
    TransactionOverviewHeaderComponent,
  ],
  templateUrl: './most-common-transaction.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './most-common-transaction.component.scss',
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);
  viewMode = input<'all' | 'monthly' | 'yearly'>('monthly');

  selectedCategory = signal<TransactionCategory | null>(null);

  selectedTransaction = computed(() =>
    this.transactions().filter(
      (t) =>
        this.selectedCategory() === null ||
        t.category === this.selectedCategory(),
    ),
  );

  private expandedPeriodId = signal<string | null>(null);

  /**
   * Global expense distribution across categories (used in the "All" view).
   * Based on the unfiltered list so the user keeps the full picture even
   * while drilling into a specific category.
   */
  categoryBarSegments = computed((): CategoryBarSegment[] =>
    this.buildCategorySegments(this.transactions()),
  );

  /**
   * Builds the per-category expense distribution for a given set of
   * transactions, sorted from largest to smallest spend.
   */
  private buildCategorySegments(
    txs: TransactionDomain[],
  ): CategoryBarSegment[] {
    if (!txs?.length) return [];

    const expenseTxs = txs.filter((t) => (t.amount ?? 0) < 0);
    if (!expenseTxs.length) return [];

    const totalExpense = expenseTxs.reduce(
      (sum, t) => sum + Math.abs(t.amount ?? 0),
      0,
    );
    if (totalExpense === 0) return [];

    const byCategory = new Map<TransactionCategory, number>();
    for (const tx of expenseTxs) {
      const amount = Math.abs(tx.amount ?? 0);
      byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + amount);
    }

    return Array.from(byCategory.entries())
      .map(([category, total]) => ({
        category,
        label: this.getCategoryLabel(category),
        color: this.getCategoryColor(category),
        total,
        percentage: (total / totalExpense) * 100,
      }))
      .sort((a, b) => b.total - a.total);
  }

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

  getAllGroupedTransactions = computed((): GroupedTransaction[] => {
    if (this.viewMode() !== 'all') return [];

    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const grouped = this.groupLocal(txs);

    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    const groupedWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfIncome:
        g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
      percentageOfExpense:
        g.total < 0 && totalExpense > 0
          ? (Math.abs(g.total) / totalExpense) * 100
          : 0,
    }));

    return this.sortGroupedTransactions(groupedWithPercentages);
  });

  private sortGroupedTransactions(
    transactions: GroupedTransaction[],
  ): GroupedTransaction[] {
    if (this.selectedCategory() !== null) {
      return [...transactions].sort((a, b) => {
        const dateA = a.latestDate?.getTime() ?? 0;
        const dateB = b.latestDate?.getTime() ?? 0;
        return dateB - dateA;
      });
    }

    const incomeItems = transactions.filter((t) => t.total > 0);
    const expenseItems = transactions.filter((t) => t.total < 0);

    const sortedIncome = incomeItems.sort((a, b) => b.total - a.total);

    const expenseMap = new Map<TransactionCategory, GroupedTransaction[]>();
    expenseItems.forEach((item) => {
      if (!expenseMap.has(item.category)) {
        expenseMap.set(item.category, []);
      }
      expenseMap.get(item.category)!.push(item);
    });

    const sortedCategories = Array.from(expenseMap.entries()).sort((a, b) => {
      const totalA = a[1].reduce((sum, item) => sum + Math.abs(item.total), 0);
      const totalB = b[1].reduce((sum, item) => sum + Math.abs(item.total), 0);
      return totalB - totalA;
    });

    const sortedExpenses: GroupedTransaction[] = [];
    sortedCategories.forEach(([, items]) => {
      const sortedItems = items.sort(
        (a, b) => Math.abs(b.total) - Math.abs(a.total),
      );
      sortedExpenses.push(...sortedItems);
    });

    return [...sortedIncome, ...sortedExpenses];
  }

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
    const grouped = this.groupLocal(txs);

    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    const groupsWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfIncome:
        g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
      percentageOfExpense:
        g.total < 0 && totalExpense > 0
          ? (Math.abs(g.total) / totalExpense) * 100
          : 0,
    }));

    const sortedGroups = this.sortGroupedTransactions(groupsWithPercentages);

    return {
      totalIncome,
      totalExpense,
      difference: totalIncome - totalExpense,
      transactionCount: txs.length,
      multiple: sortedGroups,
      transactions: txs,
      categorySegments: this.buildCategorySegments(txs),
    };
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

  private groupLocal(txs: TransactionDomain[]): GroupedTransaction[] {
    const isFiltered = this.selectedCategory() !== null;
    const map = new Map<string, GroupedTransaction>();
    let counter = 0;

    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;

      const key = isFiltered
        ? `${tx.serviceProvider}||${tx.description ?? ''}||${
            date?.getTime() ?? 0
          }||${tx.amount ?? 0}||${counter++}`
        : tx.category;

      if (!map.has(key)) {
        map.set(key, {
          provider: tx.serviceProvider,
          description: tx.description || '',
          count: 0,
          total: 0,
          currency: tx.currency,
          latestDate: null,
          dates: [],
          category: tx.category,
          percentageOfTotal: 0,
          percentageOfIncome: 0,
          percentageOfExpense: 0,
        });
      }

      const g = map.get(key)!;
      g.count++;
      g.total += tx.amount ?? 0;
      g.category = tx.category;

      if (date) {
        g.dates.push(date);
        if (!g.latestDate || date > g.latestDate) {
          g.latestDate = date;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      b.count !== a.count
        ? b.count - a.count
        : Math.abs(b.total) - Math.abs(a.total),
    );
  }

  onSelectCategory(category: TransactionCategory) {
    this.selectedCategory.set(
      this.selectedCategory() === category ? null : category,
    );
  }

  clearCategory() {
    this.selectedCategory.set(null);
  }

  getCategoryColor = (category: TransactionCategory): string =>
    TransactionCategorizer.getCategoryColor(category);

  getCategoryLabel = (category: TransactionCategory): string =>
    TransactionCategorizer.getCategoryLabel(category);
}
