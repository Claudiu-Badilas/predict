import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as InvoicesActions from 'src/app/modules/invoices/actions/invoices.actions';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { LocationInvoice } from '../models/invoice.model';

export interface State {
  invoices: LocationInvoice[];
  startDate: Date;
  endDate: Date;
}

const initialState: State = {
  invoices: [],
  startDate: DateUtils.getStartOfTheYear({ subtractYears: 1 }),
  endDate: new Date(),
};

const invoicesReducer = createReducer(
  initialState,
  on(InvoicesActions.setInvoicesSuccess, (state, { invoices }) => ({
    ...state,
    invoices,
  })),
  on(InvoicesActions.dateRangeChanged, (state, { startDate, endDate }) => ({
    ...state,
    startDate,
    endDate,
  }))
);

export function reducer(state: State, action: Action) {
  return invoicesReducer(state, action);
}

const getInvoicesState = createFeatureSelector<State>('InvoicesState');

export const getStartDate = createSelector(
  getInvoicesState,
  (state) => state.startDate
);

export const getEndDate = createSelector(
  getInvoicesState,
  (state) => state.endDate
);

export const getInvoices = createSelector(
  getInvoicesState,
  (state) => state.invoices
);
