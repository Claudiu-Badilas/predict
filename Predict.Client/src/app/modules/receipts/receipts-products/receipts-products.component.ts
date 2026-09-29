import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { ReceiptsStore } from 'src/app/modules/receipts/reducers/receipts.reducer';
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
  private readonly receiptsStore = inject(ReceiptsStore);
  receipts = this.receiptsStore.availableProducts;
  private readonly selectedViewMode =
    this.receiptsStore.receiptsProducts.viewMode;
  viewMode = computed<ProductViewMode>(
    () => this.selectedViewMode() ?? 'monthly',
  );
}
