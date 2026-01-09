import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MortgageLoanCompareComponent } from './mortgage-loan-compare/mortgage-loan-compare.component';
import { MortgageLoanDetailedComponent } from './mortgage-loan-detailed/mortgage-loan-detailed.component';
import { MortgageLoanOverviewComponent } from './mortgage-loan-overview/mortgage-loan-overview.component';
import { MortgageLoanComponent } from './mortgage-loan.component';

const routes: Routes = [
  {
    path: '',
    component: MortgageLoanComponent,
    children: [
      { path: 'overview', component: MortgageLoanOverviewComponent },
      { path: 'compare', component: MortgageLoanCompareComponent },
      { path: 'detailed', component: MortgageLoanDetailedComponent },
       { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MortgageLoanRoutingModule {}
