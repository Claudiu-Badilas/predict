import { createAction, props } from '@ngrx/store';

export const loadTransactions = createAction(
  '[Transactions] Load Transactions'
);

export const setTransactionsSuccess = createAction(
  '[Transactions] Set Transactions Success',
  props<{ transactions: any[] }>()
);
