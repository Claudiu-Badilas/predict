import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as TransactionsActions from 'src/app/modules/transaction-module/actions/transactions.actions';
import { DateUtils } from 'src/app/shared/utils/date.utils';

export interface State {
  transactions: any[];
  startDate: Date;
  endDate: Date;
}

const initialState: State = {
  transactions: [],
  startDate: DateUtils.getStartOfTheYear({ subtractYears: 5 }),
  endDate: new Date(),
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
  }))
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
