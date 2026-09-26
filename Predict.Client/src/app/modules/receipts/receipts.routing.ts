import { Routes } from '@angular/router';
import { ReceiptsProductsComponent } from './receipts-products/receipts-products.component';
import { ReceiptsComponent } from './receipts.component';

export const receiptsRoutes: Routes = [
  {
    path: '',
    component: ReceiptsComponent,
    children: [
      { path: 'summary', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ReceiptsProductsComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
];
