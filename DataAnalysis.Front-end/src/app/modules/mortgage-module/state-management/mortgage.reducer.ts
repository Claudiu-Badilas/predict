import { RepaymentSchedule } from './../models/mortgage.model';
import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as MortgageActions from 'src/app/modules/mortgage-module/state-management/mortgage.actions';

export interface MortgageState {
  repaymentSchedules: RepaymentSchedule[];
}

const initialState: MortgageState = {
  repaymentSchedules: [],
};

const mortgageReducer = createReducer(
  initialState,
  on(MortgageActions.setMortgagesSuccess, (state, { repaymentSchedules }) => ({
    ...state,
    repaymentSchedules,
  }))
);

export function reducer(state: MortgageState, action: Action) {
  return mortgageReducer(state, action);
}

const getMortgageState = createFeatureSelector<MortgageState>('MortgageState');

export const getRepaymentSchedules = createSelector(
  getMortgageState,
  (state) => state.repaymentSchedules
);
