import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.scss'],
  standalone: false,
})
export class ReceiptsComponent {
  receipts$ = this.store.select(fromReceipts.getReceipts);

  constructor(private readonly store: Store<fromReceipts.State>) {
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }
}
