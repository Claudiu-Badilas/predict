import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  debounceTime,
  filter,
  first,
  map,
  mergeMap,
  skipWhile,
  switchMap,
} from 'rxjs/operators';
import { combineLatest, EMPTY, of } from 'rxjs';

import { select, Store } from '@ngrx/store';
import { AuthenticationService } from '../../services/authentication.service';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { navigateTo } from 'src/app/store/navigation-state/navigation.actions';
import * as AuthActions from '../actions/authentication.actions';
import { AuthenticationUtils } from '../utils/authentication.utils';

const ERROR_MSG = 'Some problems occurred, please refresh the page!';
@Injectable()
export class AuthenticationEffects {
  constructor(
    private actions$: Actions,
    private _authService: AuthenticationService,
    private store: Store<fromAppStore.AppState>
  ) {}

  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap((action) => {
          return this._authService
            .login({ email: action.email, password: action.password })
            .pipe(first());
        }),
        map((response) => {
          console.log('🚀 ~  response:', response);
          AuthenticationUtils.saveToken(response.token);
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.register),
        switchMap((action) => {
          return this._authService
            .register({ email: action.email, password: action.password })
            .pipe(first());
        })
      ),
    { dispatch: false }
  );
}
