import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';

import * as TransactionsActions from 'src/app/modules/transaction-module/actions/transactions.actions';
import { TransactionService } from '../services/transaction.service';

@Injectable()
export class TransactionsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly _transactionService: TransactionService
  ) {}

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadTransactions),
      switchMap(() => this._transactionService.getTransactions()),
      map((transactions) =>
        TransactionsActions.setTransactionsSuccess({ transactions })
      )
    )
  );
}
