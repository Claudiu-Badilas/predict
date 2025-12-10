import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MortgageDetailedComponent } from './mortgage-detailed/mortgage-detailed.component';
import { MortgageOverviewComponent } from './mortgage-overview/mortgage-overview.component';
import { MortgageComponent } from './mortgage.component';
import { MortgageModule } from './mortgage.module';

const routes: Routes = [
  {
    path: 'mortgage',
    component: MortgageComponent,
    children: [
      {
        path: 'overview',
        component: MortgageOverviewComponent,
      },
      {
        path: 'detailed',
        component: MortgageDetailedComponent,
      },
    ],
  },
];

export const MortgageRoutingModule: ModuleWithProviders<MortgageModule> =
  RouterModule.forChild(routes);
