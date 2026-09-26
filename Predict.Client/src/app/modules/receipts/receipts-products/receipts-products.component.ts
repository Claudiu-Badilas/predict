import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { MostCommonProductsComponent } from './components/most-common-products/most-common-products.component';

type ProductViewMode = 'all' | 'monthly' | 'yearly' | 'receipts';

@Component({
  selector: 'p-receipts-products',
  imports: [CommonModule, MostCommonProductsComponent],
  templateUrl: './receipts-products.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './receipts-products.component.scss',
})
export class ReceiptsProductsComponent {
  receipts$ = this.store.select(
    fromReceipts.getAvailableReceiptsProductBySearchTerm,
  );
  private readonly selectedViewMode = toSignal(
    this.store.select(fromReceipts.getProductsViewMode),
    { initialValue: null },
  );
  viewMode = computed<ProductViewMode>(
    () => this.selectedViewMode() ?? 'monthly',
  );

  constructor(private readonly store: Store<fromReceipts.State>) {}
}
