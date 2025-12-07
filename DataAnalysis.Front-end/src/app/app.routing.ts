import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'mortgage',
    loadChildren: () =>
      import('./modules/mortgage-module/mortgage.module').then(
        (m) => m.MortgageModule
      ),
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./modules/transaction-module/transaction.module').then(
        (m) => m.TransactionModule
      ),
  },
  // {
  //   path: 'authentication',
  //   loadChildren: () =>
  //     import('./platform/authentication/authentication.module').then(
  //       (m) => m.AuthenticationModule
  //     ),
  // },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

export const AppRouting: ModuleWithProviders<RouterModule> =
  RouterModule.forRoot(routes, {
    useHash: false,
    onSameUrlNavigation: 'ignore',
  });
