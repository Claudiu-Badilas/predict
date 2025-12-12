import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { DateUtils } from 'src/app/shared/utils/date.utils';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.scss'],
  standalone: false,
})
export class ReceiptsComponent {
  startDate$ = this.store
    .select(fromReceipts.getStartDate)
    .pipe(map((d) => DateUtils.fromJsDateToString(d)));
  endDate$ = this.store
    .select(fromReceipts.getEndDate)
    .pipe(map((d) => DateUtils.fromJsDateToString(d)));
  receipts$ = this.store.select(fromReceipts.getReceipts);

  constructor(private readonly store: Store<fromReceipts.State>) {
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }

  handleRangeChange(value: any) {
    this.store.dispatch(
      ReceiptsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      })
    );
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }
}
