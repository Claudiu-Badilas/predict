import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { first, map, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AuthenticationService } from '../../services/authentication.service';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';
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
        switchMap(({ email, password }) => {
          return this._authService.login({ email, password }).pipe(first());
        }),
        map((response) => {
          AuthenticationUtils.saveToken(response.token);
          if (!AuthenticationUtils.isTokenValid(response.token)) {
            this.store.dispatch(
              NavigationAction.navigateTo({ route: '/authentication/login' })
            );
          } else {
            this.store.dispatch(
              NavigationAction.navigateTo({ route: '/transactions/1' })
            );
          }
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.register),
        switchMap(({ email, password }) => {
          return this._authService.register({ email, password }).pipe(first());
        })
      ),
    { dispatch: false }
  );
}
