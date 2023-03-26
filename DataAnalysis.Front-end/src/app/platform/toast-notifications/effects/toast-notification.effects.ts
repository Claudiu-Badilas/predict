import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { MessageService } from 'primeng/api';

import * as ToastActions from '../actions/toast-notification.actions';

@Injectable()
export class ToastNotificationEffects {
  constructor(
    private actions$: Actions,
    private messageService: MessageService
  ) {}

  showToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ToastActions.showToast),
        map(({ message, toastType }) => {
          this.messageService.add({
            severity: toastType ? toastType : 'error',
            summary: toastType ? toastType : 'error',
            detail: message,
          });
        })
      ),
    { dispatch: false }
  );
}
