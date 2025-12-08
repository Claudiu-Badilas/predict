import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

 
import * as ToastActions from '../actions/toast-notification.actions';

@Injectable()
export class ToastNotificationEffects {
  constructor(
    private actions$: Actions,
  ) {}

  showToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ToastActions.showToast),
        map(({ message, toastType }) => {
          
        })
      ),
    { dispatch: false }
  );
}
