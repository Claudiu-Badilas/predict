import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MortgageLoanCompareComponent } from './mortgage-loan-compare/mortgage-loan-compare.component';
import { MortgageLoanComponent } from './mortgage-loan.component';
import { MortgageLoanModule } from './mortgage-loan.module';
import { OverviewMortgageLoanComponent } from './overview-mortgage-loan/overview-mortgage-loan.component';

const routes: Routes = [
  {
    path: 'mortgage-loan',
    component: MortgageLoanComponent,
    children: [
      {
        path: 'overview',
        component: OverviewMortgageLoanComponent,
      },
      {
        path: 'compare',
        component: MortgageLoanCompareComponent,
      },
    ],
  },
];

export const MortgageLoanRoutingModule: ModuleWithProviders<MortgageLoanModule> =
  RouterModule.forChild(routes);
