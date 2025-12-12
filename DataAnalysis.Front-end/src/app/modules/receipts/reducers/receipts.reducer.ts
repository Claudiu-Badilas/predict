import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import { DateUtils } from 'src/app/shared/utils/date.utils';

export interface State {
  receipts: any[];
  startDate: Date;
  endDate: Date;
}

const initialState: State = {
  receipts: [],
  startDate: DateUtils.getStartOfTheYear({ subtractYears: 0 }),
  endDate: new Date(),
};

const receiptsReducer = createReducer(
  initialState,
  on(ReceiptsActions.setReceiptsSuccess, (state, { receipts }) => ({
    ...state,
    receipts,
  })),
  on(ReceiptsActions.dateRangeChanged, (state, { startDate, endDate }) => ({
    ...state,
    startDate,
    endDate,
  }))
);

export function reducer(state: State, action: Action) {
  return receiptsReducer(state, action);
}

const getReceiptsState = createFeatureSelector<State>('ReceiptsState');

export const getStartDate = createSelector(
  getReceiptsState,
  (state) => state.startDate
);

export const getEndDate = createSelector(
  getReceiptsState,
  (state) => state.endDate
);

export const getReceipts = createSelector(
  getReceiptsState,
  (state) => state.receipts
);
