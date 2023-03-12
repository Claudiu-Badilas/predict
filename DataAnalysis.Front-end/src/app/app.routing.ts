import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [{ path: '', redirectTo: 'transactions', pathMatch: 'full' }],
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./modules/transaction-module/transaction.module').then(
        (m) => m.TransactionModule
      ),
  },
  {
    path: '**',
    redirectTo: 'transactions',
    pathMatch: 'full',
  },
];

export const AppRouting: ModuleWithProviders<RouterModule> =
  RouterModule.forRoot(routes, {
    useHash: false,
    onSameUrlNavigation: 'ignore',
  });
