import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  TransactionCategorizer,
  TransactionCategory,
  TransactionDomain,
} from '../../../models/transactions.model';
import { TransactionOverviewHeaderComponent } from '../transaction-overview-header/transaction-overview-header.component';

interface GroupedTransaction {
  provider: string;
  description: string;
  count: number;
  total: number;
  currency: string | null;
  latestDate: Date | null;
  dates: Date[];
  category: TransactionCategory;
  percentageOfTotal: number;
  percentageOfIncome: number;
  percentageOfExpense: number;
}

interface CategoryBarSegment {
  category: TransactionCategory;
  label: string;
  color: string;
  total: number;
  percentage: number;
}

interface PeriodGroup {
  id: string;
  title: string;
  year: number;
  monthIndex?: number;
  totalIncome: number;
  totalExpense: number;
  difference: number;
  transactionCount: number;
  transactions: TransactionDomain[];
  multiple: GroupedTransaction[];
  categorySegments: CategoryBarSegment[];
  isExpanded: boolean;
  month?: string;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [
    CommonModule,
    NumberFormatPipe,
    NgbTooltip,
    TransactionOverviewHeaderComponent,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <p-transaction-overview-header
        class="header-section"
        [totalIncome]="totalIncome()"
        [totalExpense]="totalExpense()"
        [totalTransactions]="totalTransactions()"
      ></p-transaction-overview-header>

      <!-- Main Content -->
      <div class="content-area">
        <div class="scroll-container">
          @if (viewMode() === 'all') {
            <!-- All View -->
            <div class="view-all">
              <!-- Category Spending Bar (desktop only) -->
              @if (
                categoryBarSegments().length > 1 && selectedCategory() === null
              ) {
                <div class="category-bar-section desktop-only">
                  <div class="category-bar-header">
                    <span class="category-bar-title">Spending by category</span>
                    <span class="category-bar-total">
                      {{ totalExpense() | numberFormat: '0.00' }}
                    </span>
                  </div>
                  <div class="category-bar">
                    @for (seg of categoryBarSegments(); track seg.category) {
                      <div
                        class="category-bar-segment"
                        [style.width.%]="seg.percentage"
                        [style.background]="seg.color"
                        [ngbTooltip]="
                          seg.label +
                          ': ' +
                          (seg.total | numberFormat: '0.00') +
                          ' (' +
                          (seg.percentage | numberFormat: '0.0') +
                          '%)'
                        "
                        container="body"
                      ></div>
                    }
                  </div>
                </div>
              }

              <!-- Mobile-only category bar (below header, before filters) -->
              @if (
                categoryBarSegments().length > 1 && selectedCategory() === null
              ) {
                <div class="category-bar-section mobile-only">
                  <div class="category-bar">
                    @for (seg of categoryBarSegments(); track seg.category) {
                      <div
                        class="category-bar-segment"
                        [style.width.%]="seg.percentage"
                        [style.background]="seg.color"
                        [ngbTooltip]="
                          seg.label +
                          ': ' +
                          (seg.total | numberFormat: '0.00') +
                          ' (' +
                          (seg.percentage | numberFormat: '0.0') +
                          '%)'
                        "
                        container="body"
                      ></div>
                    }
                  </div>
                </div>
              }

              <!-- Active filter indicator -->
              @if (selectedCategory() !== null) {
                <div class="filter-active">
                  <span class="filter-label">Filtered by:</span>
                  <button
                    type="button"
                    class="category-pill filter-pill"
                    [style.background]="getCategoryColor(selectedCategory()!)"
                    (click)="clearCategory()"
                  >
                    <span>{{ getCategoryLabel(selectedCategory()!) }}</span>
                    <svg
                      class="pill-close"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3l6 6M9 3l-6 6"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
              }

              <!-- Transactions List -->
              <div class="transactions-section">
                <div class="section-header">
                  <span class="section-title">Top</span>
                  <span class="section-badge">{{
                    getAllGroupedTransactions().length
                  }}</span>
                </div>

                <!-- Transactions Grid -->
                <div class="transactions-grid">
                  @for (
                    item of getAllGroupedTransactions();
                    track item.provider + '-' + item.description + '-' + $index
                  ) {
                    <div class="transaction-card highlight-card">
                      @if (selectedCategory() === null) {
                        <!-- Compact mode: category name, count, amount, percent in one row -->
                        <div class="card-row compact-row">
                          <button
                            type="button"
                            class="category-pill category-name"
                            (click)="onSelectCategory(item.category)"
                            [style.background]="getCategoryColor(item.category)"
                            [ngbTooltip]="getCategoryLabel(item.category)"
                            container="body"
                          >
                            {{ getCategoryLabel(item.category) }}
                          </button>

                          <span class="tx-count">{{ item.count }}x</span>

                          <div class="amount-group">
                            <span
                              class="amount-text"
                              [class.positive]="item.total > 0"
                              [class.negative]="item.total < 0"
                            >
                              {{ item.total | numberFormat: '0.00' }}
                            </span>
                            @if (item.total > 0 && totalIncome() > 0) {
                              <span class="percentage-badge income-badge">
                                {{
                                  item.percentageOfIncome | numberFormat: '0.0'
                                }}%
                              </span>
                            } @else if (item.total < 0 && totalExpense() > 0) {
                              <span class="percentage-badge expense-badge">
                                {{
                                  item.percentageOfExpense
                                    | numberFormat: '0.0'
                                }}%
                              </span>
                            }
                          </div>
                        </div>
                      } @else {
                        <!-- Detailed mode when a category is selected -->
                        <!-- Row 1: provider -->
                        <div class="card-row">
                          <div class="provider-group">
                            <span
                              class="provider-name"
                              [ngbTooltip]="item.description"
                              container="body"
                            >
                              {{ item.provider }}
                            </span>
                          </div>
                        </div>

                        <!-- Divider + Details row: only when 5 or fewer cards -->
                        @if (getAllGroupedTransactions().length <= 5) {
                          <div class="card-divider"></div>
                          <div class="card-row details-row">
                            <span
                              class="details-text"
                              [ngbTooltip]="item.description || item.provider"
                              container="body"
                            >
                              {{ item.description || item.provider }}
                            </span>
                          </div>
                        }

                        <!-- Middle row: date + amount -->
                        <div class="card-row middle">
                          <span class="date-text">{{
                            formatDay(item.latestDate)
                          }}</span>
                          <div class="amount-group">
                            <span
                              class="amount-text"
                              [class.positive]="item.total > 0"
                              [class.negative]="item.total < 0"
                            >
                              {{ item.total | numberFormat: '0.00' }}
                            </span>
                            @if (item.total > 0 && totalIncome() > 0) {
                              <span class="percentage-badge income-badge">
                                {{
                                  item.percentageOfIncome | numberFormat: '0.0'
                                }}%
                              </span>
                            } @else if (item.total < 0 && totalExpense() > 0) {
                              <span class="percentage-badge expense-badge">
                                {{
                                  item.percentageOfExpense
                                    | numberFormat: '0.0'
                                }}%
                              </span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }

                  @if (!getAllGroupedTransactions().length) {
                    <div class="empty-state">
                      <div class="empty-icon">📭</div>
                      <span>No transactions</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          } @else {
            <!-- Period View -->
            <div class="view-periods">
              @for (period of currentPeriods(); track period.id) {
                <div
                  class="period-container"
                  [class.expanded]="period.isExpanded"
                >
                  <!-- Period Header -->
                  <button
                    type="button"
                    class="period-header"
                    (click)="togglePeriod(period)"
                    [attr.aria-expanded]="period.isExpanded"
                  >
                    <!-- Main top row -->
                    <div class="header-row-main">
                      <div class="header-left">
                        <span class="header-title">{{ period.title }}</span>
                        <span class="header-count">{{
                          period.transactionCount
                        }}</span>
                      </div>

                      <!-- Inline category bar between left and right (desktop) -->
                      @if (
                        period.categorySegments.length > 1 &&
                        selectedCategory() === null
                      ) {
                        <div class="header-bar desktop-only">
                          <div class="category-bar slim">
                            @for (
                              seg of period.categorySegments;
                              track seg.category
                            ) {
                              <div
                                class="category-bar-segment"
                                [style.width.%]="seg.percentage"
                                [style.background]="seg.color"
                                [ngbTooltip]="
                                  seg.label +
                                  ': ' +
                                  (seg.total | numberFormat: '0.00') +
                                  ' (' +
                                  (seg.percentage | numberFormat: '0.0') +
                                  '%)'
                                "
                                container="body"
                              ></div>
                            }
                          </div>
                        </div>
                      }

                      <div class="header-right">
                        @if (period.totalIncome > 0) {
                          <span
                            class="stat-tag stat-income"
                            [ngbTooltip]="'Total income'"
                            container="body"
                          >
                            <svg
                              class="stat-icon"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M6 9V3M6 3L3 6M6 3l3 3"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            <span class="stat-value">{{
                              period.totalIncome | numberFormat: '0.00'
                            }}</span>
                          </span>
                        }

                        @if (period.totalExpense > 0) {
                          <span
                            class="stat-tag stat-expense"
                            [ngbTooltip]="'Total expense'"
                            container="body"
                          >
                            <svg
                              class="stat-icon"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M6 3v6M6 9l3-3M6 9L3 6"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            <span class="stat-value">{{
                              period.totalExpense | numberFormat: '0.00'
                            }}</span>
                          </span>
                        }

                        @if (period.difference !== 0) {
                          <span
                            class="stat-tag stat-diff"
                            [class.is-positive]="period.difference > 0"
                            [class.is-negative]="period.difference < 0"
                            [ngbTooltip]="'Net difference'"
                            container="body"
                          >
                            <svg
                              class="stat-icon"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden="true"
                            >
                              @if (period.difference > 0) {
                                <path
                                  d="M6 9V3M6 3L3 6M6 3l3 3"
                                  stroke="currentColor"
                                  stroke-width="1.6"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              } @else {
                                <path
                                  d="M6 3v6M6 9l3-3M6 9L3 6"
                                  stroke="currentColor"
                                  stroke-width="1.6"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              }
                            </svg>
                            <span class="stat-value">{{
                              period.difference | numberFormat: '0.00'
                            }}</span>
                          </span>
                        }

                        <span class="expand-chevron" aria-hidden="true">
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            [class.rotated]="period.isExpanded"
                          >
                            <path
                              d="M4 6l4 4 4-4"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <!-- Mobile-only bar: second row, always visible (even collapsed) -->
                    @if (
                      period.categorySegments.length > 1 &&
                      selectedCategory() === null
                    ) {
                      <div class="header-bar-mobile mobile-only">
                        <div class="category-bar slim">
                          @for (
                            seg of period.categorySegments;
                            track seg.category
                          ) {
                            <div
                              class="category-bar-segment"
                              [style.width.%]="seg.percentage"
                              [style.background]="seg.color"
                              [ngbTooltip]="
                                seg.label +
                                ': ' +
                                (seg.total | numberFormat: '0.00') +
                                ' (' +
                                (seg.percentage | numberFormat: '0.0') +
                                '%)'
                              "
                              container="body"
                            ></div>
                          }
                        </div>
                      </div>
                    }
                  </button>

                  <!-- Period Content -->
                  @if (period.isExpanded) {
                    <div class="period-content">
                      <!-- Active filter indicator -->
                      @if (selectedCategory() !== null) {
                        <div class="filter-active">
                          <span class="filter-label">Filtered by:</span>
                          <button
                            type="button"
                            class="category-pill filter-pill"
                            [style.background]="
                              getCategoryColor(selectedCategory()!)
                            "
                            (click)="clearCategory()"
                          >
                            <span>{{
                              getCategoryLabel(selectedCategory()!)
                            }}</span>
                            <svg
                              class="pill-close"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M3 3l6 6M9 3l-6 6"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      }

                      <div class="transactions-section compact">
                        <!-- Transactions Grid -->
                        <div class="transactions-grid">
                          @for (
                            item of period.multiple;
                            track item.provider +
                              '-' +
                              item.description +
                              '-' +
                              $index
                          ) {
                            <div class="transaction-card highlight-card">
                              @if (selectedCategory() === null) {
                                <!-- Compact mode: category name, count, amount, percent in one row -->
                                <div class="card-row compact-row">
                                  <button
                                    type="button"
                                    class="category-pill category-name"
                                    (click)="onSelectCategory(item.category)"
                                    [style.background]="
                                      getCategoryColor(item.category)
                                    "
                                    [ngbTooltip]="
                                      getCategoryLabel(item.category)
                                    "
                                    container="body"
                                  >
                                    {{ getCategoryLabel(item.category) }}
                                  </button>

                                  <span class="tx-count"
                                    >{{ item.count }}x</span
                                  >

                                  <div class="amount-group">
                                    <span
                                      class="amount-text"
                                      [class.positive]="item.total > 0"
                                      [class.negative]="item.total < 0"
                                    >
                                      {{ item.total | numberFormat: '0.00' }}
                                    </span>
                                    @if (
                                      item.total > 0 && period.totalIncome > 0
                                    ) {
                                      <span
                                        class="percentage-badge income-badge"
                                      >
                                        {{
                                          item.percentageOfIncome
                                            | numberFormat: '0.0'
                                        }}%
                                      </span>
                                    } @else if (
                                      item.total < 0 && period.totalExpense > 0
                                    ) {
                                      <span
                                        class="percentage-badge expense-badge"
                                      >
                                        {{
                                          item.percentageOfExpense
                                            | numberFormat: '0.0'
                                        }}%
                                      </span>
                                    }
                                  </div>
                                </div>
                              } @else {
                                <!-- Detailed mode when a category is selected -->
                                <!-- Row 1: provider -->
                                <div class="card-row">
                                  <div class="provider-group">
                                    <span
                                      class="provider-name"
                                      [ngbTooltip]="item.description"
                                      container="body"
                                    >
                                      {{ item.provider }}
                                    </span>
                                  </div>
                                </div>

                                <!-- Divider + Details row: only when 5 or fewer cards -->
                                @if (period.multiple.length <= 5) {
                                  <div class="card-divider"></div>
                                  <div class="card-row details-row">
                                    <span
                                      class="details-text"
                                      [ngbTooltip]="
                                        item.description || item.provider
                                      "
                                      container="body"
                                    >
                                      {{ item.description || item.provider }}
                                    </span>
                                  </div>
                                }

                                <!-- Middle row: date + amount -->
                                <div class="card-row middle">
                                  <span class="date-text">{{
                                    formatDay(item.latestDate)
                                  }}</span>
                                  <div class="amount-group">
                                    <span
                                      class="amount-text"
                                      [class.positive]="item.total > 0"
                                      [class.negative]="item.total < 0"
                                    >
                                      {{ item.total | numberFormat: '0.00' }}
                                    </span>
                                    @if (
                                      item.total > 0 && period.totalIncome > 0
                                    ) {
                                      <span
                                        class="percentage-badge income-badge"
                                      >
                                        {{
                                          item.percentageOfIncome
                                            | numberFormat: '0.0'
                                        }}%
                                      </span>
                                    } @else if (
                                      item.total < 0 && period.totalExpense > 0
                                    ) {
                                      <span
                                        class="percentage-badge expense-badge"
                                      >
                                        {{
                                          item.percentageOfExpense
                                            | numberFormat: '0.0'
                                        }}%
                                      </span>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          }

                          @if (!period.multiple.length) {
                            <div class="empty-state">
                              <div class="empty-icon">📭</div>
                              <span>No transactions</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (!currentPeriods().length) {
                <div class="empty-state-large">
                  <div class="empty-icon-lg">📊</div>
                  <span>No data available</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    /* ===== DESIGN TOKENS ===== */
    :host {
      --bg-app: var(--theme-background);
      --bg-card: var(--theme-surface);
      --bg-subtle: var(--theme-surface-muted);
      --bg-muted: var(--theme-hover);
      --bg-highlight: var(--theme-warning-subtle);

      --border-subtle: var(--theme-border);
      --border-soft: var(--theme-border);
      --border-strong: var(--theme-border-strong);
      --border-highlight: var(--theme-warning);

      --text-primary: var(--theme-text-primary);
      --text-secondary: var(--theme-text-secondary);
      --text-tertiary: var(--theme-text-secondary);
      --text-muted: var(--theme-text-muted);

      --accent-green: var(--theme-success);
      --accent-green-bg: var(--theme-success-subtle);
      --accent-green-border: var(--theme-success);
      --accent-red: var(--theme-danger);
      --accent-red-bg: var(--theme-danger-subtle);
      --accent-red-border: var(--theme-danger);
      --accent-blue: var(--theme-accent);

      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --radius-pill: 999px;

      --shadow-xs: var(--theme-shadow);
      --shadow-sm: var(--theme-shadow);
      --shadow-md: var(--theme-shadow-raised);
      --shadow-lg: var(--theme-shadow-raised);

      --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --transition-fast: 0.15s var(--ease-out);
      --transition-base: 0.2s var(--ease-out);

      display: block;
      height: 100%;
      font-family: inherit;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ===== CONTAINER ===== */
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .header-section {
      flex-shrink: 0;
      padding: 0;
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      padding: 0;
      min-height: 0;
    }

    .scroll-container {
      height: 100%;
      overflow-y: auto;
      padding-right: 0;
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong) transparent;
    }

    /* ===== SCROLLBAR ===== */
    .scroll-container::-webkit-scrollbar {
      width: 4px;
    }
    .scroll-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .scroll-container::-webkit-scrollbar-thumb {
      background: var(--border-strong);
      border-radius: var(--radius-pill);
    }
    .scroll-container::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    /* ===== VISIBILITY HELPERS ===== */
    .mobile-only {
      display: none;
    }
    .desktop-only {
      display: block;
    }

    /* ===== CATEGORY BAR (full-size, All view desktop) ===== */
    .category-bar-section {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 12px;
      margin-bottom: 10px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      width: 100%;
      box-sizing: border-box;
    }

    .category-bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .category-bar-title {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: -0.01em;
    }

    .category-bar-total {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent-red);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
    }

    .category-bar {
      display: flex;
      height: 18px;
      width: 100%;
      border-radius: var(--radius-pill);
      overflow: hidden;
      background: var(--bg-muted);
      gap: 1px;
    }

    /* Slim variant used inside the period header row */
    .category-bar.slim {
      height: 10px;
      border-radius: var(--radius-pill);
      gap: 1px;
    }

    .category-bar-segment {
      height: 100%;
      min-width: 4px;
      transition: filter var(--transition-fast);
      position: relative;
    }

    .category-bar-segment:hover {
      filter: brightness(1.12);
    }

    /* ===== INLINE HEADER BAR (inside period-header, desktop) ===== */
    /* Occupies 70% of the middle space on desktop only */
    .header-bar {
      flex: 0 1 70%;
      max-width: 70%;
      min-width: 60px;
      display: flex;
      align-items: center;
      padding: 0 4px;
    }

    .header-bar .category-bar.slim {
      width: 100%;
    }

    /* Second row of the period header used only on mobile */
    .header-bar-mobile {
      display: none;
      width: 100%;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid var(--border-subtle);
    }

    .header-bar-mobile .category-bar.slim {
      width: 100%;
      height: 8px;
    }

    /* ===== FILTER INDICATOR ===== */
    .filter-active {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      margin-bottom: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      color: var(--text-secondary);
      box-shadow: var(--shadow-xs);
      animation: fadeIn 0.2s var(--ease-out);
    }

    .filter-label {
      font-weight: 500;
      color: var(--text-tertiary);
    }

    .filter-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: inherit;
    }

    .pill-close {
      width: 10px;
      height: 10px;
      opacity: 0.85;
    }

    /* ===== TRANSACTIONS SECTION ===== */
    .transactions-section {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 12px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      flex-shrink: 0;
    }

    .transactions-section.compact {
      padding: 0;
      border: none;
      background: transparent;
      box-shadow: none;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .section-badge {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-muted);
      padding: 2px 10px;
      border-radius: var(--radius-pill);
      line-height: 1.6;
    }

    /* ===== TRANSACTION CARDS ===== */
    .transactions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 5px;
    }

    .transaction-card {
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      border: 1px solid var(--border-subtle);
      transition:
        transform var(--transition-fast),
        box-shadow var(--transition-fast),
        border-color var(--transition-fast);
      position: relative;
      min-width: 0;
    }

    .transaction-card.highlight-card {
      background: var(--bg-highlight);
      border-color: var(--border-highlight);
    }

    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 2px 0;
      min-width: 0;
    }

    /* Compact single-row layout (no category selected) */
    .card-row.compact-row {
      justify-content: flex-start;
      gap: 8px;
      padding: 0;
      min-width: 0;
    }

    .card-row.compact-row .category-name {
      flex: 1 1 auto;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }

    .card-row.compact-row .tx-count {
      flex-shrink: 0;
    }

    .card-row.compact-row .amount-group {
      flex-shrink: 0;
      margin-left: auto;
    }

    .card-row.middle {
      border-top: 1px solid var(--border-subtle);
      padding: 6px 0 0 0;
      margin: 6px 0 0 0;
      min-width: 0;
    }

    .card-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 6px 0;
      border: none;
    }

    .card-row.details-row {
      padding: 0 0 4px 0;
      justify-content: flex-start;
      min-width: 0;
    }

    .details-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      min-width: 0;
      letter-spacing: 0.005em;
      cursor: help;
    }

    .provider-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .provider-name {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.01em;
      cursor: help;
      pointer-events: auto;
      min-width: 0;
      max-width: 100%;
    }

    .tx-count {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--text-tertiary);
      background: var(--bg-muted);
      padding: 1px 8px;
      border-radius: var(--radius-pill);
      flex-shrink: 0;
      line-height: 1.5;
    }

    .category-pill {
      flex-shrink: 0;
      padding: 3px 10px;
      border: none;
      border-radius: var(--radius-pill);
      color: #ffffff;
      font-family: inherit;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      transition:
        transform var(--transition-fast),
        box-shadow var(--transition-fast),
        filter var(--transition-fast);
      user-select: none;
      line-height: 1.4;
      white-space: nowrap;
    }

    .category-pill:active {
      transform: scale(0.95);
    }

    .date-text {
      font-size: 0.72rem;
      color: var(--text-tertiary);
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .amount-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      min-width: 0;
    }

    .amount-text {
      font-size: 0.95rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }

    .amount-text.positive {
      color: var(--accent-green);
    }
    .amount-text.negative {
      color: var(--accent-red);
    }

    .percentage-badge {
      font-size: 0.62rem;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: var(--radius-pill);
      white-space: nowrap;
      letter-spacing: 0.01em;
      line-height: 1.6;
    }

    .income-badge {
      background: var(--accent-green-bg);
      color: var(--accent-green);
    }

    .expense-badge {
      background: var(--accent-red-bg);
      color: var(--accent-red);
    }

    /* ===== PERIOD CONTAINER ===== */
    .period-container {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      margin-bottom: 8px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-xs);
      transition:
        box-shadow var(--transition-base),
        border-color var(--transition-base);
    }

    .period-container.expanded {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
    }

    .period-header {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: stretch;
      padding: 12px 14px;
      cursor: pointer;
      transition: background var(--transition-fast);
      gap: 0;
      min-height: 52px;
      width: 100%;
      border: none;
      background: transparent;
      font-family: inherit;
      text-align: left;
      border-radius: var(--radius-lg);
    }

    .period-container.expanded .period-header {
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    .period-header:focus-visible {
      outline: 2px solid var(--accent-blue);
      outline-offset: -2px;
    }

    /* Top row inside the period header */
    .header-row-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      width: 100%;
      flex-wrap: nowrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      min-width: 0;
      flex-wrap: nowrap;
    }

    .header-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-primary);
      white-space: nowrap;
      letter-spacing: -0.015em;
    }

    .header-count {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-muted);
      padding: 2px 9px;
      border-radius: var(--radius-pill);
      line-height: 1.5;
      flex-shrink: 0;
      border: 1px solid var(--border-subtle);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
      flex-wrap: nowrap;
    }

    /* ===== MODERN STAT TAGS ===== */
    .stat-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px 4px 8px;
      border-radius: var(--radius-pill);
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
      line-height: 1.3;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
      border: 1px solid transparent;
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast),
        transform var(--transition-fast);
    }

    .stat-tag:hover {
      transform: translateY(-1px);
    }

    .stat-icon {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }

    .stat-value {
      font-weight: 700;
    }

    /* Income stat */
    .stat-income {
      background: var(--accent-green-bg);
      color: var(--accent-green);
      border-color: var(--accent-green-border);
    }

    /* Expense stat */
    .stat-expense {
      background: var(--accent-red-bg);
      color: var(--accent-red);
      border-color: var(--accent-red-border);
    }

    /* Net difference stat */
    .stat-diff {
      background: var(--bg-muted);
      color: var(--text-secondary);
      border-color: var(--border-soft);
    }

    .stat-diff.is-positive {
      background: var(--accent-green-bg);
      color: var(--accent-green);
      border-color: var(--accent-green-border);
    }

    .stat-diff.is-negative {
      background: var(--accent-red-bg);
      color: var(--accent-red);
      border-color: var(--accent-red-border);
    }

    /* ===== EXPAND CHEVRON ===== */
    .expand-chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--text-tertiary);
      background: var(--bg-muted);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      transition:
        background var(--transition-fast),
        color var(--transition-fast),
        border-color var(--transition-fast);
      flex-shrink: 0;
      margin-left: 2px;
    }

    .expand-chevron svg {
      width: 12px;
      height: 12px;
      transition: transform var(--transition-base);
    }

    .expand-chevron svg.rotated {
      transform: rotate(180deg);
    }

    .period-container.expanded .expand-chevron {
      color: var(--text-primary);
      background: var(--bg-subtle);
      border-color: var(--border-strong);
    }

    .period-header:hover .expand-chevron {
      background: var(--bg-subtle);
      color: var(--text-secondary);
    }

    .period-content {
      padding: 12px 14px 14px 14px;
      border-top: 1px solid var(--border-subtle);
      animation: slideDown 0.25s var(--ease-out);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* ===== EMPTY STATES ===== */
    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 24px 16px;
      color: var(--text-tertiary);
      font-size: 0.82rem;
      font-weight: 500;
    }

    .empty-icon {
      font-size: 1.5rem;
      opacity: 0.6;
    }

    .empty-state-large {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-align: center;
      padding: 48px 24px;
      color: var(--text-tertiary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .empty-icon-lg {
      font-size: 2.5rem;
      opacity: 0.5;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .transactions-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
      }

      .provider-name {
        font-size: 0.82rem;
      }

      .amount-text {
        font-size: 0.88rem;
      }

      .category-pill {
        font-size: 0.66rem;
        padding: 2px 8px;
      }

      .percentage-badge {
        font-size: 0.58rem;
        padding: 1px 6px;
      }
    }

    @media (max-width: 768px) {
      /* Swap visibility helpers */
      .mobile-only {
        display: block;
      }
      .desktop-only {
        display: none;
      }

      .transactions-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .period-header {
        padding: 10px 12px;
        min-height: 46px;
      }

      .header-row-main {
        gap: 6px;
      }

      /* Mobile second row with the bar */
      .header-bar-mobile {
        display: block;
      }

      .header-title {
        font-size: 0.88rem;
      }

      .header-count {
        font-size: 0.64rem;
        padding: 2px 7px;
      }

      .stat-tag {
        font-size: 0.66rem;
        padding: 3px 8px 3px 6px;
        gap: 4px;
      }

      .stat-icon {
        width: 10px;
        height: 10px;
      }

      .expand-chevron {
        width: 22px;
        height: 22px;
      }

      .period-content {
        padding: 10px 12px 12px 12px;
      }

      .transactions-section {
        padding: 10px;
        border-radius: var(--radius-md);
      }

      .section-header {
        margin-bottom: 8px;
        padding-bottom: 6px;
      }

      .section-title {
        font-size: 0.8rem;
      }

      .section-badge {
        font-size: 0.66rem;
        padding: 1px 8px;
      }

      .transaction-card {
        padding: 8px 10px;
        border-radius: var(--radius-sm);
      }

      .provider-name {
        font-size: 0.78rem;
      }

      .details-text {
        font-size: 0.72rem;
      }

      .amount-text {
        font-size: 0.85rem;
      }

      .date-text {
        font-size: 0.68rem;
      }

      .category-pill {
        font-size: 0.62rem;
        padding: 2px 7px;
      }

      .tx-count {
        font-size: 0.6rem;
        padding: 1px 6px;
      }

      .percentage-badge {
        font-size: 0.55rem;
        padding: 1px 5px;
      }

      .card-row {
        padding: 1px 0;
      }

      .card-row.middle {
        padding: 5px 0 0 0;
        margin: 5px 0 0 0;
      }

      .amount-group {
        gap: 5px;
      }

      /* Mobile category bar styling (All view) */
      .category-bar-section {
        padding: 10px;
        margin-bottom: 8px;
        border-radius: var(--radius-md);
      }

      .category-bar {
        height: 14px;
      }
    }

    @media (max-width: 480px) {
      .transactions-grid {
        grid-template-columns: 1fr;
        gap: 6px;
      }

      .period-container {
        margin-bottom: 6px;
        border-radius: var(--radius-md);
      }

      .period-header {
        padding: 8px 10px;
        min-height: 42px;
      }

      .header-row-main {
        gap: 5px;
      }

      .header-left {
        flex: 0 0 auto;
        min-width: 0;
        gap: 5px;
      }

      .header-right {
        flex: 0 0 auto;
        width: auto;
        justify-content: flex-end;
        gap: 4px;
      }

      .header-title {
        font-size: 0.78rem;
      }

      .header-count {
        font-size: 0.56rem;
        padding: 1px 6px;
      }

      .stat-tag {
        font-size: 0.58rem;
        padding: 2px 6px 2px 5px;
        gap: 3px;
      }

      .stat-icon {
        width: 9px;
        height: 9px;
      }

      .expand-chevron {
        width: 20px;
        height: 20px;
      }

      .expand-chevron svg {
        width: 10px;
        height: 10px;
      }

      .header-bar-mobile {
        padding-top: 6px;
        margin-top: 6px;
      }

      .header-bar-mobile .category-bar.slim {
        height: 7px;
      }

      .period-content {
        padding: 8px 10px 10px 10px;
      }

      .transactions-section {
        padding: 8px;
        border-radius: var(--radius-sm);
      }

      .section-title {
        font-size: 0.75rem;
      }

      .section-badge {
        font-size: 0.6rem;
        padding: 1px 7px;
      }

      .transaction-card {
        padding: 8px 10px;
        border-radius: var(--radius-sm);
      }

      .provider-name {
        font-size: 0.82rem;
      }

      .details-text {
        font-size: 0.72rem;
      }

      .tx-count {
        font-size: 0.58rem;
        padding: 1px 6px;
      }

      .category-pill {
        font-size: 0.62rem;
        padding: 2px 8px;
      }

      .amount-text {
        font-size: 0.88rem;
      }

      .date-text {
        font-size: 0.68rem;
      }

      .percentage-badge {
        font-size: 0.55rem;
        padding: 1px 6px;
      }

      .card-row {
        padding: 2px 0;
      }

      .card-row.middle {
        padding: 6px 0 0 0;
        margin: 6px 0 0 0;
      }

      .amount-group {
        gap: 5px;
      }

      .filter-active {
        padding: 5px 8px;
        font-size: 0.7rem;
        margin-bottom: 8px;
      }

      .empty-state {
        padding: 20px 12px;
        font-size: 0.75rem;
      }

      .empty-state-large {
        padding: 36px 16px;
        font-size: 0.82rem;
      }
    }

    @media (max-width: 380px) {
      .transactions-grid {
        grid-template-columns: 1fr;
        gap: 5px;
      }

      .period-header {
        padding: 6px 8px;
        min-height: 38px;
      }

      .header-row-main {
        gap: 4px;
      }

      .header-title {
        font-size: 0.72rem;
      }

      .header-count {
        font-size: 0.54rem;
        padding: 1px 5px;
      }

      .stat-tag {
        font-size: 0.54rem;
        padding: 2px 5px 2px 4px;
        gap: 2px;
      }

      .stat-icon {
        width: 8px;
        height: 8px;
      }

      .expand-chevron {
        width: 18px;
        height: 18px;
      }

      .expand-chevron svg {
        width: 9px;
        height: 9px;
      }

      .transaction-card {
        padding: 7px 8px;
      }

      .provider-name {
        font-size: 0.76rem;
      }

      .details-text {
        font-size: 0.68rem;
      }

      .amount-text {
        font-size: 0.82rem;
      }

      .category-pill {
        font-size: 0.58rem;
        padding: 2px 6px;
      }

      .percentage-badge {
        font-size: 0.5rem;
        padding: 1px 5px;
      }
    }

    /* ===== REDUCED MOTION ===== */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);
  viewMode = input<'all' | 'monthly' | 'yearly'>('monthly');

  selectedCategory = signal<TransactionCategory | null>(null);

  selectedTransaction = computed(() =>
    this.transactions().filter(
      (t) =>
        this.selectedCategory() === null ||
        t.category === this.selectedCategory(),
    ),
  );

  private expandedPeriodId = signal<string | null>(null);

  /**
   * Global expense distribution across categories (used in the "All" view).
   * Based on the unfiltered list so the user keeps the full picture even
   * while drilling into a specific category.
   */
  categoryBarSegments = computed((): CategoryBarSegment[] =>
    this.buildCategorySegments(this.transactions()),
  );

  /**
   * Builds the per-category expense distribution for a given set of
   * transactions, sorted from largest to smallest spend.
   */
  private buildCategorySegments(
    txs: TransactionDomain[],
  ): CategoryBarSegment[] {
    if (!txs?.length) return [];

    const expenseTxs = txs.filter((t) => (t.amount ?? 0) < 0);
    if (!expenseTxs.length) return [];

    const totalExpense = expenseTxs.reduce(
      (sum, t) => sum + Math.abs(t.amount ?? 0),
      0,
    );
    if (totalExpense === 0) return [];

    const byCategory = new Map<TransactionCategory, number>();
    for (const tx of expenseTxs) {
      const amount = Math.abs(tx.amount ?? 0);
      byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + amount);
    }

    return Array.from(byCategory.entries())
      .map(([category, total]) => ({
        category,
        label: this.getCategoryLabel(category),
        color: this.getCategoryColor(category),
        total,
        percentage: (total / totalExpense) * 100,
      }))
      .sort((a, b) => b.total - a.total);
  }

  togglePeriod(period: PeriodGroup) {
    const currentExpanded = this.expandedPeriodId();
    if (currentExpanded === period.id) {
      this.expandedPeriodId.set(null);
    } else {
      this.expandedPeriodId.set(period.id);
    }
  }

  formatDay(date: Date | null): string {
    if (!date) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month}`;
  }

  currentPeriods = computed((): PeriodGroup[] => {
    if (this.viewMode() === 'monthly') {
      return this.groupedByMonth();
    } else if (this.viewMode() === 'yearly') {
      return this.groupedByYear();
    }
    return [];
  });

  getAllGroupedTransactions = computed((): GroupedTransaction[] => {
    if (this.viewMode() !== 'all') return [];

    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const grouped = this.groupLocal(txs);

    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    const groupedWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfIncome:
        g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
      percentageOfExpense:
        g.total < 0 && totalExpense > 0
          ? (Math.abs(g.total) / totalExpense) * 100
          : 0,
    }));

    return this.sortGroupedTransactions(groupedWithPercentages);
  });

  private sortGroupedTransactions(
    transactions: GroupedTransaction[],
  ): GroupedTransaction[] {
    if (this.selectedCategory() !== null) {
      return [...transactions].sort((a, b) => {
        const dateA = a.latestDate?.getTime() ?? 0;
        const dateB = b.latestDate?.getTime() ?? 0;
        return dateB - dateA;
      });
    }

    const incomeItems = transactions.filter((t) => t.total > 0);
    const expenseItems = transactions.filter((t) => t.total < 0);

    const sortedIncome = incomeItems.sort((a, b) => b.total - a.total);

    const expenseMap = new Map<TransactionCategory, GroupedTransaction[]>();
    expenseItems.forEach((item) => {
      if (!expenseMap.has(item.category)) {
        expenseMap.set(item.category, []);
      }
      expenseMap.get(item.category)!.push(item);
    });

    const sortedCategories = Array.from(expenseMap.entries()).sort((a, b) => {
      const totalA = a[1].reduce((sum, item) => sum + Math.abs(item.total), 0);
      const totalB = b[1].reduce((sum, item) => sum + Math.abs(item.total), 0);
      return totalB - totalA;
    });

    const sortedExpenses: GroupedTransaction[] = [];
    sortedCategories.forEach(([, items]) => {
      const sortedItems = items.sort(
        (a, b) => Math.abs(b.total) - Math.abs(a.total),
      );
      sortedExpenses.push(...sortedItems);
    });

    return [...sortedIncome, ...sortedExpenses];
  }

  private groupedByMonth = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const map = new Map<string, TransactionDomain[]>();
    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([key, txs]) => {
        const [year, monthIndex] = key.split('-').map(Number);
        const month = new Date(year, monthIndex).toLocaleString('default', {
          month: 'short',
        });
        const id = `month-${year}-${monthIndex}`;

        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${month} ${year}`,
          year,
          monthIndex,
          month,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex! - a.monthIndex!;
      });
  });

  private groupedByYear = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const map = new Map<number, TransactionDomain[]>();
    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;
      const year = date.getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([year, txs]) => {
        const id = `year-${year}`;
        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${year}`,
          year,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => b.year - a.year);
  });

  private processTransactions(txs: TransactionDomain[]) {
    const grouped = this.groupLocal(txs);

    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    const groupsWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfIncome:
        g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
      percentageOfExpense:
        g.total < 0 && totalExpense > 0
          ? (Math.abs(g.total) / totalExpense) * 100
          : 0,
    }));

    const sortedGroups = this.sortGroupedTransactions(groupsWithPercentages);

    return {
      totalIncome,
      totalExpense,
      difference: totalIncome - totalExpense,
      transactionCount: txs.length,
      multiple: sortedGroups,
      transactions: txs,
      categorySegments: this.buildCategorySegments(txs),
    };
  }

  totalIncome = computed(
    () =>
      this.selectedTransaction()
        ?.filter((tx) => (tx.amount ?? 0) > 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
  );

  totalExpense = computed(() =>
    Math.abs(
      this.selectedTransaction()
        ?.filter((tx) => (tx.amount ?? 0) < 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
    ),
  );

  totalTransactions = computed(() => this.selectedTransaction()?.length ?? 0);

  private groupLocal(txs: TransactionDomain[]): GroupedTransaction[] {
    const isFiltered = this.selectedCategory() !== null;
    const map = new Map<string, GroupedTransaction>();
    let counter = 0;

    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;

      const key = isFiltered
        ? `${tx.serviceProvider}||${tx.description ?? ''}||${
            date?.getTime() ?? 0
          }||${tx.amount ?? 0}||${counter++}`
        : tx.category;

      if (!map.has(key)) {
        map.set(key, {
          provider: tx.serviceProvider,
          description: tx.description || '',
          count: 0,
          total: 0,
          currency: tx.currency,
          latestDate: null,
          dates: [],
          category: tx.category,
          percentageOfTotal: 0,
          percentageOfIncome: 0,
          percentageOfExpense: 0,
        });
      }

      const g = map.get(key)!;
      g.count++;
      g.total += tx.amount ?? 0;
      g.category = tx.category;

      if (date) {
        g.dates.push(date);
        if (!g.latestDate || date > g.latestDate) {
          g.latestDate = date;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      b.count !== a.count
        ? b.count - a.count
        : Math.abs(b.total) - Math.abs(a.total),
    );
  }

  onSelectCategory(category: TransactionCategory) {
    this.selectedCategory.set(
      this.selectedCategory() === category ? null : category,
    );
  }

  clearCategory() {
    this.selectedCategory.set(null);
  }

  getCategoryColor = (category: TransactionCategory): string =>
    TransactionCategorizer.getCategoryColor(category);

  getCategoryLabel = (category: TransactionCategory): string =>
    TransactionCategorizer.getCategoryLabel(category);
}
