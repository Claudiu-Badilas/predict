import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import * as fromInvoices from 'src/app/modules/invoices/reducers/invoices.reducer';
import { InvoicesEffects } from './effects/invoices.effects';
import { InvoicesComponent } from './invoices.component';
import { InvoicesRoutingModule } from './invoices.routing';
import { InvoicesService } from './services/invoices.service';

@NgModule({
  imports: [
    CommonModule,
    InvoicesRoutingModule,
    StoreModule.forFeature('InvoicesState', fromInvoices.reducer),
    EffectsModule.forFeature([InvoicesEffects]),
  ],
  declarations: [InvoicesComponent],
  exports: [InvoicesComponent],
  providers: [InvoicesService],
})
export class InvoicesModule {}
