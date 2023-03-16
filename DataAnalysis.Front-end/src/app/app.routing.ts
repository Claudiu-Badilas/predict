import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [{ path: '', redirectTo: 'authentication', pathMatch: 'full' }],
  },
  {
    path: 'authentication',
    loadChildren: () =>
      import('./platform/authentication/authentication.module').then(
        (m) => m.AuthenticationModule
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
    path: '**',
    redirectTo: 'authentication',
    pathMatch: 'full',
  },
];

export const AppRouting: ModuleWithProviders<RouterModule> =
  RouterModule.forRoot(routes, {
    useHash: false,
    onSameUrlNavigation: 'ignore',
  });
