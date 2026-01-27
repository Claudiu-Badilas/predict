import { createSelector } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { InstalmentSimulationTrendChartUtils } from '../utils/instalment-simulation.chart.utils';
import { mapBaseRepaymentScheduleToOverview } from '../utils/overview-mortgage-loan.utils';
import { generateMonthlyInstalmentBatches } from '../utils/monthly-instalment-batches.utils';

export const getOverviewMortgageLoanState = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  (state) => state.overview,
);

export const getSelectedRepaymentScheduleName = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  getOverviewMortgageLoanState,
  (state, overview) =>
    overview.selectedRepaymentScheduleName ??
    state.repaymentSchedules[0]?.name ??
    null,
);

export const getSelectedRepaymentSchedule = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  getSelectedRepaymentScheduleName,
  (state, selectedRepaymentScheduleName) =>
    state.repaymentSchedules?.find(
      (rs) => rs.name === selectedRepaymentScheduleName,
    ) ?? null,
);

export const getOverviewStartDate = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.startDate,
);

export const selectedInstalmentPayments = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.selectedInstalmentPayments,
);

export const selectedEarlyPayments = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.selectedEarlyPayments,
);

export const getSelectedRepaymentScheduleOverview = createSelector(
  getSelectedRepaymentSchedule,
  getOverviewStartDate,
  selectedInstalmentPayments,
  selectedEarlyPayments,
  mapBaseRepaymentScheduleToOverview,
);

export const getMonthlyInstalmentBatches = createSelector(
  getSelectedRepaymentSchedule,
  getOverviewStartDate,
  selectedInstalmentPayments,
  selectedEarlyPayments,
  generateMonthlyInstalmentBatches,
);

export const getInstalmentSimulationTrendChart = createSelector(
  getSelectedRepaymentScheduleOverview,
  InstalmentSimulationTrendChartUtils.getChart,
);
