import { createAction, props } from '@ngrx/store';

export const loadReceipts = createAction('[Receipts] Load Receipts');

export const setReceiptsSuccess = createAction(
  '[Receipts] Set Receipts Success',
  props<{ receipts: any[] }>()
);

export const dateRangeChanged = createAction(
  '[Receipts] Date Range Changed',
  props<{ startDate: Date; endDate: Date }>()
);
