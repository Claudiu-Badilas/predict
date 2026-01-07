import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import * as fromInvoices from 'src/app/modules/invoices/reducers/invoices.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';

@Component({
  selector: 'app-invoices-overview',
  imports: [
    CommonModule,
    SideBarComponent,
    ToggleButtonComponent,
    DropdownSelectComponent,
  ],
  templateUrl: './invoices-overview.component.html',
  styleUrl: './invoices-overview.component.scss',
})
export class InvoicesOverviewComponent {
  invoices$ = this.store.select(fromInvoices.getInvoices);
  invoiceLocations$ = this.invoices$.pipe(
    map((invoices) => ['No Selection', ...invoices.map((inv) => inv.address)])
  );

  selectedInvoiceLocation$ = new BehaviorSubject<string>(null);

  selectedInvoice$ = combineLatest([
    this.invoices$,
    this.selectedInvoiceLocation$,
  ]).pipe(
    map(([invoices, selectedInvoiceLocation]) =>
      invoices.find((inv) => inv.address === selectedInvoiceLocation)
    )
  );

  constructor(private store: Store<fromInvoices.State>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/invoices/${module.toLowerCase()}`,
      })
    );
  }

  onDropdownSelected(event: string) {
    this.selectedInvoiceLocation$.next(event);
  }
}
