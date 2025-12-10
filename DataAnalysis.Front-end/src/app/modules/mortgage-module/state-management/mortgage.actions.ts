import { createAction, props } from '@ngrx/store';
import { RepaymentSchedule } from './../models/mortgage.model';

export const loadRepaymentSchedules = createAction(
  '[Mortgage] Load Repayment Schedule'
);

export const setMortgagesSuccess = createAction(
  '[Mortgage] Set Mortgages Success',
  props<{ repaymentSchedules: RepaymentSchedule[] }>()
);
