import { Action, createFeatureSelector, createReducer, on } from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as MortgageLoanCompareActions from 'src/app/modules/mortgage-loan/mortgage-loan-compare/actions/mortgage-loan-compare.actions';

export interface MortgageLoanStateCompare {
  leftSelectedRepaymentScheduleName: string;
  rightSelectedRepaymentScheduleName: string;
  isBaseSelected: boolean;
}

const initialState: MortgageLoanStateCompare = {
  leftSelectedRepaymentScheduleName: null,
  rightSelectedRepaymentScheduleName: 'No Selection',
  isBaseSelected: true,
};

const mortgageReducer = createReducer(
  initialState,
  on(
    MortgageLoanCompareActions.selectedLeftMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      leftSelectedRepaymentScheduleName: selected,
    }),
  ),
  on(
    MortgageLoanCompareActions.selectedRightMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      rightSelectedRepaymentScheduleName: selected,
    }),
  ),
  on(
    MortgageLoanCompareActions.baseMortgageLoanChanged,
    (state, { selected }) => ({ ...state, isBaseSelected: selected }),
  ),
);

export function reducer(state: MortgageLoanStateCompare, action: Action) {
  return mortgageReducer(state, action);
}

export const getMortgageLoanStateCompare =
  createFeatureSelector<MortgageLoanStateCompare>('MortgageLoanStateCompare');
