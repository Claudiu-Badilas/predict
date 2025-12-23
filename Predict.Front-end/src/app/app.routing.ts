import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'mortgage-loan',
    loadChildren: () =>
      import('./modules/mortgage-module/mortgage-loan.module').then(
        (m) => m.MortgageLoanModule
      ),
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./modules/transaction-module/transaction.module').then(
        (m) => m.TransactionModule
      ),
  },
  {
    path: 'receipts',
    loadChildren: () =>
      import('./modules/receipts/receipts.module').then(
        (m) => m.ReceiptsModule
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
