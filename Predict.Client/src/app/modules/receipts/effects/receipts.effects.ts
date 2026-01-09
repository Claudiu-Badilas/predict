import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import * as LayoutActions from 'src/app/store/actions/layout.actions';
import { ReceiptsService } from '../services/receipts.service';

@Injectable()
export class ReceiptsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromReceipts.State>,
    private readonly _receiptsService: ReceiptsService
  ) {}

  loadReceipts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReceiptsActions.loadReceipts),
      tap(() => LayoutActions.spinnerOn()),
      withLatestFrom(
        this.store.select(fromReceipts.getStartDate),
        this.store.select(fromReceipts.getEndDate)
      ),
      switchMap(([, startDate, endDate]) =>
        this._receiptsService.getReceipts(startDate, endDate)
      ),
      switchMap((receipts) => [
        ReceiptsActions.setReceiptsSuccess({ receipts }),
        LayoutActions.spinnerOff(),
      ])
    )
  );
}
