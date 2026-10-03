import {
  Component,
  ChangeDetectionStrategy,
  computed,
  HostListener,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import { ReceiptsStore } from 'src/app/modules/receipts/reducers/receipts.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { PlatformToggleComponent } from 'src/app/shared/components/platform-toggle/platform-toggle.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import {
  MostCommonProductsComponent,
  ReceiptSortMode,
} from './receipts-products/components/most-common-products/most-common-products.component';
import { ReceiptDomain } from './models/receipts-domain.model';

interface ReceiptInsight {
  eyebrow: string;
  title: string;
  value: string;
  detail: string;
}

@Component({
  selector: 'p-receipts',
  imports: [
    CommonModule,
    RangeSelectorComponent,
    PlatformToggleComponent,
    SearchInputComponent,
    TopBarComponent,
    MostCommonProductsComponent,
  ],
  templateUrl: './receipts.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./receipts.component.scss'],
})
export class ReceiptsComponent implements OnDestroy {
  private readonly receiptsStore = inject(ReceiptsStore);
  startDate = this.receiptsStore.startDate;
  endDate = this.receiptsStore.endDate;
  viewMode = this.receiptsStore.receiptsView.viewMode;
  searchTerm = this.receiptsStore.receiptsView.searchTerm;
  receipts = this.receiptsStore.availableReceipts;
  receiptSortMode = signal<ReceiptSortMode>('newest');
  showInsights = signal(false);
  activeStory = signal(0);
  insightStories = computed(() => this.createInsightStories(this.receipts()));
  private storyTimer: ReturnType<typeof setTimeout> | null = null;

  minDate = new Date('2016-01-01');
  now = new Date();

  constructor(
    private readonly store: Store,
    private readonly modalService: NgbModal,
  ) {
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }

  onToggle(value: string): void {
    this.store.dispatch(
      ReceiptsActions.receiptsViewModeChanged({
        viewMode: value.toLowerCase() as 'all' | 'monthly' | 'yearly',
      }),
    );
  }

  toggleDateSort(): void {
    this.receiptSortMode.update((mode) =>
      mode === 'newest' ? 'oldest' : 'newest',
    );
  }

  toggleAmountSort(): void {
    this.receiptSortMode.update((mode) =>
      mode === 'amount-desc' ? 'amount-asc' : 'amount-desc',
    );
  }

  getSelectedViewLabel(): string {
    if (this.viewMode() === 'all') return 'All';
    if (this.viewMode() === 'yearly') return 'Yearly';
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

  openInsights(): void {
    this.activeStory.set(0);
    this.showInsights.set(true);
    this.scheduleNextStory();
  }

  closeInsights(): void {
    this.clearStoryTimer();
    this.showInsights.set(false);
  }

  previousStory(): void {
    if (this.activeStory() === 0) return;
    this.activeStory.update((index) => index - 1);
    this.scheduleNextStory();
  }

  nextStory(): void {
    if (this.activeStory() >= this.insightStories().length - 1) {
      this.closeInsights();
      return;
    }
    this.activeStory.update((index) => index + 1);
    this.scheduleNextStory();
  }

  ngOnDestroy(): void {
    this.clearStoryTimer();
  }

  @HostListener('document:keydown', ['$event'])
  handleStoryKeyboard(event: KeyboardEvent): void {
    if (!this.showInsights()) return;

    if (event.key === 'Escape') this.closeInsights();
    if (event.key === 'ArrowLeft') this.previousStory();
    if (event.key === 'ArrowRight') this.nextStory();
  }

  private scheduleNextStory(): void {
    this.clearStoryTimer();
    this.storyTimer = setTimeout(() => this.nextStory(), 5000);
  }

  private clearStoryTimer(): void {
    if (this.storyTimer === null) return;
    clearTimeout(this.storyTimer);
    this.storyTimer = null;
  }

  private createInsightStories(receipts: ReceiptDomain[]): ReceiptInsight[] {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const lastMonthStart = new Date(currentMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthLabel = lastMonthStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    receipts = receipts.filter(
      (receipt) =>
        receipt.date !== null &&
        receipt.date >= lastMonthStart &&
        receipt.date < currentMonthStart,
    );

    if (!receipts.length) {
      return [
        {
          eyebrow: 'Last month',
          title: `No receipts in ${lastMonthLabel}`,
          value: 'A quiet month',
          detail: 'There are no dated receipts to show for this month.',
        },
      ];
    }

    const totalSpend = receipts.reduce(
      (sum, receipt) => sum + this.receiptTotal(receipt),
      0,
    );
    const currency =
      receipts.find((receipt) => receipt.currency?.trim())?.currency.trim() ||
      'RON';
    const formatAmount = (amount: number) =>
      `${new Intl.NumberFormat('ro-RO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)} ${currency}`;
    const averageSpend = totalSpend / receipts.length;
    const providers = new Map<string, { total: number; count: number }>();
    const products = new Map<
      string,
      { name: string; total: number; count: number }
    >();

    for (const receipt of receipts) {
      const provider = receipt.provider?.trim() || 'Unknown store';
      const providerSummary = providers.get(provider) ?? { total: 0, count: 0 };
      providerSummary.total += this.receiptTotal(receipt);
      providerSummary.count += 1;
      providers.set(provider, providerSummary);

      for (const product of receipt.products) {
        const name = product.name?.trim();
        if (!name) continue;
        const key = name.toLocaleLowerCase();
        const productSummary = products.get(key) ?? {
          name,
          total: 0,
          count: 0,
        };
        productSummary.total += (product.price ?? 0) * (product.quantity ?? 0);
        productSummary.count += product.quantity ?? 0;
        products.set(key, productSummary);
      }
    }

    const topProvider = Array.from(providers.entries()).sort(
      (first, second) => second[1].total - first[1].total,
    )[0];
    const topProduct = Array.from(products.values()).sort(
      (first, second) => second.total - first.total,
    )[0];
    const bestDiscount = receipts.reduce<ReceiptDomain | null>(
      (best, receipt) =>
        (receipt.totalDiscount ?? 0) > (best?.totalDiscount ?? 0)
          ? receipt
          : best,
      null,
    );
    const stories: ReceiptInsight[] = [
      {
        eyebrow: lastMonthLabel,
        title: 'Your spending, in one snapshot',
        value: formatAmount(totalSpend),
        detail: `Across ${receipts.length} receipts in ${lastMonthLabel}, that is an average of ${formatAmount(averageSpend)} per trip.`,
      },
    ];

    if (topProvider) {
      stories.push({
        eyebrow: 'Your regular stop',
        title: 'Where most of it went',
        value: topProvider[0],
        detail: `${formatAmount(topProvider[1].total)} across ${topProvider[1].count} ${topProvider[1].count === 1 ? 'receipt' : 'receipts'}.`,
      });
    }

    if (topProduct) {
      stories.push({
        eyebrow: 'Basket highlight',
        title: 'Your biggest product spend',
        value: topProduct.name,
        detail: `${formatAmount(topProduct.total)} across ${topProduct.count} ${topProduct.count === 1 ? 'unit' : 'units'}.`,
      });
    }

    if ((bestDiscount?.totalDiscount ?? 0) > 0) {
      stories.push({
        eyebrow: 'A little win',
        title: 'Your biggest discount',
        value: formatAmount(bestDiscount!.totalDiscount!),
        detail: `Saved at ${bestDiscount!.provider || 'your store'} on ${bestDiscount!.date?.toLocaleDateString('ro-RO') || 'one of your shopping trips'}.`,
      });
    }

    return stories;
  }

  private receiptTotal(receipt: ReceiptDomain): number {
    if (receipt.totalPrice !== null && receipt.totalPrice !== undefined) {
      return receipt.totalPrice;
    }
    return receipt.products.reduce(
      (sum, product) => sum + (product.price ?? 0) * (product.quantity ?? 0),
      0,
    );
  }
}
