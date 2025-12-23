import { TransactionModule } from './transaction.module';
import { TransactionComponent } from './transaction.component';
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/platform/authentication/guard/authentication.guard';

const routes: Routes = [
  {
    path: 'transactions',
    component: TransactionComponent,
    canActivate: [AuthenticationGuard],
  },
];

export const TransactionRoutingModule: ModuleWithProviders<TransactionModule> =
  RouterModule.forChild(routes);
