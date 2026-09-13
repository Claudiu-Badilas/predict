import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { HistoricalInstalmentPaymentBatch } from '../../models/base-loan-rate.model';

@Component({
  selector: 'p-historical-instalments-table',
  imports: [CommonModule, NumberFormatPipe],
  template: `
    <section class="historical-instalments" aria-label="Istoric rate">
      @if (monthlyGroups().length) {
        <!-- Desktop — table with same visual language as mobile -->
        <div class="desktop-view">
          <div class="table-shell">
            <table class="instalment-table">
              <thead>
                <tr>
                  <th colspan="2">Luna</th>
                  <th>Total</th>
                  <th>Principal</th>
                  <th>Dobândă</th>
                  <th>Asigurare</th>
                  <th>Sold</th>
                </tr>
              </thead>

              <tbody>
                @for (group of monthlyGroups(); track group.title) {
                  @let subtotal = group.subtotal;

                  <tr>
                    <!-- Month + count (soft-tinted like mobile) -->
                    <td class="col-month">
                      <div class="cell-month">
                        <span class="cell-label month-label">
                          {{ group.title | date: 'MMM yyyy' }}
                        </span>
                      </div>
                    </td>
                    <td class="col-month">
                      <div class="cell-month">
                        <span class="cell-value total-value">
                          {{ subtotal.instalmentsCount }}
                          @if (subtotal.earlyCount) {
                            <span class="early-chip"
                              >+{{ subtotal.earlyCount }}</span
                            >
                          }
                        </span>
                      </div>
                    </td>

                    <td>
                      <span class="cell-value total-value">
                        {{ subtotal.total | numberFormat: '0.00' }}
                      </span>
                    </td>

                    <td>
                      <span class="cell-value principal-value">
                        {{ subtotal.principal | numberFormat: '0.00' }}
                      </span>
                    </td>

                    <td>
                      <span class="cell-value interest-value">
                        {{ subtotal.interest | numberFormat: '0.00' }}
                      </span>
                    </td>

                    <td>
                      <span class="cell-value insurance-value">
                        {{ subtotal.insuranceCost | numberFormat: '0.00' }}
                      </span>
                    </td>

                    <td>
                      <span class="cell-value balance-value">
                        {{ subtotal.remainingBalance | numberFormat: '0.00' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile — merged list, same visual language -->
        <div class="mobile-view">
          <div class="mobile-list">
            @for (group of monthlyGroups(); track group.title) {
              @let subtotal = group.subtotal;

              <div class="month-row">
                <!-- Month + count -->
                <div class="cell cell-month">
                  <span class="cell-value total-value">
                    {{ subtotal.instalmentsCount }}
                    @if (subtotal.earlyCount) {
                      <span class="early-chip">+{{ subtotal.earlyCount }}</span>
                    }</span
                  ><span class="cell-label month-label">
                    {{ group.title | date: 'MMM yyyy' }}
                  </span>
                </div>

                <!-- Total -->
                <div class="cell">
                  <span class="cell-label">Total</span>
                  <span class="cell-value total-value">
                    {{ subtotal.total | numberFormat: '0.00' }}
                  </span>
                </div>

                <!-- Principal -->
                <div class="cell">
                  <span class="cell-label">Principal</span>
                  <span class="cell-value principal-value">
                    {{ subtotal.principal | numberFormat: '0.00' }}
                  </span>
                </div>

                <!-- Dobândă -->
                <div class="cell">
                  <span class="cell-label">Dobândă</span>
                  <span class="cell-value interest-value">
                    {{ subtotal.interest | numberFormat: '0.00' }}
                  </span>
                </div>

                <!-- Asig. -->
                <div class="cell">
                  <span class="cell-label">Asig.</span>
                  <span class="cell-value insurance-value">
                    {{ subtotal.insuranceCost | numberFormat: '0.00' }}
                  </span>
                </div>

                <!-- Sold -->
                <div class="cell">
                  <span class="cell-label">Sold</span>
                  <span class="cell-value balance-value">
                    {{ subtotal.remainingBalance | numberFormat: '0.00' }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-title">Nu există date de plată</div>
          <div class="empty-text">
            Istoricul ratelor va apărea aici după înregistrarea unei plăți.
          </div>
        </div>
      }
    </section>
  `,

  styles: `
    :host {
      --surface: #fff;
      --surface-soft: #f8fafb;
      --surface-tint: #fbfdfd;
      --border: #e7ecef;
      --border-soft: #eef2f5;
      --text: #24313a;
      --text-soft: #334155;
      --muted: #7a8790;
      --teal: #0f766e;
      --teal-soft: #eaf6f4;
      --green: #059669;
      --red: #dc2626;
      --blue: #2563eb;
      --violet: #7c3aed;
      --amber: #b45309;
      --amber-soft: #fef3c7;

      display: block;
      color: var(--text);
      font-family: inherit;
    }

    .historical-instalments {
      width: 100%;
    }

    /* ============================================================
       SHARED — labels, values, chips, semantic colors
       ============================================================ */
    .cell-label {
      color: var(--muted);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .cell-value {
      color: var(--text-soft);
      font-size: 10.5px;
      font-weight: 750;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .total-value {
      color: var(--teal);
      font-weight: 800;
    }

    .principal-value {
      color: var(--green);
    }

    .interest-value {
      color: var(--red);
    }

    .insurance-value {
      color: var(--violet);
    }

    .balance-value {
      color: var(--blue);
      font-weight: 800;
    }

    .early-chip {
      display: inline-flex;
      align-items: center;
      padding: 1px 4px;
      margin-left: 2px;
      border-radius: 5px;
      background: var(--amber-soft);
      color: var(--amber);
      font-size: 8.5px;
      font-weight: 750;
      line-height: 1.2;
    }

    /* ============================================================
       DESKTOP — table shell
       ============================================================ */
    .desktop-view {
      display: block;
      width: 100%;
    }

    .table-shell {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .instalment-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    /* Header row — muted, uppercase, centered like mobile labels */
    .instalment-table thead th {
      padding: 14px 8px;
      background: var(--surface-soft);
      color: var(--muted);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-align: center;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    /* First header cell — left aligned, tinted, anchors the table */
    .instalment-table thead th.col-month {
      width: 22%;
      text-align: left;
      padding-left: 16px;
    }

    /* Other header cells — equal width */
    .instalment-table thead th:nth-child(n + 2) {
      width: 15.6%;
    }

    /* Body rows */
    .instalment-table tbody td {
      padding: 14px 8px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      text-align: center;
      vertical-align: middle;
      transition: background 100ms ease;
    }

    .instalment-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* First body cell — left aligned, tinted */
    .instalment-table tbody td.col-month {
      text-align: left;
      padding: 12px 16px;
      background: var(--surface-soft);
    }

    /* Labels sit above values, stacked like mobile cells */
    .instalment-table tbody td > .cell-label {
      display: block;
      margin-bottom: 5px;
    }

    .instalment-table tbody td > .cell-value {
      display: block;
      font-size: 13px;
      letter-spacing: -0.015em;
    }

    /* Row hover */
    .instalment-table tbody tr:hover td {
      background: var(--surface-tint);
    }

    .instalment-table tbody tr:hover td.col-month {
      background: var(--surface-soft);
    }

    /* Month cell content */
    .cell-month {
      display: flex;
      gap: 5px;
      align-items: center;
      justify-content: center;
      min-width: 0;
    }

    .cell-month .cell-value {
      font-size: 13px;
      letter-spacing: -0.015em;
    }

    .cell-month .cell-label.month-label {
      color: #25323a;
      font-size: 13px;
      font-weight: 750;
      letter-spacing: 0.01em;
      text-transform: capitalize;
    }

    /* ============================================================
       MOBILE (hidden by default)
       ============================================================ */
    .mobile-view {
      display: none;
    }

    /* ============================================================
       EMPTY STATE
       ============================================================ */
    .empty-state {
      padding: 32px 20px;
      border: 1px dashed #d6dee3;
      border-radius: 12px;
      background: var(--surface-soft);
      text-align: center;
    }

    .empty-title {
      color: #34434d;
      font-size: 14px;
      font-weight: 750;
    }

    .empty-text {
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
    }

    /* ============================================================
       TABLET
       ============================================================ */
    @media (max-width: 900px) and (min-width: 769px) {
      .instalment-table thead th {
        padding: 12px 6px;
        font-size: 9px;
      }

      .instalment-table tbody td {
        padding: 12px 6px;
      }

      .instalment-table tbody td.col-month {
        padding: 12px 12px;
      }

      .instalment-table tbody td > .cell-value,
      .cell-month .cell-value,
      .cell-month .cell-label.month-label {
        font-size: 12px;
      }
    }

    /* ============================================================
       MOBILE — merged list, same visual language
       ============================================================ */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
        width: 100%;
      }

      .mobile-list {
        display: block;
        width: 100%;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }

      .month-row {
        display: grid;
        grid-template-columns:
          minmax(0, 1.15fr) /* Month     */
          minmax(0, 1.15fr) /* Total     */
          minmax(0, 1.15fr) /* Principal */
          minmax(0, 1.15fr) /* Dobândă   */
          minmax(0, 0.85fr) /* Asig.     */
          minmax(0, 1.15fr); /* Sold     */
        align-items: stretch;
        border-bottom: 1px solid var(--border);
      }

      .month-row:last-child {
        border-bottom: none;
      }

      .cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        min-width: 0;
        padding: 8px 3px;
        text-align: center;
      }

      .cell-month {
        gap: 4px;
        padding: 8px 6px;
        background: var(--surface-soft);
      }

      .cell-month .cell-label {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #25323a;
        font-size: 11px;
        font-weight: 750;
        letter-spacing: 0.01em;
        text-transform: capitalize;
        white-space: nowrap;
      }
    }

    /* ============================================================
       SMALL PHONES
       ============================================================ */
    @media (max-width: 480px) {
      .cell {
        padding: 7px 0px;
        gap: 2px;
      }

      .cell-month {
        padding: 7px 0px;
        gap: 3px;
        font-size: 11px;
      }

      .cell-month .cell-label {
        font-size: 10px;
        gap: 4px;
      }

      .cell-label {
        font-size: 7px;
        letter-spacing: 0.03em;
      }

      .cell-value {
        font-size: 9.5px;
      }

      .early-chip {
        font-size: 8px;
        padding: 1px 3px;
      }
    }

    /* ============================================================
       VERY SMALL PHONES
       ============================================================ */
    @media (max-width: 380px) {
      .month-row {
        grid-template-columns:
          minmax(0, 1.1fr)
          minmax(0, 1.1fr)
          minmax(0, 1.1fr)
          minmax(0, 1.1fr)
          minmax(0, 0.8fr)
          minmax(0, 1.1fr);
      }

      .cell {
        padding: 6px 1px;
      }

      .cell-month {
        padding: 6px 4px;
      }

      .cell-month .cell-label {
        font-size: 9px;
      }

      .cell-label {
        font-size: 6.5px;
        letter-spacing: 0.02em;
      }

      .cell-value {
        font-size: 8.5px;
        letter-spacing: -0.03em;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .instalment-table tbody td {
        transition: none;
      }
    }
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoricalInstalmentsTableComponent {
  monthlyInstalmentGroups = input<HistoricalInstalmentPaymentBatch[]>([]);

  monthlyGroups = computed(() => {
    const groups = this.monthlyInstalmentGroups();

    const filteredGroups = groups
      .map((group) => ({
        ...group,
        instalments: group.instalments.filter(
          (row) => row.instalmentPayment || row.earlyPayment,
        ),
      }))
      .filter((group) => group.instalments.length > 0);

    const sortedGroups = [...filteredGroups].sort((a, b) => {
      const dateA =
        a.title instanceof Date
          ? a.title.getTime()
          : new Date(a.title).getTime();

      const dateB =
        b.title instanceof Date
          ? b.title.getTime()
          : new Date(b.title).getTime();

      return dateB - dateA;
    });

    return sortedGroups.map((group) => {
      const paymentRows = group.instalments.filter(
        (row) => row.instalmentPayment || row.earlyPayment,
      );

      const installment = paymentRows.find((row) => row.instalmentPayment);
      const early = paymentRows.filter((row) => row.earlyPayment);

      return {
        title: group.title,
        instalments: paymentRows,
        subtotal: {
          instalmentsCount: installment ? 1 : 0,
          earlyCount: early.length,
          principal: Calculator.sum(
            paymentRows.map((row) => row.principalAmount),
          ),
          interest: installment?.interestAmount || 0,
          insuranceCost: installment?.insuranceCost || 0,
          total: Calculator.sum(
            paymentRows
              .map((row) => row.principalAmount)
              .concat([
                installment?.interestAmount || 0,
                installment?.insuranceCost || 0,
              ]),
          ),
          remainingBalance:
            early.at(-1)?.remainingBalance ||
            installment?.remainingBalance ||
            0,
          count: paymentRows.length,
        },
      };
    });
  });
}
