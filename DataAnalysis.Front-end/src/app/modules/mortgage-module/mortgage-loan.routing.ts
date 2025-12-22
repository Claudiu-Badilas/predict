import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MortgageLoanComponent } from './mortgage-loan.component';
import { MortgageLoanModule } from './mortgage-loan.module';
import { OverviewMortgageLoanComponent } from './overview-mortgage-loan/overview-mortgage-loan.component';
import { MortgageLoanDetailedComponent } from './mortgage-loan-detailed/mortgage-loan-detailed.component';

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
        path: 'detailed',
        component: MortgageLoanDetailedComponent,
      },
    ],
  },
];

export const MortgageLoanRoutingModule: ModuleWithProviders<MortgageLoanModule> =
  RouterModule.forChild(routes);
