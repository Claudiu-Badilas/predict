import { createSelector } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { BaseMortgageLoanUtils } from '../utils/base-mortgage-loan.utils';
import { MortgageInterestProgressChartUtils } from '../utils/mortgage-interest-progress.chart.util';
import { MortgageLoanAmountChartUtils } from '../utils/mortgage-loan-amount.chart.util';
import { MortgageLoanPaymentsChartUtils } from '../utils/mortgage-loan-payments.chart.util';
import { MortgageLoanProgressChartUtils } from '../utils/mortgage-loan-progress.chart.util';

export const getDetailedMortgageLoanState = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  (state) => state.detiled,
);

export const getDetailedSelectedRepaymentScheduleName = createSelector(
  getDetailedMortgageLoanState,
  (detailed) => detailed.selectedRepaymentScheduleName,
);

export const getDetailedSelectedRepaymentSchedule = createSelector(
  fromMortgageLoan.getRepaymentSchedules,
  getDetailedSelectedRepaymentScheduleName,
  (repaymentSchedules, selectedRepaymentScheduleName) =>
    repaymentSchedules.find((r) => r.name === selectedRepaymentScheduleName),
);

export const getDetailedRepaymentSchedules = createSelector(
  fromMortgageLoan.getRepaymentSchedules,
  getDetailedSelectedRepaymentSchedule,
  (repaymentSchedules, selectedRepaymentSchedule) =>
    repaymentSchedules.filter(
      (r) =>
        !selectedRepaymentSchedule ||
        JsDateUtils.isSameOrBefore(r.date, selectedRepaymentSchedule.date),
    ),
);

export const getUpdatedBaseRepaymentScheduleBasedOnLatestStates =
  createSelector(
    fromMortgageLoan.getBaseRepaymentSchedule,
    getDetailedRepaymentSchedules,
    BaseMortgageLoanUtils.getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  );

export const getMortgageLoanProgressChart = createSelector(
  getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  MortgageLoanProgressChartUtils.getChart,
);

export const getMortgageInterestProgressChart = createSelector(
  getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  MortgageInterestProgressChartUtils.getChart,
);

export const getMortgageLoanAmountChart = createSelector(
  getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  MortgageLoanAmountChartUtils.getChart,
);

export const getMortgageLoanPaymentsChart = createSelector(
  getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  MortgageLoanPaymentsChartUtils.getChart,
);
