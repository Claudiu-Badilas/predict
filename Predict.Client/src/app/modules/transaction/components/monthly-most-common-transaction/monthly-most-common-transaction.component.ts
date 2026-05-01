import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { TransactionDomain } from '../../models/transactions.model';

interface MonthlyGroup {
  month: string;
  year: number;
  monthIndex: number;
  totalIncome: number;
  totalExpense: number;
  multiple: GroupedTransaction[];
  single: GroupedTransaction[];
}

interface GroupedTransaction {
  provider: string;
  count: number;
  total: number;
  currency: string | null;
}

@Component({
  selector: 'p-monthly-most-common-transaction',
  imports: [CommonModule, NumberFormatPipe],
  template: `<div class="card">
    <div class="header">
      <div class="header-title">Tranzactii Lunare</div>
      <div class="header-stats">
        <span class="stat positive">
          <span class="stat-value"
            >+{{ totalIncomeAll() | numberFormat: '0.00' }}</span
          >
        </span>
        <span class="stat negative">
          <span class="stat-value"
            >-{{ totalExpenseAll() | numberFormat: '0.00' }}</span
          >
        </span>
      </div>
    </div>

    <div class="content">
      @for (monthGroup of groupedByMonth(); track monthGroup.month) {
        <div class="month-section">
          <div class="month-title">
            <div class="month-name">
              {{ monthGroup.month }} {{ monthGroup.year }}
            </div>
            <div class="month-totals">
              @if (monthGroup.totalIncome > 0) {
                <span class="income-total">
                  +{{ monthGroup.totalIncome | numberFormat: '0.00' }}
                </span>
              }
              @if (monthGroup.totalExpense > 0) {
                <span class="expense-total">
                  -{{ monthGroup.totalExpense | numberFormat: '0.00' }}
                </span>
              }
            </div>
          </div>

          <!-- Multiple transactions (count >= 2) -->
          @for (g of monthGroup.multiple; track g.provider) {
            <div class="group">
              <div class="row">
                <span class="provider">{{ g.provider }}</span>
                <span class="count-badge">{{ g.count }}</span>
                <span
                  class="amount"
                  [class.positive]="g.total > 0"
                  [class.negative]="g.total < 0"
                >
                  {{ g.total > 0 ? '+' : ''
                  }}{{ g.total | numberFormat: '0.00' }}
                </span>
              </div>
            </div>
          }

          <!-- Single transactions (count === 1) as Other -->
          @for (g of monthGroup.single; track g.provider) {
            <div class="group">
              <div class="row">
                <span class="provider other-provider">{{ g.provider }}</span>
                <span class="count-badge single">1</span>
                <span
                  class="amount"
                  [class.positive]="g.total > 0"
                  [class.negative]="g.total < 0"
                >
                  {{ g.total > 0 ? '+' : ''
                  }}{{ g.total | numberFormat: '0.00' }}
                </span>
              </div>
            </div>
          }

          @if (!monthGroup.multiple.length && !monthGroup.single.length) {
            <div class="empty-month">No transactions this month</div>
          }
        </div>
      }

      @if (!groupedByMonth().length) {
        <div class="empty">No transactions</div>
      }
    </div>
  </div> `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .card {
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      height: 320px;

      .header {
        padding: 10px 16px;
        font-weight: 600;
        font-size: 15px;
        border-bottom: 1px solid #eee;
        background: white;
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-title {
          font-weight: 600;
          font-size: 15px;
        }

        .header-stats {
          display: flex;
          gap: 12px;
          font-size: 13px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f8f9fa;

          &.positive {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;

            .stat-label {
              color: #059669;
            }

            .stat-value {
              color: #10b981;
            }
          }

          &.negative {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fecaca;

            .stat-label {
              color: #dc2626;
            }

            .stat-value {
              color: #ef4444;
            }
          }

          .stat-label {
            font-size: 10px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }

          .stat-value {
            font-weight: 700;
            font-size: 14px;
          }
        }
      }

      .content {
        flex: 1;
        overflow-y: auto;
        padding: 0;

        .month-section {
          margin-bottom: 12px;
          position: relative;

          &:last-child {
            margin-bottom: 0;
          }

          .month-title {
            font-size: 14px;
            font-weight: 700;
            color: #1f2937;
            padding: 10px 16px 8px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-bottom: 2px solid #cbd5e1;
            border-top: 1px solid #e2e8f0;
            margin-bottom: 8px;
            position: sticky;
            top: 0;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

            .month-name {
              flex: 1;
              font-size: 15px;
              letter-spacing: 0.3px;
              text-transform: uppercase;
            }

            .month-totals {
              display: flex;
              gap: 12px;
              font-size: 13px;
              font-weight: 600;

              .income-total {
                color: #059669;
                background: #d1fae5;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 700;
              }

              .expense-total {
                color: #dc2626;
                background: #fee2e2;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 700;
              }
            }
          }

          .group {
            padding: 0 25px;

            .row {
              display: flex;
              align-items: center;
              gap: 5px;
              padding: 4px 0;
              border-bottom: 1px solid #f0f0f0;

              .provider {
                font-weight: 500;
                font-size: 14px;
                flex: 1;

                &.other-provider {
                  opacity: 0.7;
                  font-weight: 400;
                }
              }

              .count-badge {
                background: #eef2ff;
                color: #4f46e5;
                padding: 2px 8px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;

                &.single {
                  background: #f3f4f6;
                  color: #6b7280;
                }
              }

              .amount {
                font-weight: 600;
                font-size: 14px;
                white-space: nowrap;
                min-width: 100px;
                text-align: right;

                &.positive {
                  color: #10b981;
                }

                &.negative {
                  color: #ef4444;
                }
              }
            }

            &:last-child {
              .row {
                border-bottom: none;
              }
            }
          }

          .empty-month {
            text-align: center;
            padding: 12px;
            color: #d1d5db;
            font-size: 12px;
            font-style: italic;
          }
        }

        .empty {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
          font-size: 14px;
        }
      }
    }
  `,
})
export class MonthlyMostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([], { alias: 'transactions' });

  totalIncomeAll = computed(() => {
    const transactions = this.transactions();
    if (!transactions?.length) return 0;
    return transactions
      .filter((tx) => (tx.amount ?? 0) > 0)
      .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  });

  totalExpenseAll = computed(() => {
    const transactions = this.transactions();
    if (!transactions?.length) return 0;
    const total = transactions
      .filter((tx) => (tx.amount ?? 0) < 0)
      .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
    return Math.abs(total);
  });

  groupedByMonth = computed(() => {
    const transactions = this.transactions();
    if (!transactions?.length) return [];

    // Group transactions by month/year
    const transactionsByMonth = new Map<string, TransactionDomain[]>();

    transactions.forEach((tx) => {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) return;

      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!transactionsByMonth.has(key)) {
        transactionsByMonth.set(key, []);
      }
      transactionsByMonth.get(key)!.push(tx);
    });

    // Process each month
    const monthlyGroups: MonthlyGroup[] = [];

    for (const [key, monthTransactions] of transactionsByMonth.entries()) {
      const [year, monthIndex] = key.split('-').map(Number);
      const monthName = new Date(year, monthIndex).toLocaleString('default', {
        month: 'long',
      });

      // Calculate totals
      let totalIncome = 0;
      let totalExpense = 0;
      monthTransactions.forEach((tx) => {
        const amount = tx.amount ?? 0;
        if (amount > 0) {
          totalIncome += amount;
        } else if (amount < 0) {
          totalExpense += Math.abs(amount);
        }
      });

      // Group transactions within the month by provider
      const grouped = this.groupTransactions(monthTransactions);

      monthlyGroups.push({
        month: monthName,
        year: year,
        monthIndex: monthIndex,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        multiple: grouped.filter((g) => g.count >= 2),
        single: grouped.filter((g) => g.count === 1),
      });
    }

    // Sort by year (descending) and month (descending)
    return monthlyGroups.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.monthIndex - a.monthIndex;
    });
  });

  private groupTransactions(
    transactions: TransactionDomain[],
  ): GroupedTransaction[] {
    const grouped = transactions.reduce(
      (acc, tx) => {
        const key = tx.serviceProvider || 'Unknown';
        if (!acc[key]) {
          acc[key] = {
            provider: key,
            count: 0,
            total: 0,
            currency: tx.currency,
          };
        }
        acc[key].count++;
        acc[key].total += tx.amount ?? 0;
        return acc;
      },
      {} as Record<string, GroupedTransaction>,
    );

    return Object.values(grouped).sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return Math.abs(b.total) - Math.abs(a.total);
    });
  }
}
