import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as LayoutActions from 'src/app/store/actions/layout.actions';

export interface State {
  loading: boolean;
  minimumVisibleMs: number;
}

const initialState: State = {
  loading: false,
  minimumVisibleMs: 500,
};

const layoutReducer = createReducer(
  initialState,
  on(LayoutActions.spinnerOn, (state, { minimumVisibleMs }) => ({
    ...state,
    loading: true,
    minimumVisibleMs,
  })),
  on(LayoutActions.spinnerOff, (state) => ({ ...state, loading: false })),
);

export function reducer(state: State, action: Action) {
  return layoutReducer(state, action);
}

const getLayoutReducer = createFeatureSelector<State>('layout');

export const getIsLoading = createSelector(
  getLayoutReducer,
  (state) => state.loading,
);

export const getSpinnerMinimumVisibleMs = createSelector(
  getLayoutReducer,
  (state) => state.minimumVisibleMs,
);
