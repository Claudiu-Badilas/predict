import { TransactionModule } from './transaction.module';
import { TransactionComponent } from './transaction/transaction.component';
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: TransactionComponent,
    children: [
      {
        path: ':id',
        component: TransactionComponent,
        data: {
          gtmPageViewPathTitle: 'transactions',
        },
      },
    ],
  },
];

export const TransactionRoutingModule: ModuleWithProviders<TransactionModule> =
  RouterModule.forChild(routes);
