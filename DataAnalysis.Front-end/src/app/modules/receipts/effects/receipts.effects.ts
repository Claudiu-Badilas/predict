import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromTransactions from 'src/app/modules/transaction-module/reducers/transactions.reducer';
import { ReceiptsService } from '../services/receipts.service';

@Injectable()
export class ReceiptsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromTransactions.State>,
    private readonly _receiptsService: ReceiptsService
  ) {}

  loadReceipts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReceiptsActions.loadReceipts),
      withLatestFrom(
        this.store.select(fromTransactions.getStartDate),
        this.store.select(fromTransactions.getEndDate)
      ),
      switchMap(([, startDate, endDate]) =>
        this._receiptsService.getReceipts(startDate, endDate)
      ),
      map((receipts) => ReceiptsActions.setReceiptsSuccess({ receipts }))
    )
  );
}
