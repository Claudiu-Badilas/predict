import { createAction, props } from '@ngrx/store';
import { RepaymentSchedule } from '../models/mortgage.model';

export const loadRepaymentSchedules = createAction(
  '[Mortgage Loan] Load Repayment Schedule'
);

export const setMortgagesSuccess = createAction(
  '[Mortgage Loan] Set Mortgages Success',
  props<{ repaymentSchedules: RepaymentSchedule[] }>()
);

export const selectedMortgageLoanChanged = createAction(
  '[Mortgage Loan] Selected Mortgages Loan Changed',
  props<{ selected: string }>()
);

export const startDateChanged = createAction(
  '[Mortgage Loan] Start Date Changed',
  props<{ date: Date }>()
);

export const selectedOverviewLoanRateChanged = createAction(
  '[Overview Mortgage Loan] Selected selected Overview Loan Rate Changed',
  props<{ selected: number[] }>()
);
