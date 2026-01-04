import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { MortgageLoanComponent } from './mortgage-loan.component';
import { MortgageLoanRoutingModule } from './mortgage-loan.routing';
import { MortgageLoanEffects } from './state-management/mortgage-loan.effects';

@NgModule({
  imports: [
    MortgageLoanRoutingModule,
    StoreModule.forFeature('MortgageLoanState', fromMortgageLoan.reducer),
    EffectsModule.forFeature([MortgageLoanEffects]),
  ],
  declarations: [MortgageLoanComponent],
  exports: [MortgageLoanComponent],
})
export class MortgageLoanModule {}
