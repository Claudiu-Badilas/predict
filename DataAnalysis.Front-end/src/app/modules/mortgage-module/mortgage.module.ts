import { NgModule } from '@angular/core';
import { MortgageDetailedComponent } from './mortgage-detailed/mortgage-detailed.component';
import { MortgageOverviewComponent } from './mortgage-overview/mortgage-overview.component';
import { MortgageComponent } from './mortgage.component';
import { MortgageRoutingModule } from './mortgage.routing';
import { StoreModule } from '@ngrx/store';
import * as fromMortgage from 'src/app/modules/mortgage-module/state-management/mortgage.reducer';

@NgModule({
  imports: [
    MortgageRoutingModule,
    MortgageOverviewComponent,
    MortgageDetailedComponent,
    StoreModule.forFeature('MortgageState', fromMortgage.reducer),
  ],
  declarations: [MortgageComponent],
  exports: [MortgageComponent],
})
export class MortgageModule {}
