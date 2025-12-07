import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MortgageRoutingModule } from './mortgage.routing';
import { MortgageComponent } from './mortgage/mortgage.component';

@NgModule({
  imports: [CommonModule, MortgageRoutingModule, NgbModule],
  declarations: [MortgageComponent],
  exports: [MortgageComponent],
})
export class MortgageModule {}
