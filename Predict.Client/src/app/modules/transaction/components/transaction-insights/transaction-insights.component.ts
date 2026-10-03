import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { TransactionDomain } from '../../models/transactions.model';

interface TransactionInsight {
  eyebrow: string;
  title: string;
  value: string;
  detail: string;
  monthlySpend?: { label: string; amount: string; barWidth: number }[];
}

@Component({
  selector: 'p-transaction-insights',
  imports: [CommonModule],
  templateUrl: './transaction-insights.component.html',
  styleUrl: './transaction-insights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionInsightsComponent implements OnDestroy {
  transactions = input<TransactionDomain[]>([]);
  economiiTransactions = input<TransactionDomain[]>([]);
  startDate = input.required<Date>();
  endDate = input.required<Date>();
  showEconomii = input(false);

  showInsights = signal(false);
  activeStory = signal(0);
  insightStories = computed(() =>
    this.createInsightStories(
      this.showEconomii() ? this.economiiTransactions() : this.transactions(),
      this.showEconomii(),
    ),
  );
  private storyTimer: ReturnType<typeof setTimeout> | null = null;

  openInsights(): void {
    this.activeStory.set(0);
    this.showInsights.set(true);
    this.scheduleNextStory();
  }

  closeInsights(): void {
    this.clearStoryTimer();
    this.showInsights.set(false);
  }

  previousStory(): void {
    if (this.activeStory() === 0) return;
    this.activeStory.update((index) => index - 1);
    this.scheduleNextStory();
  }

  nextStory(): void {
    if (this.activeStory() >= this.insightStories().length - 1) {
      this.closeInsights();
      return;
    }
    this.activeStory.update((index) => index + 1);
    this.scheduleNextStory();
  }

  ngOnDestroy(): void {
    this.clearStoryTimer();
  }

  @HostListener('document:keydown', ['$event'])
  handleStoryKeyboard(event: KeyboardEvent): void {
    if (!this.showInsights()) return;
    if (event.key === 'Escape') this.closeInsights();
    if (event.key === 'ArrowLeft') this.previousStory();
    if (event.key === 'ArrowRight') this.nextStory();
  }

  private scheduleNextStory(): void {
    this.clearStoryTimer();
    this.storyTimer = setTimeout(() => this.nextStory(), 5000);
  }

  private clearStoryTimer(): void {
    if (this.storyTimer === null) return;
    clearTimeout(this.storyTimer);
    this.storyTimer = null;
  }

  private createInsightStories(
    transactions: TransactionDomain[],
    isEconomii: boolean,
  ): TransactionInsight[] {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(
      currentMonthStart.getFullYear(),
      currentMonthStart.getMonth() - 1,
      1,
    );
    const sixMonthStart = new Date(
      lastMonthStart.getFullYear(),
      lastMonthStart.getMonth() - 5,
      1,
    );
    const lastMonthLabel = lastMonthStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const transactionDate = (transaction: TransactionDomain) =>
      transaction.completionDate || transaction.registrationDate;
    const lastMonthTransactions = transactions.filter((transaction) => {
      const date = transactionDate(transaction);
      return (
        date !== null && date >= lastMonthStart && date < currentMonthStart
      );
    });
    const currency =
      transactions
        .find((transaction) => transaction.currency?.trim())
        ?.currency?.trim() || 'RON';
    const formatAmount = (amount: number) =>
      `${new Intl.NumberFormat('ro-RO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)} ${currency}`;
    const signedAmount = (amount: number) =>
      `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${formatAmount(Math.abs(amount))}`;
    const selectedStartMonth = new Date(
      this.startDate().getFullYear(),
      this.startDate().getMonth(),
      1,
    );
    const selectedEndMonth = new Date(
      this.endDate().getFullYear(),
      this.endDate().getMonth(),
      1,
    );
    const comparisonStart = new Date(
      Math.max(sixMonthStart.getTime(), selectedStartMonth.getTime()),
    );
    const comparisonEnd =
      selectedEndMonth < currentMonthStart
        ? new Date(
            selectedEndMonth.getFullYear(),
            selectedEndMonth.getMonth() + 1,
            1,
          )
        : currentMonthStart;
    const monthlySpend: {
      label: string;
      amount: string;
      total: number;
      barWidth: number;
    }[] = [];

    for (
      let monthStart = comparisonStart;
      monthStart < comparisonEnd;
      monthStart = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        1,
      )
    ) {
      const nextMonth = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        1,
      );
      const monthExpense = transactions
        .filter((transaction) => {
          const date = transactionDate(transaction);
          return (
            date !== null &&
            date >= monthStart &&
            date < nextMonth &&
            (transaction.amount ?? 0) < 0
          );
        })
        .reduce(
          (sum, transaction) => sum + Math.abs(transaction.amount ?? 0),
          0,
        );
      monthlySpend.push({
        label: monthStart.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        amount: formatAmount(monthExpense),
        total: monthExpense,
        barWidth: 0,
      });
    }

    const maxMonthlySpend = Math.max(
      0,
      ...monthlySpend.map((month) => month.total),
    );
    for (const month of monthlySpend) {
      month.barWidth =
        maxMonthlySpend > 0 ? (month.total / maxMonthlySpend) * 100 : 0;
    }

    const stories: TransactionInsight[] = [];
    if (!lastMonthTransactions.length) {
      stories.push({
        eyebrow: 'Last month',
        title: `No activity in ${lastMonthLabel}`,
        value: 'A quiet month',
        detail: `There are no ${isEconomii ? 'savings' : 'transaction'} records for ${lastMonthLabel}.`,
      });
    } else {
      const incoming = lastMonthTransactions
        .filter((transaction) => (transaction.amount ?? 0) > 0)
        .reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);
      const outgoing = lastMonthTransactions
        .filter((transaction) => (transaction.amount ?? 0) < 0)
        .reduce(
          (sum, transaction) => sum + Math.abs(transaction.amount ?? 0),
          0,
        );
      const net = incoming - outgoing;
      const expenses = lastMonthTransactions.filter(
        (transaction) => (transaction.amount ?? 0) < 0,
      );
      const categories = new Map<string, number>();
      const merchants = new Map<string, number>();

      for (const transaction of expenses) {
        const category = transaction.categoryLabel || 'Other';
        categories.set(
          category,
          (categories.get(category) ?? 0) + Math.abs(transaction.amount ?? 0),
        );
        const merchant =
          transaction.serviceProvider?.trim() ||
          transaction.merchantName?.trim() ||
          transaction.provider?.trim();
        if (merchant) {
          merchants.set(
            merchant,
            (merchants.get(merchant) ?? 0) + Math.abs(transaction.amount ?? 0),
          );
        }
      }

      stories.push({
        eyebrow: lastMonthLabel,
        title: isEconomii ? 'Your savings movement' : 'Your money in and out',
        value: signedAmount(net),
        detail: `${formatAmount(incoming)} in and ${formatAmount(outgoing)} out across ${lastMonthTransactions.length} ${lastMonthTransactions.length === 1 ? 'transaction' : 'transactions'}.`,
      });

      const largestExpense = expenses.reduce<TransactionDomain | null>(
        (largest, transaction) =>
          Math.abs(transaction.amount ?? 0) > Math.abs(largest?.amount ?? 0)
            ? transaction
            : largest,
        null,
      );
      if (largestExpense) {
        const merchant =
          largestExpense.serviceProvider?.trim() ||
          largestExpense.merchantName?.trim() ||
          largestExpense.provider?.trim() ||
          'A merchant';
        const date = transactionDate(largestExpense);
        stories.push({
          eyebrow: 'Biggest outflow',
          title: 'Your largest transaction',
          value: formatAmount(Math.abs(largestExpense.amount ?? 0)),
          detail: `${merchant}${date ? ` on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}.`,
        });
      }

      const topCategory = Array.from(categories.entries()).sort(
        (first, second) => second[1] - first[1],
      )[0];
      if (topCategory) {
        stories.push({
          eyebrow: 'Spending breakdown',
          title: 'Your top expense category',
          value: topCategory[0],
          detail: `${formatAmount(topCategory[1])} of outgoings in ${lastMonthLabel}.`,
        });
      }

      const topMerchant = Array.from(merchants.entries()).sort(
        (first, second) => second[1] - first[1],
      )[0];
      if (topMerchant) {
        stories.push({
          eyebrow: 'Where it went',
          title: 'Your top merchant',
          value: topMerchant[0],
          detail: `${formatAmount(topMerchant[1])} spent there last month.`,
        });
      }
    }

    if (
      monthlySpend.length > 1 &&
      monthlySpend.some((month) => month.total > 0)
    ) {
      const comparisonTotal = monthlySpend.reduce(
        (sum, month) => sum + month.total,
        0,
      );
      const highestMonth = monthlySpend.reduce((highest, month) =>
        month.total > highest.total ? month : highest,
      );
      stories.push({
        eyebrow: 'Six-month view',
        title: 'How your outgoings changed',
        value: formatAmount(comparisonTotal),
        detail: `Highest month: ${highestMonth.label} at ${highestMonth.amount}. Average: ${formatAmount(comparisonTotal / monthlySpend.length)} per month.`,
        monthlySpend: monthlySpend.map(({ label, amount, barWidth }) => ({
          label,
          amount,
          barWidth,
        })),
      });
    }

    return stories;
  }
}
