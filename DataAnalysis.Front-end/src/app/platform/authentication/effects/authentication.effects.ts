import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { debounceTime, filter, first, map, switchMap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { AuthenticationService } from '../../services/authentication.service';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';
import * as AuthActions from '../actions/authentication.actions';
import { AuthenticationUtils } from '../utils/authentication.utils';
import * as fromState from 'src/app/store/app-state.reducer';

@Injectable()
export class AuthenticationEffects {
  constructor(
    private actions$: Actions,
    private _authService: AuthenticationService,
    private store: Store<fromAppStore.AppState>
  ) {}

  checkToken$ = createEffect(() =>
    this.store.pipe(select(fromState.getRouterUrl)).pipe(
      debounceTime(500),
      filter((url) => url && url === '/'),
      map((_) => {
        const route = AuthenticationUtils.isTokenValid()
          ? '/transactions/1'
          : '/authentication/login';
        return NavigationAction.navigateTo({
          route,
        });
      })
    )
  );

  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ email, password }) =>
          this._authService.login({ email, password }).pipe(first())
        ),
        map(({ token }) => {
          AuthenticationUtils.saveToken(token);
          const route = AuthenticationUtils.isTokenValid(token)
            ? '/transactions/1'
            : '/authentication/login';

          return NavigationAction.navigateTo({ route });
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.register),
        switchMap(({ email, password }) =>
          this._authService.register({ email, password }).pipe(first())
        )
      ),
    { dispatch: false }
  );
}
