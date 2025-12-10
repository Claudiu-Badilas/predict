import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';

import * as MortgageActions from 'src/app/modules/mortgage-module/state-management/mortgage.actions';
import { MortgageService } from '../services/mortgage.service';

@Injectable()
export class MortgageEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly _mortgageService: MortgageService
  ) {}

  loadRepaymentSchedules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MortgageActions.loadRepaymentSchedules),
      switchMap(() => this._mortgageService.getRepaymentSchedules()),
      map((repaymentSchedules) =>
        MortgageActions.setMortgagesSuccess({ repaymentSchedules })
      )
    )
  );
}
