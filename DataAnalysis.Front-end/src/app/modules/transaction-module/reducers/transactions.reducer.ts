import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as TransactionsActions from 'src/app/modules/transaction-module/actions/transactions.actions';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { TransactionDomain } from '../models/transactions.model';

export interface State {
  transactions: TransactionDomain[];
  startDate: Date;
  endDate: Date;
  selectedServiceProvider: string;
}

const initialState: State = {
  transactions: [],
  startDate: DateUtils.getStartOfTheYear({ subtractYears: 10 }),
  endDate: new Date(),
  selectedServiceProvider: 'No Selection',
};

const transactionsReducer = createReducer(
  initialState,
  on(TransactionsActions.setTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
  })),
  on(TransactionsActions.dateRangeChanged, (state, { startDate, endDate }) => ({
    ...state,
    startDate,
    endDate,
  })),
  on(
    TransactionsActions.selectedServiceProviderChanged,
    (state, { serviceProvider }) => ({
      ...state,
      selectedServiceProvider: serviceProvider,
    })
  )
);

export function reducer(state: State, action: Action) {
  return transactionsReducer(state, action);
}

const getTransactionsState = createFeatureSelector<State>('TransactionsState');

export const getStartDate = createSelector(
  getTransactionsState,
  (state) => state.startDate
);

export const getEndDate = createSelector(
  getTransactionsState,
  (state) => state.endDate
);

export const getTransactions = createSelector(
  getTransactionsState,
  (state) => state.transactions
);

export const getSelectedServiceProvider = createSelector(
  getTransactionsState,
  (state) => state.selectedServiceProvider
);

export const getAvailableTransactions = createSelector(
  getTransactions,
  getSelectedServiceProvider,
  (transactions, selectedServiceProvider) =>
    transactions.filter(
      (t) =>
        selectedServiceProvider === 'No Selection' ||
        t.serviceProvider === selectedServiceProvider
    )
);
