import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import * as fromTransactions from 'src/app/modules/transaction-module/reducers/transactions.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { TransactionHeaderComponent } from './components/transaction-header/transaction-header.component';
import { TransactionTableComponent } from './components/transaction-table/transaction-table.component';
import { TransactionsEffects } from './effects/transactions.effects';
import { TransactionComponent } from './transaction.component';
import { TransactionRoutingModule } from './transaction.routing';

@NgModule({
  imports: [
    CommonModule,
    TransactionRoutingModule,
    NgbModule,
    SideBarModule,
    RangeSelectorComponent,
    StoreModule.forFeature('TransactionsState', fromTransactions.reducer),
    EffectsModule.forFeature([TransactionsEffects]),
    DropdownSelectComponent,
    TransactionHeaderComponent,
    HighchartWrapperComponent,
    SearchInputComponent,
    TransactionTableComponent,
  ],
  declarations: [TransactionComponent],
  exports: [TransactionComponent],
})
export class TransactionModule {}
