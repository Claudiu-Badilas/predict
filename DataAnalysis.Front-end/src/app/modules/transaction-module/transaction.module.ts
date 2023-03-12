import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionRoutingModule } from './transaction.routing';

@NgModule({
  imports: [CommonModule, TransactionRoutingModule],
  declarations: [TransactionComponent],
  exports: [TransactionComponent],
})
export class TransactionModule {}
