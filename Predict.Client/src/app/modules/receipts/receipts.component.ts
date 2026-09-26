import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import { ReceiptsSettingsComponent } from './components/receipts-settings/receipts-settings.component';

@Component({
  selector: 'p-receipts',
  imports: [
    RouterModule,
    CommonModule,
    RangeSelectorComponent,
    ToggleButtonActionsComponent,
    SearchInputComponent,
    TopBarComponent,
  ],
  templateUrl: './receipts.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./receipts.component.scss'],
})
export class ReceiptsComponent {
  startDate$ = this.store.select(fromReceipts.getStartDate);
  endDate$ = this.store.select(fromReceipts.getEndDate);
  viewMode = toSignal(this.store.select(fromReceipts.getProductsViewMode), {
    initialValue: 'monthly' as const,
  });

  minDate = new Date('2016-01-01');
  now = new Date();

  constructor(
    private readonly store: Store<fromReceipts.State>,
    private readonly modalService: NgbModal,
  ) {
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }

  openStorageSettings(): void {
    this.modalService.open(ReceiptsSettingsComponent, {
      centered: true,
      size: 'lg',
      scrollable: true,
    });
  }

  onToggle(value: string): void {
    this.store.dispatch(
      ReceiptsActions.productsViewModeChanged({
        viewMode: value.toLowerCase() as
          'all' | 'monthly' | 'yearly' | 'receipts',
      }),
    );
  }

  getSelectedViewLabel(): string {
    if (this.viewMode() === 'all') return 'All';
    if (this.viewMode() === 'yearly') return 'Yearly';
    if (this.viewMode() === 'receipts') return 'Receipts';
    return 'Monthly';
  }

  handleRangeChange(value: any): void {
    this.store.dispatch(
      ReceiptsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    );
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }

  onSearch(value: string): void {
    this.store.dispatch(
      ReceiptsActions.searchTermChanged({ searchTerm: value }),
    );
  }
}
