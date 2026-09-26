import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import * as LayoutActions from 'src/app/store/actions/layout.actions';
import { TransactionService } from '../services/transaction.service';

@Injectable()
export class TransactionsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromTransactions.State>,
    private readonly _transactionService: TransactionService,
  ) {}

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadTransactions),
      tap(() => LayoutActions.spinnerOn()),
      withLatestFrom(
        this.store.select(fromTransactions.getStartDate),
        this.store.select(fromTransactions.getEndDate),
      ),
      switchMap(([, startDate, endDate]) =>
        this._transactionService.getTransactions(startDate, endDate).pipe(
          switchMap((transactions) =>
            of(
              TransactionsActions.setTransactionsSuccess({ transactions }),
              LayoutActions.spinnerOff(),
            ),
          ),
          catchError((error: unknown) =>
            of(
              TransactionsActions.loadTransactionsFailure({
                message:
                  error instanceof HttpErrorResponse
                    ? error.status === 0
                      ? 'Could not reach the transactions API.'
                      : `Transactions API request failed (${error.status}).`
                    : error instanceof Error
                      ? error.message
                      : 'Failed to load transactions.',
              }),
              LayoutActions.spinnerOff(),
            ),
          ),
        ),
      ),
    ),
  );
}
