import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { HoldTriggerDirective } from 'src/app/shared/directives/hold-trigger.directive';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import {
  LoanSimulatorInstalment,
  MonthlyInstalmentManager,
} from '../../models/loan-simulator.model';

@Component({
  selector: 'p-loan-simulator-body-table',
  imports: [
    CommonModule,
    FormsModule,
    NumberFormatPipe,
    CheckboxComponent,
    HoldTriggerDirective,
  ],
  template: `
    <div class="table-wrapper desktop-view">
      <table class="instalment-table">
        <thead>
          <tr>
            <th class="col-first">
              <div class="expand-controls">
                <img
                  width="15"
                  height="15"
                  src="assets/icons/collapse.svg"
                  alt="collapse"
                  (click)="onCollapseAll()"
                />
                <img
                  width="15"
                  height="15"
                  src="assets/icons/expand.svg"
                  alt="expand"
                  (click)="onExpandAll()"
                />
              </div>
            </th>
            <th>Data</th>
            <th>Credit</th>
            <th>Dobândă</th>
            <th>Asig.</th>
            <th>Total</th>
            <th>1/2</th>
            <th>Anticipat</th>
            <th>Sold</th>
          </tr>
        </thead>

        <tbody>
          @for (group of monthlyInstalmentGroups(); track group.id) {
            @if (group.completed) {
              <tr
                class="group-header-subtotal-row"
                [class.expanded-group]="group.expanded"
                (click)="toggleGroup(group)"
              >
                @let subtotal = getSubtotal(group);

                <td class="col-first">
                  <span class="count"
                    >{{ subtotal.instalmentsCount }}
                    @if (subtotal.earlyCount > 0) {
                      <span class="early-chip">+{{ subtotal.earlyCount }}</span>
                    }
                  </span>
                </td>

                <td class="bold">{{ group.title | date: 'MMM yyyy' }}</td>

                <td class="bold">
                  {{ subtotal.principal | numberFormat: '0.00' }}
                </td>

                <td class="bold">
                  {{ subtotal.interest | numberFormat: '0.00' }}
                </td>

                <td class="bold">
                  {{ subtotal.insurance | numberFormat: '0.00' }}
                </td>

                <td class="bold subtotal-total">
                  {{ subtotal.total | numberFormat: '0.00' }}
                </td>

                <td class="bold">
                  {{ subtotal.total / 2 | numberFormat: '0.00' }}
                </td>
                <td class="bold">
                  {{ subtotal.earlyPaymenrt | numberFormat: '0.00' }}
                </td>
                <td class="bold">
                  {{ subtotal.restant | numberFormat: '0.00' }}
                </td>
              </tr>
            }

            @if (!group.completed || group.expanded) {
              @for (
                row of group.instalments;
                let last = $last;
                track row.instalmentId
              ) {
                <tr
                  [class.row-selected]="row.instalmentPayment"
                  [class.row-early]="row.earlyPayment"
                  [class.row-disabled]="
                    !row.instalmentPayment && !row.earlyPayment
                  "
                >
                  <td class="col-first">
                    <div class="row-controls">
                      <span class="row-index">{{ row.instalmentId }}</span>
                      <p-checkbox
                        [id]="row.instalmentId"
                        [checked]="row.instalmentPayment"
                        [disabled]="row.disabled || row.earlyPayment"
                        (valueChange)="onSelectInstalmentPayment(row)"
                      />
                      <p-checkbox
                        [id]="row.instalmentId"
                        [checked]="row.earlyPayment"
                        [disabled]="row.disabled || row.instalmentPayment"
                        (valueChange)="onSelectEarlyPayment(row)"
                      />
                    </div>
                  </td>

                  <td
                    [class.strike]="row.earlyPayment || row.instalmentPayment"
                    [class.disabled]="!group.completed && row.disabled"
                  >
                    {{ row.paymentDate | date: 'MMM yyyy' }}
                  </td>
                  <td
                    [class.semi-bold]="
                      row.earlyPayment || row.instalmentPayment
                    "
                    [class.disabled]="!group.completed && row.disabled"
                  >
                    {{ row.principalAmount | numberFormat: '0.00'
                    }}{{ row.recalculated ? '*' : '' }}
                  </td>
                  <td
                    [class.strike]="row.earlyPayment"
                    [class.disabled]="!group.completed && row.disabled"
                  >
                    {{ row.interestAmount | numberFormat: '0.00'
                    }}{{ row.recalculated ? '*' : '' }}
                  </td>
                  <td
                    [class.strike]="row.earlyPayment"
                    [class.disabled]="!group.completed && row.disabled"
                  >
                    {{ row.insuranceCost | numberFormat: '0.00'
                    }}{{ row.recalculated ? '*' : '' }}
                  </td>
                  <td [class.disabled]="!group.completed && row.disabled">
                    @if (!row.earlyPayment && !row.instalmentPayment) {
                      <span
                        >{{ row.totalInstalment | numberFormat: '0.00'
                        }}{{ row.recalculated ? '*' : '' }}</span
                      >
                    } @else {
                      <span class="subtotal-total">{{
                        row.batchTotalInstalment | numberFormat: '-'
                      }}</span>
                    }
                  </td>
                  <td [class.disabled]="!group.completed && row.disabled">
                    {{ row.batchTotalInstalment / 2 | numberFormat: '-' }}
                  </td>
                  <td [class.disabled]="!group.completed && row.disabled">
                    {{ row.batchTotalEarlyPayment | numberFormat: '-' }}
                  </td>
                  <td
                    [class.strike]="
                      !last && (row.earlyPayment || row.instalmentPayment)
                    "
                    [class.semi-bold]="
                      last && (row.earlyPayment || row.instalmentPayment)
                    "
                    [class.disabled]="!group.completed && row.disabled"
                  >
                    {{ row.remainingBalance | numberFormat: '0.00' }}
                  </td>
                </tr>
              }
            }
          }
        </tbody>
      </table>
    </div>

    <div class="mobile-view">
      @for (group of monthlyInstalmentGroups(); track group.id) {
        @if (group.completed) {
          @let subtotal = getSubtotal(group);
          <div class="mobile-group-card">
            <div
              class="mobile-group-header"
              (holdTrigger)="onExpandOrCollapse()"
              (click)="toggleGroup(group)"
            >
              <div class="mobile-group-info">
                <div class="mobile-group-left">
                  <div class="mobile-group-title">
                    {{ group.title | date: 'MMM yyyy' }}
                  </div>
                  <span class="mobile-group-count">
                    {{ subtotal.instalmentsCount }}
                    @if (subtotal.earlyCount > 0) {
                      <span class="early-chip">+{{ subtotal.earlyCount }}</span>
                    }
                  </span>
                </div>
                <div class="mobile-group-right">
                  <div class="mobile-group-total total-value">
                    <span>TOTAL</span>
                    <span>{{ subtotal.total | numberFormat: '0.00' }}</span>
                  </div>
                  <div class="mobile-group-total balance-value">
                    <span>SOLD</span>
                    <span>{{ subtotal.restant | numberFormat: '0.00' }}</span>
                  </div>
                </div>
              </div>
            </div>

            @if (group.expanded) {
              <div class="mobile-items-list">
                @for (row of group.instalments; track row.instalmentId) {
                  <div
                    class="mobile-item"
                    [class.item-selected]="row.instalmentPayment"
                    [class.item-early]="row.earlyPayment"
                    [class.item-disabled]="
                      !row.instalmentPayment && !row.earlyPayment
                    "
                  >
                    <div class="mobile-item-row">
                      <div class="mobile-item-col col-index">
                        <div class="checkbox-group">
                          <span class="item-index"
                            >#{{ row.instalmentId }}</span
                          >
                          <p-checkbox
                            [id]="row.instalmentId"
                            [checked]="row.instalmentPayment"
                            [disabled]="row.disabled || row.earlyPayment"
                            (valueChange)="onSelectInstalmentPayment(row)"
                          />
                          <p-checkbox
                            [id]="row.instalmentId"
                            [checked]="row.earlyPayment"
                            [disabled]="row.disabled || row.instalmentPayment"
                            (valueChange)="onSelectEarlyPayment(row)"
                          />
                        </div>
                        <span
                          class="item-date"
                          [class.strike]="
                            row.earlyPayment || row.instalmentPayment
                          "
                        >
                          {{ row.paymentDate | date: 'MMM yyyy' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Credit</span>
                        <span class="item-value principal-value"
                          >{{ row.principalAmount | numberFormat: '0.00'
                          }}{{ row.recalculated ? '*' : '' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Anticipat</span>
                        <span class="item-value principal-value">
                          {{ row.batchTotalEarlyPayment | numberFormat: '-'
                          }}{{ row.recalculated ? '*' : '' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Dobândă</span>
                        <span
                          class="item-value interest-value"
                          [class.strike]="row.earlyPayment"
                        >
                          {{ row.interestAmount | numberFormat: '0.00'
                          }}{{ row.recalculated ? '*' : '' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Asig.</span>
                        <span
                          class="item-value insurance-value"
                          [class.strike]="row.earlyPayment"
                        >
                          {{ row.insuranceCost | numberFormat: '0.00'
                          }}{{ row.recalculated ? '*' : '' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Total</span>
                        <span class="item-value total-value">
                          @if (!row.earlyPayment && !row.instalmentPayment) {
                            {{ row.totalInstalment | numberFormat: '0.00'
                            }}{{ row.recalculated ? '*' : '' }}
                          } @else {
                            {{ row.batchTotalInstalment | numberFormat: '-' }}
                          }
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">1/2</span>
                        <span class="item-value">
                          {{ row.batchTotalInstalment / 2 | numberFormat: '-' }}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="mobile-normal-section">
            <div class="mobile-items-list">
              @for (row of group.instalments; track row.instalmentId) {
                <div class="mobile-item item-disabled">
                  <div class="mobile-item-row">
                    <div class="mobile-item-col col-index">
                      <div class="checkbox-group">
                        <span class="item-index">#{{ row.instalmentId }}</span>
                        <p-checkbox
                          [id]="row.instalmentId"
                          [checked]="row.instalmentPayment"
                          [disabled]="row.disabled || row.earlyPayment"
                          (valueChange)="onSelectInstalmentPayment(row)"
                        />
                        <p-checkbox
                          [id]="row.instalmentId"
                          [checked]="row.earlyPayment"
                          [disabled]="row.disabled || row.instalmentPayment"
                          (valueChange)="onSelectEarlyPayment(row)"
                        />
                      </div>
                      <span
                        class="item-date"
                        [class.strike]="
                          row.earlyPayment || row.instalmentPayment
                        "
                      >
                        {{ row.paymentDate | date: 'MMM yyyy' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Credit</span>
                      <span class="item-value principal-value"
                        >{{ row.principalAmount | numberFormat: '0.00'
                        }}{{ row.recalculated ? '*' : '' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Dobândă</span>
                      <span class="item-value interest-value">
                        {{ row.interestAmount | numberFormat: '0.00'
                        }}{{ row.recalculated ? '*' : '' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Asig.</span>
                      <span class="item-value insurance-value">
                        {{ row.insuranceCost | numberFormat: '0.00'
                        }}{{ row.recalculated ? '*' : '' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Total</span>
                      <span class="item-value total-value">
                        {{ row.totalInstalment | numberFormat: '0.00'
                        }}{{ row.recalculated ? '*' : '' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Sold</span>
                      <span class="item-value balance-value">
                        {{ row.remainingBalance | numberFormat: '0.00' }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
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
      --green: #059669;
      --red: #dc2626;
      --blue: #2563eb;
      --violet: #7c3aed;
      --amber: #b45309;
      --amber-soft: #fef3c7;

      --selected-bg: #fffbeb;
      --selected-border: #f59e0b;
      --early-bg: #ecfdf5;
      --early-border: #10b981;
      --disabled-bg: #f8fafc;
      --disabled-border: #94a3b8;
      --group-bg: #fef2f2;
      --group-bg-hover: #fee2e2;

      display: block;
      color: var(--text);
      font-family: inherit;
    }

    .desktop-view {
      display: block;
    }

    .table-wrapper {
      border-radius: 12px;
      margin: 10px 0;
      background: var(--surface);
      height: calc(100vh - 185px);
      overflow: auto;
      border: 1px solid var(--border);
    }

    .instalment-table {
      width: 100%;
      table-layout: auto;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
    }

    th,
    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
      min-width: 80px;
      text-align: center;
      transition: background 100ms ease;
    }

    th {
      background: var(--surface-soft);
      color: var(--muted);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    thead th {
      position: sticky;
      top: 0;
      z-index: 25;
      background: var(--surface-soft);
    }

    th.col-first,
    td.col-first {
      position: sticky;
      left: 0;
      z-index: 30;
      width: 90px;
      min-width: 90px;
      text-align: center;
    }

    thead th.col-first {
      z-index: 50;
      background: var(--surface-soft);
    }

    tbody td.col-first {
      z-index: 40;
      background: var(--surface-soft);
    }

    .bold {
      font-weight: 700;
    }

    .semi-bold {
      font-weight: 600;
    }

    .expand-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .expand-controls img {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 100ms ease;
    }

    .expand-controls img:hover {
      opacity: 1;
    }

    .group-header-subtotal-row {
      cursor: pointer;
      background: var(--group-bg);
      transition: background 0.2s ease;
    }

    .group-header-subtotal-row td {
      padding: 10px;
      font-size: 13px;
      background: var(--group-bg);
    }

    .group-header-subtotal-row td.col-first {
      background: var(--group-bg);
    }

    .group-header-subtotal-row:hover td,
    .group-header-subtotal-row:hover td.col-first {
      background: var(--group-bg-hover);
    }

    .count {
      color: var(--teal);
      font-size: 11px;
      font-weight: 700;
      background: var(--surface);
      padding: 2px 8px;
      border-radius: 20px;
      border: 1px solid var(--border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .early-chip {
      display: inline-flex;
      align-items: center;
      padding: 1px 4px;
      border-radius: 5px;
      background: var(--amber-soft);
      color: var(--amber);
      font-size: 8.5px;
      font-weight: 750;
      line-height: 1.2;
    }

    .subtotal-total {
      color: var(--teal);
      font-weight: 700;
    }

    .strike {
      text-decoration: line-through;
      color: var(--muted);
    }

    .disabled {
      color: #c0c0c0;
    }

    .row-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .row-index {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-soft);
    }

    .row-selected td {
      background: var(--selected-bg);
      border-bottom-color: var(--selected-border);
    }

    .row-selected td.col-first {
      background: var(--selected-bg);
      border-left: 3px solid var(--selected-border);
    }

    .row-selected td:last-child {
      border-right: 3px solid var(--selected-border);
    }

    .row-early td {
      background: var(--early-bg);
      border-bottom-color: var(--early-border);
    }

    .row-early td.col-first {
      background: var(--early-bg);
      border-left: 3px solid var(--early-border);
    }

    .row-early td:last-child {
      border-right: 3px solid var(--early-border);
    }

    .row-disabled td {
      background: var(--disabled-bg);
    }

    .row-disabled td.col-first {
      background: var(--disabled-bg);
      border-left: 3px solid var(--disabled-border);
    }

    .row-disabled td:last-child {
      border-right: 3px solid var(--disabled-border);
    }

    tbody tr:hover td {
      filter: brightness(0.98);
    }

    .mobile-view {
      display: none;
    }

    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
        padding: 12px;
        overflow-y: auto;
        height: calc(100vh - 200px);
      }

      .mobile-group-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        margin-bottom: 8px;
        overflow: hidden;
      }

      .mobile-normal-section {
        background: var(--surface);
        border: 1px solid var(--border);
        overflow: hidden;
      }

      .mobile-group-header {
        padding: 12px;
        background: var(--group-bg);
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .mobile-group-header:active {
        background: var(--group-bg-hover);
      }

      .mobile-group-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
      }

      .mobile-group-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .mobile-group-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .mobile-group-title {
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
      }

      .mobile-group-count {
        color: #ef4444;
        font-size: 10px;
        font-weight: 700;
        background: white;
        padding: 2px 8px;
        border-radius: 30px;
        border: 1px solid #ef4444;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }

      .mobile-group-total {
        font-weight: 600;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 12px;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 1.2;
      }

      .mobile-group-total.total-value {
        color: #0f766e;
        border: 1px solid #0f766e;
      }

      .mobile-group-total.balance-value {
        color: #212529;
        border: 1px solid #212529;
      }

      .mobile-items-list {
        display: block;
      }

      .mobile-item {
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
        background: var(--surface);
      }

      .mobile-item:last-child {
        border-bottom: none;
      }

      .mobile-item.item-selected {
        background: var(--selected-bg);
        border-left: 3px solid var(--selected-border);
      }

      .mobile-item.item-early {
        background: var(--early-bg);
        border-left: 3px solid var(--early-border);
      }

      .mobile-item.item-disabled {
        background: var(--disabled-bg);
        border-left: 3px solid var(--disabled-border);
      }

      .mobile-item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .mobile-item-row:last-child {
        margin-bottom: 0;
      }

      .mobile-item-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 60px;
      }

      .mobile-item-col.col-index {
        flex: 0 0 auto;
        min-width: 70px;
        align-items: center;
        gap: 4px;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
      }

      .item-index {
        font-weight: 700;
        font-size: 13px;
        color: #1f2937;
      }

      .item-date {
        font-size: 11px;
        color: #6b7280;
        text-transform: capitalize;
      }

      .item-label {
        font-size: 9px;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
        white-space: nowrap;
      }

      .item-value {
        font-weight: 600;
        font-size: 12px;
        color: #1f2937;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      .principal-value {
        color: #10b981;
      }

      .interest-value {
        color: #ef4444;
      }

      .insurance-value {
        color: #7c3aed;
      }

      .total-value {
        color: #0f766e;
        font-weight: 700;
      }

      .balance-value {
        color: #1f2937;
      }

      .strike {
        text-decoration: line-through;
        color: #9ca3af;
      }
    }

    @media (max-width: 480px) {
      .mobile-view {
        padding: 8px 0 0 0;
        height: calc(100vh - 180px);
      }

      .mobile-group-header {
        padding: 15px;
      }

      .mobile-group-title {
        font-size: 12px;
      }

      .mobile-group-count {
        font-size: 9px;
        padding: 2px 6px;
      }

      .mobile-group-total {
        font-size: 8px;
        padding: 2px 5px;
      }

      .mobile-item {
        padding: 10px;
      }

      .mobile-item-col {
        min-width: 50px;
      }

      .mobile-item-col.col-index {
        min-width: 60px;
      }

      .item-index {
        font-size: 11px;
      }

      .item-date {
        font-size: 10px;
      }

      .item-label {
        font-size: 8px;
      }

      .item-value {
        font-size: 10px;
      }

      .early-chip {
        font-size: 8px;
        padding: 1px 3px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      th,
      td {
        transition: none;
      }
    }
  `,
})
export class LoanSimulatorBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  store = inject(Store<fromLoan.LoanState>);

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: LoanSimulatorInstalment) {
    row.instalmentPayment = !row.instalmentPayment;
  }

  getSubtotal(group: MonthlyInstalmentManager) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount ?? 0,
      insurance: installment?.insuranceCost ?? 0,
      total: Calculator.sum(
        early
          .map((e) => e.principalAmount)
          .concat(installment?.totalInstalment ?? 0),
      ),
      earlyPaymenrt: Calculator.sum(early.map((e) => e.principalAmount)),
      restant: instalments?.at(-1)?.remainingBalance,
      count: instalments.length,
    };
  }

  onSelectInstalmentPayment(instalment: LoanSimulatorInstalment) {
    this.store.dispatch(
      LoanActions.selectedInstalmentPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onSelectEarlyPayment(instalment: LoanSimulatorInstalment) {
    this.store.dispatch(
      LoanActions.selectedEarlyPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onExpandAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = true));
  }

  onCollapseAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = false));
  }

  expandState = true;

  onExpandOrCollapse() {
    this.expandState = !this.expandState;
    this.monthlyInstalmentGroups().forEach(
      (group) => (group.expanded = this.expandState),
    );
  }
}
