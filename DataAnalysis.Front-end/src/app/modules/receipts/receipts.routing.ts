import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/platform/authentication/guard/authentication.guard';
import { ReceiptsProductsComponent } from './receipts-products/receipts-products.component';
import { ReceiptsSummaryComponent } from './receipts-summary/receipts-summary.component';
import { ReceiptsComponent } from './receipts.component';
import { ReceiptsModule } from './receipts.module';

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
      {
        path: 'products',
        component: ReceiptsProductsComponent,
      },
    ],
  },
];

export const ReceiptsRoutingModule: ModuleWithProviders<ReceiptsModule> =
  RouterModule.forChild(routes);
