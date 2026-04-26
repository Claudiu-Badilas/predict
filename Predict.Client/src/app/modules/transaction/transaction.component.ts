import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import { TransactionHeaderComponent } from './components/transaction-header/transaction-header.component';
import { TransactionTableComponent } from './components/transaction-table/transaction-table.component';

@Component({
  selector: 'p-transaction',
  imports: [
    CommonModule,
    RangeSelectorComponent,
    DropdownSelectComponent,
    SearchInputComponent,
    TransactionHeaderComponent,
    HighchartWrapperComponent,
    TransactionTableComponent,
    TopBarComponent,
  ],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {
  startDate$ = this.store.select(fromTransactions.getStartDate);
  endDate$ = this.store.select(fromTransactions.getEndDate);

  transactions$ = this.store.select(fromTransactions.getAvailableTransactions);
  providerDropDownSelectOptions$ = this.store
    .select(fromTransactions.getTransactions)
    .pipe(map((t) => ['No Selection', ...new Set(t.map((x) => x.provider))]));
  selectedProvider$ = this.store.select(fromTransactions.getSelectedProvider);

  dropDownSelectOptions$ = this.store
    .select(fromTransactions.getTransactions)
    .pipe(
      map((t) => ['No Selection', ...new Set(t.map((x) => x.serviceProvider))]),
    );
  selectedServiceProvider$ = this.store.select(
    fromTransactions.getSelectedServiceProvider,
  );
  monthlyTransactionsChart$ = this.store.select(
    fromTransactions.getMonthlyTransactionsChart,
  );
  dailyTransactionsChart$ = this.store.select(
    fromTransactions.getDailyTransactionsChart,
  );

  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  minDate = new Date('2018-01-01');
  maxDate = new Date('2030-01-01');

  handleRangeChange(value: any) {
    this.store.dispatch(
      TransactionsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    );
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  onProviderDropdownSelected(value: string) {
    this.store.dispatch(
      TransactionsActions.selectedProviderChanged({ provider: value }),
    );
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      TransactionsActions.selectedServiceProviderChanged({
        serviceProvider: value,
      }),
    );
  }

  onSearch(value: string) {
    this.store.dispatch(
      TransactionsActions.searchTermChanged({ searchTerm: value }),
    );
  }
}
