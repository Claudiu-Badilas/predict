import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as MortgageLoanDetailedActions from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/actions/mortgage-loan-detailed.actions';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { BaseMortgageLoan } from '../mortgage-loan-detailed/utils/base-mortgage-loan.utils';
import { MortgageInterestProgressChartUtils } from '../mortgage-loan-detailed/utils/mortgage-interest-progress.chart.util';
import { MortgageLoanAmountChartUtils } from '../mortgage-loan-detailed/utils/mortgage-loan-amount.chart.util';
import { MortgageLoanPaymentsChartUtils } from '../mortgage-loan-detailed/utils/mortgage-loan-payments.chart.util';
import { MortgageLoanProgressChartUtils } from '../mortgage-loan-detailed/utils/mortgage-loan-progress.chart.util';
import { OverviewRepaymentSchedule } from '../mortgage-loan-overview/models/overview-mortgage-loan.model';
import { mapBaseRepaymentScheduleToOverview } from '../mortgage-loan-overview/utils/overview-mortgage-loan.utils';
import { RepaymentSchedule } from './../models/mortgage.model';

interface OverviewMortgageLoanState {
  repaymentSchedules: OverviewRepaymentSchedule[];
  selectedRepaymentScheduleName: string;
  selectedInstalmentPayments: number[];
  selectedEarlyPayments: number[];
  startDate: Date;
}

interface DetailedMortgageLoanState {
  selectedRepaymentScheduleName: string;
}

export interface MortgageLoanState {
  repaymentSchedules: RepaymentSchedule[];

  overview: OverviewMortgageLoanState;

  detiled: DetailedMortgageLoanState;
}

const initialState: MortgageLoanState = {
  repaymentSchedules: [],

  overview: {
    repaymentSchedules: [],
    selectedRepaymentScheduleName: null,
    selectedInstalmentPayments: [],
    selectedEarlyPayments: [],
    startDate: new Date('2025-12-16'),
  },

  detiled: {
    selectedRepaymentScheduleName: null,
  },
};

const mortgageReducer = createReducer(
  initialState,
  on(
    MortgageLoanActions.setMortgagesSuccess,
    (state, { repaymentSchedules }) => ({
      ...state,
      repaymentSchedules,
    }),
  ),
  on(
    MortgageLoanActions.selectedMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      overview: { ...state.overview, selectedRepaymentScheduleName: selected },
    }),
  ),
  on(
    MortgageLoanActions.selectedInstalmentPaymentChanged,
    (state, { values }) => {
      const arr = [...state.overview.selectedInstalmentPayments];

      values.forEach((val) => {
        const index = arr.findIndex((r) => r === val);

        if (index !== -1) arr.splice(index, 1);
        else arr.push(val);
      });

      return {
        ...state,
        overview: { ...state.overview, selectedInstalmentPayments: [...arr] },
      };
    },
  ),
  on(MortgageLoanActions.selectedEarlyPaymentChanged, (state, { values }) => {
    const arr = [...state.overview.selectedEarlyPayments];

    values.forEach((val) => {
      const index = arr.findIndex((r) => r === val);

      if (index !== -1) arr.splice(index, 1);
      else arr.push(val);
    });

    return {
      ...state,
      overview: { ...state.overview, selectedEarlyPayments: [...arr] },
    };
  }),
  on(MortgageLoanActions.startDateChanged, (state, { date }) => ({
    ...state,
    overview: { ...state.overview, startDate: date },
  })),
  on(
    MortgageLoanActions.simulateInstalmentPaymentsChanged,
    (state, { selectedInstalmentPayments, selectedEarlyPayments }) => ({
      ...state,
      overview: {
        ...state.overview,
        selectedInstalmentPayments: [...selectedInstalmentPayments],
        selectedEarlyPayments: [...selectedEarlyPayments],
      },
    }),
  ),

  //DETAILED
  on(
    MortgageLoanDetailedActions.selectedMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      detiled: { ...state.detiled, selectedRepaymentScheduleName: selected },
    }),
  ),
);

export function reducer(state: MortgageLoanState, action: Action) {
  return mortgageReducer(state, action);
}

const getMortgageLoanState =
  createFeatureSelector<MortgageLoanState>('MortgageLoanState');

export const getRepaymentSchedules = createSelector(
  getMortgageLoanState,
  (state) => state.repaymentSchedules,
);

export const getBaseRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  (repaymentSchedules) =>
    repaymentSchedules.find((r) => r.isBasePayment) ?? null,
);

export const getLatestRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  (repaymentSchedules) =>
    repaymentSchedules.length > 0
      ? repaymentSchedules
          .slice()
          .sort((a, b) => b.date.valueOf() - a.date.valueOf())
          .at(0)
      : null,
);

//################
// OVERVIEW
//################
export const getOverviewMortgageLoanState = createSelector(
  getMortgageLoanState,
  (state) => state.overview,
);

export const getSelectedRepaymentScheduleName = createSelector(
  getMortgageLoanState,
  getOverviewMortgageLoanState,
  (state, overview) =>
    overview.selectedRepaymentScheduleName ??
    state.repaymentSchedules[0]?.name ??
    null,
);

export const getSelectedRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  getSelectedRepaymentScheduleName,
  (repaymentSchedules, selectedRepaymentScheduleName) =>
    repaymentSchedules?.find(
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

//################
// DETAILED
//################

export const getDetailedMortgageLoanState = createSelector(
  getMortgageLoanState,
  (state) => state.detiled,
);

export const getDetailedSelectedRepaymentScheduleName = createSelector(
  getDetailedMortgageLoanState,
  (detailed) => detailed.selectedRepaymentScheduleName,
);

export const getDetailedSelectedRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  getDetailedSelectedRepaymentScheduleName,
  (repaymentSchedules, selectedRepaymentScheduleName) =>
    repaymentSchedules.find((r) => r.name === selectedRepaymentScheduleName),
);

export const getDetailedRepaymentSchedules = createSelector(
  getRepaymentSchedules,
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
    getBaseRepaymentSchedule,
    getDetailedRepaymentSchedules,
    BaseMortgageLoan.getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
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
