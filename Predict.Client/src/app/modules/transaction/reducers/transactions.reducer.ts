import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TransactionDomain } from '../models/transactions.model';

export interface State {
  transactions: TransactionDomain[];
  startDate: Date;
  endDate: Date;
  viewMode: 'all' | 'monthly' | 'yearly';
}

const initialState: State = {
  transactions: [],
  startDate: new Date('2025-01-01'),
  endDate: new Date(),
  viewMode: 'all',
};

export const TransactionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({ availableTransactions: state.transactions })),
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
