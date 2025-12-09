import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { MortgageRoutingModule } from './mortgage.routing';
import { MortgageComponent } from './mortgage/mortgage.component';

@NgModule({
  imports: [
    CommonModule,
    MortgageRoutingModule,
    NgbModule,
    SideBarModule,
    DatePickerComponent,
  ],
  declarations: [MortgageComponent],
  exports: [MortgageComponent],
})
export class MortgageModule {}
