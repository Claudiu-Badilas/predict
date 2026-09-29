import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TransactionDomain } from '../models/transactions.model';
import { DailyTransactionChartUtils } from '../transaction-overview/utils/daily-transactions.chart.util';
import { MonthlyTransactionChartUtils } from '../transaction-overview/utils/monthly-transactions.chart.util';

export interface State {
  transactions: TransactionDomain[];
  startDate: Date;
  endDate: Date;
  viewMode: 'all' | 'monthly' | 'yearly';
}

const initialState: State = {
  transactions: [],
  startDate: new Date('2026-01-01'), //new Date('2017-12-10'),
  endDate: new Date(),
  viewMode: 'all',
};

export const TransactionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => {
    const filteredTransactions = computed(() =>
      state.transactions().filter((transaction) => !transaction.ignored),
    );
    const availableTransactions = computed(() => {
      const seen = new Set<string>();
      return filteredTransactions().filter((transaction) => {
        const signature = JSON.stringify(transaction);
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });
    });
    return {
      availableTransactions,
      dailyTransactionsChart: computed(() =>
        DailyTransactionChartUtils.getChart(
          state.startDate(),
          state.endDate(),
          filteredTransactions(),
        ),
      ),
      monthlyTransactionsChart: computed(() =>
        MonthlyTransactionChartUtils.getChart(
          state.startDate(),
          state.endDate(),
          filteredTransactions(),
        ),
      ),
    };
  }),
  withMethods((state) => ({
    setTransactions(transactions: TransactionDomain[]): void {
      patchState(state, { transactions });
    },
    setDateRange(startDate: Date, endDate: Date): void {
      patchState(state, { startDate, endDate });
    },
    setViewMode(viewMode: State['viewMode']): void {
      patchState(state, { viewMode });
    },
  })),
);
