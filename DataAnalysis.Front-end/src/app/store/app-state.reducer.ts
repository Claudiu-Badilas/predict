import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { getRouterSelectors } from '@ngrx/router-store';
import * as fromRouter from '@ngrx/router-store';
import { RouterState } from './navigation-state/router-serializer';

export interface AppState {
  router: fromRouter.RouterReducerState<RouterState>;
}

export const appReducer: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
};

const getRouterState =
  createFeatureSelector<fromRouter.RouterReducerState<RouterState>>('router');

export const {
  selectCurrentRoute, // select the current route
  selectFragment, // select the current route fragment
  selectQueryParams, // select the current route query params
  selectQueryParam, // factory function to select a query param
  selectRouteParams, // select the current route params
  selectRouteParam, // factory function to select a route param
  selectRouteData, // select the current route data
  selectUrl, // select the current url
} = getRouterSelectors();

export const getRouterParams = createSelector(
  getRouterState,
  (state: fromRouter.RouterReducerState<RouterState>) => state?.state?.params
);

export const getRouterUrl = createSelector(
  getRouterState,
  (state: fromRouter.RouterReducerState<RouterState>) => state?.state?.url
);
