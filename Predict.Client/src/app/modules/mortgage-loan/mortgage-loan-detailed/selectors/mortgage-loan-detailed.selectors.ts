import { createSelector } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { MortgageInterestProgressChartUtils } from '../utils/charts/mortgage-interest-progress.chart.util';
import { MortgageLoanAmountChartUtils } from '../utils/charts/mortgage-loan-amount.chart.util';
import { MortgageLoanPaymentsChartUtils } from '../utils/charts/mortgage-loan-payments.chart.util';
import { HistoricalInstalmentPaymentsUtils } from '../utils/historical-instalment-payments.utils';
import { HistoricalInstalmentPaymentBatchesUtils } from '../utils/historical-instalment-payment-batches.utils';

export const getDetailedMortgageLoanState = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  (state) => state.detiled,
);

export const getDetailedSelectedRepaymentScheduleName = createSelector(
  getDetailedMortgageLoanState,
  fromMortgageLoan.getRepaymentSchedules,
  (detailed, repaymentSchedules) =>
    detailed.selectedRepaymentScheduleName || repaymentSchedules[0]?.name,
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

export const getHistoricalInstalmentPayments = createSelector(
  fromMortgageLoan.getBaseRepaymentSchedule,
  getDetailedRepaymentSchedules,
  HistoricalInstalmentPaymentsUtils.getHistoricalInstalmentPayments,
);

export const getHistoricalInstalmentPaymentBatches = createSelector(
  getHistoricalInstalmentPayments,
  HistoricalInstalmentPaymentBatchesUtils.getHistoricalInstalmentPaymentBatches,
);

export const getMortgageInterestProgressChart = createSelector(
  getHistoricalInstalmentPayments,
  MortgageInterestProgressChartUtils.getChart,
);

export const getMortgageLoanAmountChart = createSelector(
  getHistoricalInstalmentPayments,
  MortgageLoanAmountChartUtils.getChart,
);

export const getMortgageLoanPaymentsChart = createSelector(
  getHistoricalInstalmentPayments,
  MortgageLoanPaymentsChartUtils.getChart,
);
