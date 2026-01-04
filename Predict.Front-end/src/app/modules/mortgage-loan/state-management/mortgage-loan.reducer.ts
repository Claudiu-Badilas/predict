import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.actions';
import { BaseMortgageLoan } from '../mortgage-loan-detailed/utils/base-mortgage-loan.utils';
import { MortgageInterestProgressChartUtils } from '../mortgage-loan-detailed/utils/mortgage-interest-progress.chart.util';
import { MortgageLoanAmountChartUtils } from '../mortgage-loan-detailed/utils/mortgage-loan-amount.chart.util';
import { MortgageLoanProgressChartUtils } from '../mortgage-loan-detailed/utils/mortgage-loan-progress.chart.util';
import {
  mapBaseRepaymentScheduleToOverview,
  OverviewRepaymentSchedule,
} from '../mortgage-loan-overview/models/overview-mortgage-loan.model';
import { LoanRatesSimulationTrendChartUtils } from '../mortgage-loan-overview/utils/loan-rates-simulation-trend.chart.util';
import { RepaymentSchedule } from './../models/mortgage.model';

interface OverviewMortgageLoanState {
  repaymentSchedules: OverviewRepaymentSchedule[];
  selectedRepaymentScheduleName: string;
  selectedLoanRates: number[];
  startDate: Date;
  selectAll: boolean;
}

export interface MortgageLoanState {
  repaymentSchedules: RepaymentSchedule[];

  overview: OverviewMortgageLoanState;
}

const initialState: MortgageLoanState = {
  repaymentSchedules: [],

  overview: {
    repaymentSchedules: [],
    selectedRepaymentScheduleName: null,
    selectedLoanRates: [],
    startDate: new Date(),
    selectAll: undefined,
  },
};

const mortgageReducer = createReducer(
  initialState,
  on(
    MortgageLoanActions.setMortgagesSuccess,
    (state, { repaymentSchedules }) => ({
      ...state,
      repaymentSchedules,
    })
  ),
  on(
    MortgageLoanActions.selectedMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      overview: { ...state.overview, selectedRepaymentScheduleName: selected },
    })
  ),

  on(
    MortgageLoanActions.selectedOverviewLoanRateChanged,
    (state, { selected }) => {
      const arr = [...state.overview.selectedLoanRates];

      selected.forEach((val) => {
        const index = arr.findIndex((r) => r === val);

        if (index !== -1) arr.splice(index, 1);
        else arr.push(val);
      });

      return {
        ...state,
        overview: { ...state.overview, selectedLoanRates: [...arr] },
      };
    }
  ),
  on(
    MortgageLoanActions.selectAllOverviewLoanRateChanged,
    (state, { selectAll }) => ({
      ...state,
      overview: { ...state.overview, selectAll },
    })
  ),
  on(MortgageLoanActions.startDateChanged, (state, { date }) => ({
    ...state,
    overview: { ...state.overview, startDate: date },
  }))
);

export function reducer(state: MortgageLoanState, action: Action) {
  return mortgageReducer(state, action);
}

const getMortgageLoanState =
  createFeatureSelector<MortgageLoanState>('MortgageLoanState');

export const getRepaymentSchedules = createSelector(
  getMortgageLoanState,
  (state) => state.repaymentSchedules
);

export const getBaseRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  (repaymentSchedules) =>
    repaymentSchedules.find((r) => r.isBasePayment) ?? null
);

export const getLatestRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  (repaymentSchedules) =>
    repaymentSchedules.length > 0
      ? repaymentSchedules
          .slice()
          .sort((a, b) => b.date.valueOf() - a.date.valueOf())
          .at(0)
      : null
);

//################
// OVERVIEW
//################
export const getOverviewMortgageLoanState = createSelector(
  getMortgageLoanState,
  (state) => state.overview
);

export const getSelectedRepaymentScheduleName = createSelector(
  getMortgageLoanState,
  getOverviewMortgageLoanState,
  (state, overview) =>
    overview.selectedRepaymentScheduleName ??
    state.repaymentSchedules[0]?.name ??
    null
);

export const getSelectedRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  getSelectedRepaymentScheduleName,
  (repaymentSchedules, selectedRepaymentScheduleName) =>
    repaymentSchedules?.find(
      (rs) => rs.name === selectedRepaymentScheduleName
    ) ?? null
);

export const getOverviewStartDate = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.startDate
);

export const getSelectAll = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.selectAll
);

export const selectedLoanRates = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.selectedLoanRates
);

export const getSelectedLoanRates = createSelector(
  getSelectedRepaymentSchedule,
  selectedLoanRates,
  getSelectAll,
  (selectedRepaymentSchedule, selectedLoanRates, selectAll) =>
    selectAll === undefined
      ? selectedLoanRates
      : !selectAll
      ? []
      : selectedRepaymentSchedule?.rate?.map((r) => r.nrCtr) ?? []
);

export const getSelectedRepaymentScheduleOverview = createSelector(
  getSelectedRepaymentSchedule,
  getOverviewStartDate,
  getSelectedLoanRates,
  mapBaseRepaymentScheduleToOverview
);

export const getLoanRatesSimulationTrendChart = createSelector(
  getSelectedRepaymentSchedule,
  LoanRatesSimulationTrendChartUtils.getChart
);

//################
// DETAILED
//################
export const getUpdatedBaseRepaymentScheduleBasedOnLatestStates =
  createSelector(
    getBaseRepaymentSchedule,
    getRepaymentSchedules,
    BaseMortgageLoan.getUpdatedBaseRepaymentScheduleBasedOnLatestStates
  );

export const getMortgageLoanProgressChart = createSelector(
  getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  MortgageLoanProgressChartUtils.getChart
);

export const getMortgageInterestProgressChart = createSelector(
  getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  MortgageInterestProgressChartUtils.getChart
);

export const getMortgageLoanAmountChartUtils = createSelector(
  getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  MortgageLoanAmountChartUtils.getChart
);
