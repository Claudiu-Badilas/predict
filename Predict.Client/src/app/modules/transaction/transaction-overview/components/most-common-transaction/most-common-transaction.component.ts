import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  TransactionCategorizer,
  TransactionCategory,
  TransactionDomain,
} from '../../../models/transactions.model';
import { TransactionStatusBarChartUtils } from '../../utils/transaction-status-bar.chart.utils';
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
  isExpanded: boolean;
  month?: string;
  salaryPeriodStart?: Date;
  salaryPeriodEnd?: Date;
  isSalaryPeriod?: boolean;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [
    CommonModule,
    NumberFormatPipe,
    HighchartWrapperComponent,
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

              <!-- Chart Section - Hidden on mobile -->
              <!-- @if (selectedCategory() === null) {
                <div class="chart-section desktop-only">
                  <p-highcharts-wrapper
                    class="chart-wrapper"
                    [chartOptions]="updateBarChart(selectedTransaction())"
                  />
                </div>
              } -->

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
                      <!-- Row 1: provider + count + category pill -->
                      <div class="card-row">
                        <div class="provider-group">
                          <span
                            class="provider-name"
                            [ngbTooltip]="item.description"
                            container="body"
                          >
                            {{ item.provider }}
                          </span>
                          @if (selectedCategory() === null) {
                            <span class="tx-count">{{ item.count }}</span>
                          }
                        </div>
                        @if (selectedCategory() === null) {
                          <button
                            type="button"
                            class="category-pill"
                            (click)="onSelectCategory(item.category)"
                            [style.background]="getCategoryColor(item.category)"
                          >
                            {{ getCategoryLabel(item.category) }}
                          </button>
                        }
                      </div>

                      <!-- Divider + Details row: only when 5 or fewer cards -->
                      @if (getAllGroupedTransactions().length <= 5) {
                        <div class="card-divider"></div>
                        <div class="card-row details-row">
                          <span class="details-text">
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
                                item.percentageOfExpense | numberFormat: '0.0'
                              }}%
                            </span>
                          }
                        </div>
                      </div>
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
                    <div class="header-left">
                      <span class="header-title">{{ period.title }}</span>
                      <span class="header-count">{{
                        period.transactionCount
                      }}</span>
                      @if (period.isSalaryPeriod) {
                        <span class="salary-tag" title="Salary period">💰</span>
                      }
                    </div>
                    <div class="header-right">
                      @if (period.totalIncome > 0) {
                        <span class="income-tag"
                          >+{{
                            period.totalIncome | numberFormat: '0.00'
                          }}</span
                        >
                      }
                      @if (period.totalExpense > 0) {
                        <span class="expense-tag"
                          >-{{
                            period.totalExpense | numberFormat: '0.00'
                          }}</span
                        >
                      }
                      @if (period.difference !== 0) {
                        <span
                          class="diff-tag"
                          [class.positive]="period.difference > 0"
                          [class.negative]="period.difference < 0"
                        >
                          {{ period.difference | numberFormat: '0.00' }}
                        </span>
                      }
                      <span
                        class="expand-icon"
                        [class.rotated]="period.isExpanded"
                      >
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

                      <!-- Chart Section - Hidden on mobile -->
                      <!-- @if (selectedCategory() === null) {
                        <div class="chart-section compact-chart desktop-only">
                          <p-highcharts-wrapper
                            class="chart-wrapper"
                            [chartOptions]="updateBarChart(period.transactions)"
                          />
                        </div>
                      } -->

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
                              <!-- Row 1: provider/count (left) + category pill (right) -->
                              <div class="card-row">
                                <div class="provider-group">
                                  @if (selectedCategory() !== null) {
                                    <span
                                      class="provider-name"
                                      [ngbTooltip]="item.description"
                                      container="body"
                                    >
                                      {{ item.provider }}
                                    </span>
                                  }
                                  @if (selectedCategory() === null) {
                                    <span class="tx-count">{{
                                      item.count
                                    }}</span>
                                  }
                                </div>
                                @if (selectedCategory() === null) {
                                  <button
                                    type="button"
                                    class="category-pill"
                                    (click)="onSelectCategory(item.category)"
                                    [style.background]="
                                      getCategoryColor(item.category)
                                    "
                                  >
                                    {{ getCategoryLabel(item.category) }}
                                  </button>
                                }
                              </div>

                              <!-- Divider + Details row: only when 5 or fewer cards -->
                              @if (period.multiple.length <= 5) {
                                <div class="card-divider"></div>
                                <div class="card-row details-row">
                                  <span class="details-text">
                                    {{ item.description || item.provider }}
                                  </span>
                                </div>
                              }

                              <!-- Middle row: date + amount -->
                              <div class="card-row middle">
                                @if (selectedCategory() !== null) {
                                  <span class="date-text">{{
                                    formatDay(item.latestDate)
                                  }}</span>
                                }
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
                                    <span class="percentage-badge income-badge">
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
      --bg-app: #f7f8fa;
      --bg-card: #ffffff;
      --bg-subtle: #fafbfc;
      --bg-muted: #f1f3f6;
      --bg-highlight: #fffdf5;

      --border-subtle: #eef0f4;
      --border-soft: #e5e8ee;
      --border-strong: #d8dde6;
      --border-highlight: #fae6a8;

      --text-primary: #16192c;
      --text-secondary: #5c6375;
      --text-tertiary: #8a91a3;
      --text-muted: #a8aebe;

      --accent-green: #0caa6c;
      --accent-green-bg: #ecfdf5;
      --accent-red: #e74c5e;
      --accent-red-bg: #fef2f2;
      --accent-blue: #4f6ef7;

      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --radius-pill: 999px;

      --shadow-xs: 0 1px 2px rgba(16, 24, 40, 0.04);
      --shadow-sm:
        0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04);
      --shadow-md:
        0 4px 12px rgba(16, 24, 40, 0.08), 0 2px 4px rgba(16, 24, 40, 0.04);
      --shadow-lg:
        0 8px 24px rgba(16, 24, 40, 0.1), 0 4px 8px rgba(16, 24, 40, 0.04);

      --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --transition-fast: 0.15s var(--ease-out);
      --transition-base: 0.22s var(--ease-out);

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

    /* ===== CHART SECTION ===== */
    .chart-section {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 12px;
      margin-bottom: 12px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: box-shadow var(--transition-base);
    }

    .chart-section:hover {
      box-shadow: var(--shadow-md);
    }

    .chart-section.compact-chart {
      padding: 10px;
      margin-bottom: 10px;
      border-radius: var(--radius-md);
    }

    /* Hide chart on mobile */
    .desktop-only {
      display: block;
    }

    /* Chart wrapper */
    .chart-wrapper {
      width: 100%;
      height: 300px;
      display: block;
      min-height: 200px;
    }

    .chart-wrapper ::ng-deep .highcharts-container {
      width: 100% !important;
      height: 100% !important;
    }

    /* Compact chart height */
    .chart-section.compact-chart .chart-wrapper {
      height: 240px;
      min-height: 160px;
    }

    /* ===== RESPONSIVE CHART HEIGHTS ===== */
    @media (max-width: 1024px) {
      .chart-wrapper {
        height: 260px;
        min-height: 180px;
      }
      .chart-section.compact-chart .chart-wrapper {
        height: 210px;
        min-height: 150px;
      }
    }

    @media (max-width: 768px) {
      .desktop-only {
        display: none !important;
      }
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
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 8px;
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
    }

    .transaction-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-soft);
    }

    .transaction-card.highlight-card {
      background: var(--bg-highlight);
      border-color: var(--border-highlight);
    }

    .transaction-card.highlight-card:hover {
      border-color: #f5d97a;
      box-shadow: 0 4px 14px rgba(250, 230, 168, 0.4);
    }

    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 2px 0;
    }

    .card-row.middle {
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      padding: 6px 0 0 0;
      margin: 6px 0 0 0;
    }

    .card-divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.05);
      margin: 6px 0;
      border: none;
    }

    .card-row.details-row {
      padding: 0 0 4px 0;
      justify-content: flex-start;
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

    .category-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
      filter: brightness(1.05);
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

    .period-container:hover {
      box-shadow: var(--shadow-sm);
      border-color: var(--border-soft);
    }

    .period-container.expanded {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
    }

    .period-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      cursor: pointer;
      transition: background var(--transition-fast);
      gap: 8px;
      min-height: 52px;
      flex-wrap: nowrap;
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

    .period-header:hover {
      background: var(--bg-subtle);
    }

    .period-header:focus-visible {
      outline: 2px solid var(--accent-blue);
      outline-offset: -2px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
      flex-wrap: nowrap;
    }

    .header-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary);
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .header-count {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-muted);
      padding: 2px 9px;
      border-radius: var(--radius-pill);
      line-height: 1.5;
      flex-shrink: 0;
    }

    .salary-tag {
      font-size: 0.8rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      flex-wrap: nowrap;
    }

    .income-tag,
    .expense-tag,
    .diff-tag {
      padding: 3px 9px;
      border-radius: var(--radius-pill);
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
      line-height: 1.4;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
    }

    .income-tag {
      background: var(--accent-green-bg);
      color: var(--accent-green);
    }

    .expense-tag {
      background: var(--accent-red-bg);
      color: var(--accent-red);
    }

    .diff-tag {
      background: var(--bg-muted);
      color: var(--text-secondary);
      min-width: 48px;
      text-align: center;
    }

    .diff-tag.positive {
      background: var(--accent-green-bg);
      color: var(--accent-green);
    }

    .diff-tag.negative {
      background: var(--accent-red-bg);
      color: var(--accent-red);
    }

    .expand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--text-tertiary);
      transition:
        transform var(--transition-base),
        color var(--transition-fast);
      margin-left: 2px;
      flex-shrink: 0;
    }

    .expand-icon svg {
      width: 14px;
      height: 14px;
    }

    .expand-icon.rotated {
      transform: rotate(180deg);
      color: var(--text-primary);
    }

    .period-header:hover .expand-icon {
      color: var(--text-primary);
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
      .transactions-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .period-header {
        padding: 10px 12px;
        min-height: 46px;
        gap: 6px;
      }

      .header-title {
        font-size: 0.88rem;
      }

      .header-count {
        font-size: 0.66rem;
        padding: 2px 7px;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.68rem;
        padding: 2px 7px;
      }

      .diff-tag {
        min-width: 42px;
      }

      .period-content {
        padding: 10px 12px 12px 12px;
      }

      .chart-section {
        padding: 10px;
        border-radius: var(--radius-md);
        margin-bottom: 10px;
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

      .expand-icon svg {
        width: 13px;
        height: 13px;
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
        gap: 5px;
      }

      .header-left {
        flex: 1;
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
        font-size: 0.58rem;
        padding: 1px 6px;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.6rem;
        padding: 2px 6px;
        line-height: 1.3;
      }

      .diff-tag {
        min-width: 34px;
      }

      .expand-icon {
        width: 18px;
        height: 18px;
      }

      .expand-icon svg {
        width: 12px;
        height: 12px;
      }

      .salary-tag {
        font-size: 0.65rem;
      }

      .period-content {
        padding: 8px 10px 10px 10px;
      }

      .chart-section {
        padding: 8px;
        border-radius: var(--radius-sm);
        margin-bottom: 8px;
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
        gap: 4px;
      }

      .header-title {
        font-size: 0.72rem;
      }

      .header-count {
        font-size: 0.55rem;
        padding: 1px 5px;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.55rem;
        padding: 1px 5px;
        line-height: 1.2;
      }

      .diff-tag {
        min-width: 28px;
      }

      .expand-icon svg {
        width: 11px;
        height: 11px;
      }

      .salary-tag {
        font-size: 0.6rem;
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
  viewMode = input<'all' | 'monthly' | 'yearly' | 'salary'>('monthly');

  selectedCategory = signal<TransactionCategory | null>(null);

  selectedTransaction = computed(() =>
    this.transactions().filter(
      (t) =>
        this.selectedCategory() === null ||
        t.category === this.selectedCategory(),
    ),
  );

  private expandedPeriodId = signal<string | null>(null);

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
    } else if (this.viewMode() === 'salary') {
      return this.groupedBySalaryPeriod();
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

  private groupedBySalaryPeriod = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const map = new Map<string, TransactionDomain[]>();

    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;

      const periodKey = this.getSalaryPeriodKey(date);
      if (!map.has(periodKey)) map.set(periodKey, []);
      map.get(periodKey)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([key, txs]) => {
        const [year, month, day] = key.split('-').map(Number);
        const periodStart = new Date(year, month, day);
        const periodEnd = new Date(year, month, day + 14);

        const monthName = new Date(year, month).toLocaleString('default', {
          month: 'short',
        });
        const id = `salary-${key}`;

        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${monthName} ${year}`,
          year,
          monthIndex: month,
          month: monthName,
          salaryPeriodStart: periodStart,
          salaryPeriodEnd: periodEnd,
          isSalaryPeriod: true,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex! - a.monthIndex!;
      });
  });

  private getSalaryPeriodKey(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (day >= 15) {
      return `${year}-${month}-15`;
    } else {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      return `${prevYear}-${prevMonth}-15`;
    }
  }

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

  updateBarChart = (
    filteredTransactions: TransactionDomain[],
  ): Highcharts.Options =>
    TransactionStatusBarChartUtils.getChart(filteredTransactions);
}
