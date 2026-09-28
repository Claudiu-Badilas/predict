import { Params } from '@angular/router';
import * as fromRouter from '@ngrx/router-store';
import { getRouterSelectors, RouterReducerState } from '@ngrx/router-store';
import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import * as fromLayout from 'src/app/store/reducers/layout.reducer';
import { RouterState } from './services/router-serializer';
import { ToastType } from '../core/toast-notifications/models/toast-type.model';
import * as ToastActions from '../core/toast-notifications/actions/toast-notification.actions';
import { createReducer, on } from '@ngrx/store';
import { ToastMessage } from '../core/toast-notifications/actions/toast-notification.actions';

export interface Toast extends ToastMessage {
  id: number;
  toastType: ToastType;
}

export interface ToastState {
  toasts: Toast[];
  nextId: number;
}

const initialToastState: ToastState = { toasts: [], nextId: 1 };

const createToast = (id: number, toast: ToastMessage): Toast => ({
  id,
  message: toast.message,
  toastType: toast.toastType ?? ToastType.Info,
});

export const toastReducer = createReducer(
  initialToastState,
  on(ToastActions.showToast, (state, toast) => ({
    toasts: [...state.toasts, createToast(state.nextId, toast)],
    nextId: state.nextId + 1,
  })),
  on(ToastActions.showMultipleToasts, (state, { toasts }) => ({
    toasts: [
      ...state.toasts,
      ...toasts.map((toast, index) => createToast(state.nextId + index, toast)),
    ],
    nextId: state.nextId + toasts.length,
  })),
  on(ToastActions.dismissToast, (state, { id }) => ({
    ...state,
    toasts: state.toasts.filter((toast) => toast.id !== id),
  })),
);

export interface AppState {
  router: fromRouter.RouterReducerState<RouterState>;
  layout: fromLayout.State;
  toast: ToastState;
}

export const appReducer: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  layout: fromLayout.reducer,
  toast: toastReducer,
};

export const selectToast = createSelector(
  createFeatureSelector<ToastState>('toast'),
  (state) => state.toasts,
);

const getRouterState =
  createFeatureSelector<fromRouter.RouterReducerState<RouterState>>('router');

// `router` is used as the default feature name. You can use the feature name
// of your choice by creating a feature selector and pass it to the
// `getRouterSelectors` function.
export const selectRouter =
  createFeatureSelector<RouterReducerState<RouterState>>('router');

export const {
  selectCurrentRoute, // select the current route
  selectFragment, // select the current route fragment
  selectQueryParams, // select the current route query params
  selectQueryParam, // factory function to select a query param
  selectRouteParams, // select the current route params
  selectRouteParam, // factory function to select a route param
  selectRouteData, // select the current route data
  selectRouteDataParam, // factory function to select a route data param
  selectUrl, // select the current url
  selectTitle, // select the title if available
} = getRouterSelectors(selectRouter);

// Your serializer already flattens params from every route level,
// so `selectRouteParams` is effectively the same as "nested params".
export const selectRouteNestedParams = selectRouteParams;

export const getRouterParams = createSelector(
  getRouterState,
  (state: fromRouter.RouterReducerState<RouterState> | undefined) =>
    state?.state?.params ?? null,
);

export const getRouterUrl = createSelector(
  getRouterState,
  (state: fromRouter.RouterReducerState<RouterState> | undefined) =>
    state?.state?.url ?? null,
);

export const getRouterQueryParams = createSelector(
  getRouterState,
  (state: fromRouter.RouterReducerState<RouterState> | undefined) =>
    state?.state?.queryParams ?? null,
);

export const selectRouteNestedParam = (param: string) =>
  createSelector(
    selectRouteParams,
    (params: Params) => params?.[param] ?? null,
  );
