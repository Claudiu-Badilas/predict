import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesDetailedComponent } from './invoices-detailed/invoices-detailed.component';
import { InvoicesOverviewComponent } from './invoices-overview/invoices-overview.component';
import { InvoicesComponent } from './invoices.component';

const routes: Routes = [
  {
    path: '',
    component: InvoicesComponent,
    children: [
      { path: 'overview', component: InvoicesOverviewComponent },
      { path: 'detailed', component: InvoicesDetailedComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
