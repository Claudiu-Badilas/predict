import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { ReceiptDomain } from '../../../models/receipts-domain.model';

interface ReceiptPeriod {
  id: string;
  title: string;
  receipts: ReceiptDomain[];
  total: number;
}

export type ReceiptSortMode =
  'newest' | 'oldest' | 'amount-asc' | 'amount-desc';

@Component({
  selector: 'p-most-common-products',
  imports: [CommonModule, NumberFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './most-common-products.component.html',
  styleUrl: './most-common-products.component.scss',
})
export class MostCommonProductsComponent {
  receipts = input<ReceiptDomain[]>([]);
  viewMode = input<'all' | 'monthly' | 'yearly'>('monthly');
  sortMode = input<ReceiptSortMode>('newest');
  expandedPeriodId = signal<string | null>(null);
  expandedReceiptId = signal<number | null>(null);

  totalRevenue = computed(() =>
    this.receipts().reduce(
      (total, receipt) => total + this.receiptTotal(receipt),
      0,
    ),
  );

  receiptFrequency = computed(() => this.receipts().length);

  allReceipts = computed(() => this.sortReceipts(this.receipts()));

  providerInitial(provider: string | null | undefined): string {
    return provider?.trim().charAt(0).toLocaleUpperCase() || 'R';
  }

  productSummary(receipt: ReceiptDomain): string {
    const names = receipt.products
      .slice(0, 3)
      .map((product) => product.name)
      .filter(Boolean);
    if (!names.length) return 'No item details';

    const remaining = receipt.products.length - names.length;
    return `${names.join(', ')}${remaining > 0 ? ` +${remaining} more` : ''}`;
  }

  currentPeriods = computed((): ReceiptPeriod[] => {
    const groups = new Map<string, ReceiptDomain[]>();
    const groupByYear = this.viewMode() === 'yearly';

    for (const receipt of this.receipts()) {
      if (!receipt.date) continue;
      const year = receipt.date.getFullYear();
      const month = receipt.date.getMonth();
      const key = groupByYear ? `${year}` : `${year}-${month}`;
      const group = groups.get(key) ?? [];
      group.push(receipt);
      groups.set(key, group);
    }

    return Array.from(groups.entries())
      .map(([key, receipts]) => {
        const [year, monthIndex] = key.split('-').map(Number);
        const title = groupByYear
          ? `${year}`
          : new Date(year, monthIndex).toLocaleString('default', {
              month: 'short',
              year: 'numeric',
            });
        return {
          id: `${groupByYear ? 'year' : 'month'}-${key}`,
          title,
          receipts: this.sortReceipts(receipts),
          total: receipts.reduce(
            (sum, receipt) => sum + this.receiptTotal(receipt),
            0,
          ),
        };
      })
      .sort(
        (first, second) =>
          second.receipts[0].date!.getTime() -
          first.receipts[0].date!.getTime(),
      );
  });

  togglePeriod(periodId: string): void {
    this.expandedPeriodId.update((current) =>
      current === periodId ? null : periodId,
    );
  }

  toggleReceipt(receiptId: number): void {
    this.expandedReceiptId.update((current) =>
      current === receiptId ? null : receiptId,
    );
  }

  receiptTotal(receipt: ReceiptDomain): number {
    if (receipt.totalPrice !== null && receipt.totalPrice !== undefined) {
      return receipt.totalPrice;
    }
    return receipt.products.reduce(
      (sum, product) => sum + (product.price ?? 0) * (product.quantity ?? 0),
      0,
    );
  }

  formatDay(date: Date | null): string {
    return date
      ? date.toLocaleDateString('default', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';
  }

  private sortReceipts(receipts: ReceiptDomain[]): ReceiptDomain[] {
    const mode = this.sortMode();
    return [...receipts].sort((first, second) => {
      if (mode === 'amount-asc' || mode === 'amount-desc') {
        const amountDifference =
          this.receiptTotal(first) - this.receiptTotal(second);
        if (amountDifference !== 0) {
          return mode === 'amount-asc' ? amountDifference : -amountDifference;
        }
      }

      const dateDifference =
        (second.date?.getTime() ?? 0) - (first.date?.getTime() ?? 0);
      return mode === 'oldest' ? -dateDifference : dateDifference;
    });
  }
}
