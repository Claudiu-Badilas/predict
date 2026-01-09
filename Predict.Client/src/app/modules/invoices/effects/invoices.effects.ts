import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as InvoicesActions from 'src/app/modules/invoices/actions/invoices.actions';
import * as fromInvoices from 'src/app/modules/invoices/reducers/invoices.reducer';
import * as LayoutActions from 'src/app/store/actions/layout.actions';
import { InvoicesService } from '../services/invoices.service';

@Injectable()
export class InvoicesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromInvoices.State>,
    private readonly _invoicesService: InvoicesService
  ) {}

  loadInvoices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.loadInvoices),
      tap(() => LayoutActions.spinnerOn()),
      withLatestFrom(
        this.store.select(fromInvoices.getStartDate),
        this.store.select(fromInvoices.getEndDate)
      ),
      switchMap(([, startDate, endDate]) =>
        this._invoicesService.getInvoices(startDate, endDate)
      ),
      switchMap((invoices) => [
        InvoicesActions.setInvoicesSuccess({ invoices }),
        LayoutActions.spinnerOff(),
      ])
    )
  );
}
