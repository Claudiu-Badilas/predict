import { createAction, props } from '@ngrx/store';

export const loadInvoices = createAction('[Invoices] Load Invoices');

export const setInvoicesSuccess = createAction(
  '[Invoices] Set Invoices Success',
  props<{ invoices: any[] }>()
);

export const dateRangeChanged = createAction(
  '[Invoices] Date Range Changed',
  props<{ startDate: Date; endDate: Date }>()
);
