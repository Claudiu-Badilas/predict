import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';

import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { TransactionsStore } from 'src/app/modules/transaction/reducers/transactions.reducer';
import { TransactionsSettingsComponent } from './components/transaction-settings/transaction-settings.component';

@Component({
  selector: 'p-transaction',
  imports: [
    CommonModule,
    CommonModule,
    RouterModule,
    TopBarComponent,
    CommonModule,
    CommonModule,
    RangeSelectorComponent,
    TopBarComponent,
  ],
  templateUrl: './transaction.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {
  private readonly transactionsStore = inject(TransactionsStore);
  startDate = this.transactionsStore.startDate;
  endDate = this.transactionsStore.endDate;
  minDate = new Date('2016-01-01');
  maxDate = new Date('2030-01-01');

  constructor(
    private readonly store: Store<fromTransactions.State>,
    private readonly modalService: NgbModal,
  ) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  openStorageSettings(): void {
    this.modalService.open(TransactionsSettingsComponent, {
      centered: true,
      size: 'lg',
      scrollable: true,
    });
  }

  handleRangeChange(value: any) {
    this.store.dispatch(
      TransactionsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    );
    this.store.dispatch(TransactionsActions.loadTransactions());
  }
}
