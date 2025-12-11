import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import * as fromTransactions from 'src/app/modules/transaction-module/reducers/transactions.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
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
  ],
  declarations: [TransactionComponent],
  exports: [TransactionComponent],
})
export class TransactionModule {}
