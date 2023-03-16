import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import {
  catchError,
  debounceTime,
  filter,
  first,
  map,
  mergeMap,
  skipWhile,
} from 'rxjs/operators';
import { combineLatest, EMPTY, of } from 'rxjs';

import { select, Store } from '@ngrx/store';
import { AuthenticationService } from '../../services/authentication.service';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { navigateTo } from 'src/app/store/navigation-state/navigation.actions';

const ERROR_MSG = 'Some problems occurred, please refresh the page!';
@Injectable()
export class AuthenticationEffects {
  constructor(
    private actions$: Actions,
    private _authService: AuthenticationService,
    private store: Store<fromAppStore.AppState>
  ) {}

  loadUrl$ = createEffect(() =>
    this.store.pipe(select(fromAppStore.getRouterUrl)).pipe(
      skipWhile((a) => a?.includes('auth')),
      map((params) => {
        console.log(
          '🚀 ~ file: authentication-effects.effects.ts:32 ~ AuthenticationEffects ~ map ~ params:',
          params
        );
        return null; //navigateTo({ route: 'transactions' });
      })
    )
  );
}
