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
  selectedProvider: string;
  selectedServiceProvider: string;
  searchTerm: string;
  viewMode: 'all' | 'monthly' | 'yearly';
}

const initialState: State = {
  transactions: [],
  startDate: new Date('2017-12-10'),
  endDate: new Date(),
  selectedProvider: 'RAIFFEISEN',
  selectedServiceProvider: 'No Selection',
  searchTerm: null,
  viewMode: 'monthly',
};

export const TransactionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => {
    const filteredTransactions = computed(() =>
      state.transactions().filter((transaction) => !transaction.ignored),
    );
    const byProvider = computed(() =>
      filteredTransactions().filter(
        (transaction) =>
          state.selectedProvider() === 'No Selection' ||
          transaction.provider === state.selectedProvider(),
      ),
    );
    const byServiceProvider = computed(() =>
      byProvider().filter(
        (transaction) =>
          state.selectedServiceProvider() === 'No Selection' ||
          transaction.serviceProvider === state.selectedServiceProvider(),
      ),
    );
    const bySearchTerm = computed(() =>
      byServiceProvider().filter((transaction) => {
        const searchTerm = state.searchTerm();
        if (!searchTerm) return true;
        return searchTerm
          .toLowerCase()
          .split(',')
          .map((term) => term.trim())
          .filter(Boolean)
          .some((term) => transaction.description.toLowerCase().includes(term));
      }),
    );
    const availableTransactions = computed(() => {
      const seen = new Set<string>();
      return bySearchTerm().filter((transaction) => {
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
          bySearchTerm(),
        ),
      ),
      monthlyTransactionsChart: computed(() =>
        MonthlyTransactionChartUtils.getChart(
          state.startDate(),
          state.endDate(),
          bySearchTerm(),
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
    setSelectedProvider(selectedProvider: string): void {
      patchState(state, { selectedProvider });
    },
    setSelectedServiceProvider(selectedServiceProvider: string): void {
      patchState(state, { selectedServiceProvider });
    },
    setSearchTerm(searchTerm: string): void {
      patchState(state, { searchTerm });
    },
    setViewMode(viewMode: State['viewMode']): void {
      patchState(state, { viewMode });
    },
  })),
);
