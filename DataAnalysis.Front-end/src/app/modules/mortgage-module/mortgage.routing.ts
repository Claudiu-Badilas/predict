import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MortgageModule } from './mortgage.module';
import { MortgageComponent } from './mortgage.component';

const routes: Routes = [
  {
    path: 'mortgage',
    component: MortgageComponent,
    children: [
      {
        path: ':id',
        component: MortgageComponent,
      },
    ],
  },
];

export const MortgageRoutingModule: ModuleWithProviders<MortgageModule> =
  RouterModule.forChild(routes);
