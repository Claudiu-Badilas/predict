import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import * as LayoutActions from 'src/app/store/actions/layout.actions';
import { LoanService } from '../services/loan.service';

@Injectable()
export class LoanEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly _loanService: LoanService,
    private readonly store: Store<fromLoan.LoanState>,
  ) {}

  loadRepaymentSchedules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoanActions.loadRepaymentSchedules),
      tap(() => LayoutActions.spinnerOn()),
      switchMap(() =>
        this._loanService.getRepaymentSchedules().pipe(
          withLatestFrom(
            this.store.select(fromLoan.getCalculateRepaymentSchedules),
          ),
          switchMap(([loans, calculateRepaymentSchedules]) => {
            const base = loans.find((loan) => loan.isBasePayment);

            const variableInterestStartDate =
              base.monthlyInstalments[5 * 12 - 1].paymentDate;

            const repaymentSchedules = loans.map((schedule) => {
              if (calculateRepaymentSchedules) {
                schedule.recalculateFixedRate(variableInterestStartDate);
              }
              return schedule;
            });

            return of(
              LoanActions.setLoansSuccess({ repaymentSchedules }),
              LayoutActions.spinnerOff(),
            );
          }),
          catchError((error: unknown) =>
            of(
              LoanActions.loadRepaymentSchedulesFailure({
                message:
                  error instanceof HttpErrorResponse
                    ? error.status === 0
                      ? 'Could not reach the loan API. Check that it is running and accessible.'
                      : `Loan API request failed (${error.status}): ${error.message}`
                    : error instanceof Error
                      ? error.message
                      : 'Failed to load repayment schedules.',
              }),
              LayoutActions.spinnerOff(),
            ),
          ),
        ),
      ),
    ),
  );
}
