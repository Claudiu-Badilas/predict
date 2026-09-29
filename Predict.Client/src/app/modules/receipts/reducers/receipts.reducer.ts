import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ReceiptDomain } from '../models/receipts-domain.model';
import { ReceiptsProductDomain } from '../receipts-products/models/receipts-products.model';
import { ProductPriceTrendChartUtils } from '../receipts-products/utils/products-price-trend.chart.util';

interface ReceiptsProductsState {
  searchTerm: string;
  viewMode: 'all' | 'monthly' | 'yearly' | 'receipts';
}

export interface State {
  receipts: ReceiptDomain[];
  startDate: Date;
  endDate: Date;
  receiptsProducts: ReceiptsProductsState;
}

const initialState: State = {
  receipts: [],
  startDate: DateUtils.getStartOfTheYear({ subtractYears: 1 }),
  endDate: new Date(),
  receiptsProducts: { searchTerm: null, viewMode: 'monthly' },
};

export const ReceiptsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => {
    const productDomain = computed(() =>
      state
        .receipts()
        .flatMap((receipt) =>
          receipt.products.map(
            (product) => new ReceiptsProductDomain(receipt, product),
          ),
        ),
    );
    const availableProducts = computed(() =>
      productDomain().filter((product) => {
        const searchTerm = state.receiptsProducts.searchTerm();
        if (!searchTerm) return true;
        return searchTerm
          .toLowerCase()
          .split(',')
          .map((term) => term.trim())
          .filter(Boolean)
          .some((term) => product.name.toLowerCase().includes(term));
      }),
    );
    return {
      productDomain,
      availableProducts,
      productPriceTrendChart: computed(() =>
        ProductPriceTrendChartUtils.getChart(availableProducts()),
      ),
    };
  }),
  withMethods((state) => ({
    setReceipts(receipts: ReceiptDomain[]): void {
      patchState(state, { receipts });
    },
    setDateRange(startDate: Date, endDate: Date): void {
      patchState(state, { startDate, endDate });
    },
    setSearchTerm(searchTerm: string): void {
      patchState(state, (current) => ({
        receiptsProducts: { ...current.receiptsProducts, searchTerm },
      }));
    },
    setProductsViewMode(viewMode: State['receiptsProducts']['viewMode']): void {
      patchState(state, (current) => ({
        receiptsProducts: { ...current.receiptsProducts, viewMode },
      }));
    },
  })),
);
