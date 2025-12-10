import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as MortgageActions from 'src/app/modules/mortgage-module/state-management/mortgage.actions';
import {
  mapBaseRepaymentScheduleToOverview,
  OverviewRepaymentSchedule,
} from '../mortgage-overview/models/mortgage-loan-overview.model';
import { RepaymentSchedule } from './../models/mortgage.model';

interface MortgageLoanOverviewState {
  repaymentSchedules: OverviewRepaymentSchedule[];
  selectedLoanRates: number[];
  startDate: Date;
  selectAll: boolean;
}

export interface MortgageState {
  repaymentSchedules: RepaymentSchedule[];
  selectedRepaymentScheduleName: string;

  overview: MortgageLoanOverviewState;
}

const initialState: MortgageState = {
  repaymentSchedules: [],
  selectedRepaymentScheduleName: null,

  overview: {
    repaymentSchedules: [],
    selectedLoanRates: [],
    startDate: new Date(),
    selectAll: undefined,
  },
};

const mortgageReducer = createReducer(
  initialState,
  on(MortgageActions.setMortgagesSuccess, (state, { repaymentSchedules }) => ({
    ...state,
    repaymentSchedules,
  })),
  on(MortgageActions.selectedMortgageLoanChanged, (state, { selected }) => ({
    ...state,
    selectedRepaymentScheduleName: selected,
  })),

  on(MortgageActions.selectedOverviewLoanRateChanged, (state, { selected }) => {
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
  }),
  on(
    MortgageActions.selectAllOverviewLoanRateChanged,
    (state, { selectAll }) => ({
      ...state,
      overview: { ...state.overview, selectAll },
    })
  ),
  on(MortgageActions.startDateChanged, (state, { date }) => ({
    ...state,
    overview: { ...state.overview, startDate: date },
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

export const getSelectedRepaymentScheduleName = createSelector(
  getMortgageState,
  (state) =>
    state.selectedRepaymentScheduleName ??
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

//################
// OVERVIEW
//################
export const getOverviewMortgageLoanState = createSelector(
  getMortgageState,
  (state) => state.overview
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
