import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionRoutingModule } from './transaction.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';

@NgModule({
  imports: [CommonModule, TransactionRoutingModule, NgbModule, SideBarModule],
  declarations: [TransactionComponent],
  exports: [TransactionComponent],
})
export class TransactionModule {}
