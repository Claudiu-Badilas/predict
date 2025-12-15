import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/platform/authentication/guard/authentication.guard';
import { ReceiptsComponent } from './receipts.component';
import { ReceiptsModule } from './receipts.module';
import { ReceiptsSummaryComponent } from './receipts-summary/receipts-summary.component';

const routes: Routes = [
  {
    path: 'receipts',
    component: ReceiptsComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: 'summary',
        component: ReceiptsSummaryComponent,
      },
    ],
  },
];

export const ReceiptsRoutingModule: ModuleWithProviders<ReceiptsModule> =
  RouterModule.forChild(routes);
