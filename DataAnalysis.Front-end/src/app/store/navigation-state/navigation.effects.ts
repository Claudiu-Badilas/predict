import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import { Router } from '@angular/router';
import * as NavigationActions from './navigation.actions';

@Injectable()
export class NavigationEffects {
  constructor(private actions$: Actions, private router: Router) {}

  navigateTo$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(NavigationActions.navigateTo),
        tap((action) => this.router.navigate([action.route]))
      ),
    { dispatch: false }
  );
}
