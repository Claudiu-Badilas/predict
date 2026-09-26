import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import {
  LoanSimulatorInstalment,
  MonthlyInstalmentManager,
} from '../../models/loan-simulator.model';

@Component({
  selector: 'p-loan-simulator-body-table',
  imports: [CommonModule, FormsModule, NumberFormatPipe],
  template: `<div class="table-wrapper desktop-view">
      <table class="instalment-table">
        <thead>
          <tr>
            <th class="col-first"></th>
            <th>Data</th>
            <th>Credit</th>
            <th>Dobândă</th>
            <th>Asig.</th>
            <th>Total</th>
            <th>1/2</th>
            <th>Anticipat</th>
            <th>Sold</th>
            <th>
              <div class="expand-controls">
                <img
                  width="20"
                  height="20"
                  src="assets/icons/collapse.svg"
                  alt="collapse"
                  (click)="onCollapseAll()"
                />
                <img
                  width="20"
                  height="20"
                  src="assets/icons/expand.svg"
                  alt="expand"
                  (click)="onExpandAll()"
                />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          @for (
            group of monthlyInstalmentGroups();
            track group.id;
            let index = $index
          ) {
            @if (group.completed) {
              <tr
                class="group-header-subtotal-row"
                [class.expanded-group]="group.expanded"
              >
                @let subtotal = getSubtotal(group);

                <td class="col-first" (click)="toggleGroup(group)">
                  <span class="count"
                    >{{ subtotal.instalmentsCount }}
                    @if (subtotal.earlyCount > 0) {
                      <span class="early-chip">+{{ subtotal.earlyCount }}</span>
                    }
                  </span>
                </td>

                <td class="bold" (click)="toggleGroup(group)">
                  {{ group.title | date: 'MMM yyyy' }}
                </td>

                <td class="bold" (click)="toggleGroup(group)">
                  {{ subtotal.principal | numberFormat: '0.00' }}
                </td>

                <td class="bold" (click)="toggleGroup(group)">
                  {{ subtotal.interest | numberFormat: '0.00' }}
                </td>

                <td class="bold" (click)="toggleGroup(group)">
                  {{ subtotal.insurance | numberFormat: '0.00' }}
                </td>

                <td class="bold subtotal-total" (click)="toggleGroup(group)">
                  {{ subtotal.total | numberFormat: '0.00' }}
                </td>

                <td class="bold" (click)="toggleGroup(group)">
                  {{ subtotal.total / 2 | numberFormat: '0.00' }}
                </td>
                <td class="bold" (click)="toggleGroup(group)">
                  {{ subtotal.earlyPayment | numberFormat: '0.00' }}
                </td>
                <td class="bold" (click)="toggleGroup(group)">
                  {{ subtotal.remaining | numberFormat: '0.00' }}
                </td>

                <td (click)="toggleGroup(group)">
                  @if (index + 1 == completedMonthlyInstalmentGroupsCount()) {
                    <div class="mt-1 group-actions">
                      <button
                        type="button"
                        class="action-btn remove-early"
                        title="Elimină o rată anticipată"
                        (click)="onRemoveEarlyPayment(group, $event)"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        class="action-btn add-early"
                        title="Adaugă următoarea rată ca anticipată"
                        (click)="onAddEarlyPayment(group, $event)"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        class="action-btn dispatch-instalment"
                        title="Marchează o rată ca plătită"
                        (click)="onDispatchInstalment(group, $event)"
                      >
                        ✓
                      </button>
                    </div>
                  }
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
                  <td
                    [class.strike]="
                      !last && (row.earlyPayment || row.instalmentPayment)
                    "
                    [class.semi-bold]="
                      last && (row.earlyPayment || row.instalmentPayment)
                    "
                    [class.disabled]="!group.completed && row.disabled"
                  ></td>
                </tr>
              }
            }
          }
        </tbody>
      </table>
    </div>

    <div class="mobile-view">
      @for (
        group of monthlyInstalmentGroups();
        track group.id;
        let index = $index
      ) {
        @if (group.completed) {
          @let subtotal = getSubtotal(group);
          <div class="mobile-group-card">
            <div class="mobile-group-header">
              <div class="mobile-item-row" (click)="toggleGroup(group)">
                <div class="mobile-group-value-col">
                  <span class="mobile-group-count">
                    {{ subtotal.instalmentsCount }}
                    @if (subtotal.earlyCount > 0) {
                      <span class="early-chip">+{{ subtotal.earlyCount }}</span>
                    }
                  </span>
                  <span class="mobile-group-title">
                    {{ group.title | date: 'MMM yyyy' }}
                  </span>
                </div>

                <div class="mobile-group-value-col">
                  <span class="item-label">Anticipat</span>
                  <span class="item-value principal-value">
                    {{ subtotal.earlyPayment | numberFormat: '0.00' }}
                  </span>
                </div>
                <div class="mobile-group-value-col">
                  <span class="item-label">Rata</span>
                  <span class="item-value interest-value">
                    {{ subtotal.instalment | numberFormat: '0.00' }}
                  </span>
                </div>
                <div class="mobile-group-value-col">
                  <span class="item-label">Total</span>
                  <span class="item-value total-value">
                    {{ subtotal.total | numberFormat: '0.00' }}
                  </span>
                </div>
                <div class="mobile-group-value-col">
                  <span class="item-label">1/2</span>
                  <span class="item-value">
                    {{ subtotal.total / 2 | numberFormat: '0.00' }}
                  </span>
                </div>

                <div class="mobile-group-value-col">
                  <span class="item-label">Sold</span>
                  <span class="item-value balance-value">
                    {{ subtotal.remaining | numberFormat: '0.00' }}
                  </span>
                </div>
              </div>
              @if (index + 1 == completedMonthlyInstalmentGroupsCount()) {
                <hr class="my-1" />
                <div class="mobile-row-actions">
                  <button
                    type="button"
                    class="action-btn remove-early"
                    title="Elimină o rată anticipată"
                    (click)="onRemoveEarlyPayment(group, $event)"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    class="action-btn add-early"
                    title="Adaugă următoarea rată ca anticipată"
                    (click)="onAddEarlyPayment(group, $event)"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    class="action-btn dispatch-instalment"
                    title="Marchează o rată ca plătită"
                    (click)="onDispatchInstalment(group, $event)"
                  >
                    ✓
                  </button>
                </div>
              }
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
                      <div class="mobile-item-col">
                        <div class="checkbox-group">
                          <span class="item-index"
                            >#{{ row.instalmentId }}</span
                          >
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
                    <div class="mobile-item-col">
                      <div class="checkbox-group">
                        <span class="item-index">#{{ row.instalmentId }}</span>
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
    </div> `,
  styles: `
    :host {
      --surface: var(--theme-surface);
      --surface-soft: var(--theme-hover);
      --surface-tint: var(--theme-surface-muted);
      --border: var(--theme-border);
      --border-soft: var(--theme-border);
      --text: var(--theme-text-primary);
      --text-soft: var(--theme-text-secondary);
      --muted: var(--theme-text-secondary);
      --teal: var(--theme-accent);
      --green: var(--theme-success);
      --red: var(--theme-danger);
      --blue: var(--theme-accent);
      --violet: var(--theme-accent);
      --amber: var(--theme-warning);
      --amber-soft: var(--theme-warning-subtle);

      --selected-bg: var(--theme-accent-subtle);
      --selected-border: var(--theme-accent);
      --early-bg: var(--theme-success-subtle);
      --early-border: var(--theme-success);
      --disabled-bg: var(--theme-surface-muted);
      --disabled-border: var(--theme-border-strong);
      --group-bg: var(--theme-danger-subtle);
      --group-bg-hover: var(--theme-danger-subtle);

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
      text-align: center;
    }

    thead th.col-first {
      z-index: 50;
      background: var(--surface-soft);
    }

    thead th.col-actions {
      z-index: 45;
      background: var(--surface-soft);
    }

    tbody td.col-first {
      z-index: 40;
      background: var(--surface-soft);
    }

    tbody td.col-actions {
      z-index: 35;
      background: var(--surface);
    }

    tbody tr.group-header-subtotal-row td.col-actions {
      background: var(--group-bg);
    }

    tbody tr.row-selected td.col-actions {
      background: var(--selected-bg);
      border-bottom-color: var(--selected-border);
    }

    tbody tr.row-early td.col-actions {
      background: var(--early-bg);
      border-bottom-color: var(--early-border);
    }

    tbody tr.row-disabled td.col-actions {
      background: var(--disabled-bg);
    }

    /* Reduced width for actions column */
    th.col-actions,
    td.col-actions {
      width: 90px;
      text-align: center;
      padding: 8px 4px;
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
      background: var(--group-bg);
      transition: background 0.2s ease;
    }

    .group-header-subtotal-row td {
      padding: 15px;
      font-size: 13px;
      background: var(--group-bg);
      cursor: pointer;
    }

    .group-header-subtotal-row td.col-actions {
      cursor: default;
    }

    .group-header-subtotal-row td.col-first {
      background: var(--group-bg);
      border-left: 3px solid var(--red);
    }

    .group-header-subtotal-row:hover td,
    .group-header-subtotal-row:hover td.col-first {
      background: var(--group-bg-hover);
    }

    .group-header-subtotal-row:hover td.col-actions {
      background: var(--group-bg-hover);
    }

    /* Compact group actions */
    .group-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
    }

    /* Smaller, more compact action buttons */
    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-soft);
      font-size: 13px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      transition:
        background 100ms ease,
        border-color 100ms ease,
        color 100ms ease;
    }

    .action-btn:hover {
      background: var(--surface-tint);
    }

    .action-btn.add-early {
      color: var(--green);
      border-color: var(--early-border);
    }

    .action-btn.add-early:hover {
      background: var(--early-bg);
    }

    .action-btn.remove-early {
      color: var(--red);
      border-color: var(--red);
    }

    .action-btn.remove-early:hover {
      background: var(--theme-danger-subtle);
    }

    .action-btn.dispatch-instalment {
      color: var(--blue);
      border-color: var(--blue);
    }

    .action-btn.dispatch-instalment:hover {
      background: var(--theme-accent-subtle);
    }

    .count {
      color: var(--teal);
      font-size: 13px;
      font-weight: 700;
      background: var(--surface);
      padding: 0px 10px;
      border-radius: 20px;
      border: 1px solid var(--border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
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
      color: #94a3b8;
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
      filter: brightness(0.97);
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
        overflow: hidden;
      }

      .mobile-normal-section {
        background: var(--surface);
        border: 1px solid var(--border);
        overflow: hidden;
      }

      .mobile-group-header {
        padding: 10px;
        background: var(--group-bg);
        cursor: pointer;
        transition: background 0.2s ease;
        border-bottom: 1px solid var(--border) !important;
      }

      .mobile-group-header:active {
        background: var(--group-bg-hover);
      }

      .mobile-group-top {
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

      .mobile-group-title {
        font-weight: 700;
        font-size: 10px;
        color: var(--text);
      }

      .mobile-group-count {
        color: var(--red);
        font-size: 12px;
        font-weight: 700;
        background: var(--surface);
        padding: 0px 10px;
        border-radius: 30px;
        border: 1px solid var(--red);
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .mobile-group-values {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .mobile-group-value-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        text-align: center;
      }

      .mobile-group-value-col .item-label {
        font-size: 8px;
        color: var(--muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
        white-space: nowrap;
      }

      .mobile-group-value-col .item-value {
        font-weight: 600;
        font-size: 10px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      /* Compact mobile group actions */
      .mobile-group-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: flex-end;
      }

      .mobile-group-actions .action-btn {
        width: 20px;
        height: 20px;
        font-size: 12px;
        border-radius: 4px;
      }

      .mobile-items-list {
        display: block;
      }

      .mobile-item {
        padding: 12px;
        border-bottom: 1px solid var(--border-soft);
        background: var(--surface);
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
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
        width: 100%;
        height: 100%;
      }

      .mobile-item-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        height: 100%;
        text-align: center;
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
        color: var(--text);
      }

      .item-date {
        font-size: 11px;
        color: var(--muted);
        text-transform: capitalize;
      }

      /* Mobile row action buttons under the date */
      .mobile-row-actions {
        display: flex;
        align-items: center;
        justify-content: end;
        text-align: right;
      }

      .mobile-row-actions .action-btn {
        width: 20px;
        height: 20px;
        font-size: 13px;
        border-radius: 5px;
      }

      .item-label {
        font-size: 9px;
        color: var(--muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
        white-space: nowrap;
      }

      .item-value {
        font-weight: 600;
        font-size: 12px;
        color: var(--text);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
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

      .total-value {
        color: var(--teal);
        font-weight: 700;
      }

      .balance-value {
        color: var(--blue);
      }

      .strike {
        text-decoration: line-through;
        color: var(--muted);
      }
    }

    @media (max-width: 480px) {
      .mobile-view {
        padding: 8px 0 0 0;
        height: calc(100vh - 180px);
      }

      .mobile-group-header {
        height: auto;
        padding: 15px 5px;
        border-left: 3px solid var(--red);
      }

      .mobile-group-count {
        font-size: 10px;
        padding: 0px 5px;
      }

      .mobile-group-value-col .item-label {
        font-size: 8px;
      }

      .mobile-group-value-col .item-value {
        font-size: 10px;
      }

      /* Even more compact actions on small screens */
      .mobile-group-actions {
        gap: 10px;
      }

      .mobile-group-actions .action-btn {
        width: 20px;
        height: 20px;
        font-size: 12px;
        border-radius: 3px;
      }

      .mobile-item {
        padding: 10px;
        min-height: 60px;
      }

      .item-index {
        font-size: 11px;
      }

      .item-date {
        font-size: 10px;
      }

      .mobile-row-actions {
        gap: 10px;
      }

      .mobile-row-actions .action-btn {
        width: 20px;
        height: 20px;
        font-size: 12px;
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

      /* Compact desktop action buttons for small screens */
      .action-btn {
        width: 20px;
        height: 20px;
        font-size: 10px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      th,
      td {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LoanSimulatorBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  completedMonthlyInstalmentGroupsCount = computed(
    () =>
      this.monthlyInstalmentGroups().filter((group) => group.completed).length,
  );

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
      instalment: installment?.totalInstalment ?? 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount ?? 0,
      insurance: installment?.insuranceCost ?? 0,
      total: Calculator.sum(
        early
          .map((e) => e.principalAmount)
          .concat(installment?.totalInstalment ?? 0),
      ),
      earlyPayment: Calculator.sum(early.map((e) => e.principalAmount)),
      remaining: instalments?.at(-1)?.remainingBalance,
      count: instalments.length,
    };
  }

  onAddEarlyPayment(group: MonthlyInstalmentManager, event: Event) {
    this.store.dispatch(
      LoanActions.selectedEarlyPaymentChanged({
        values: [group.instalments?.at(-1)?.instalmentId + 1],
      }),
    );
  }

  onRemoveEarlyPayment(group: MonthlyInstalmentManager, event: Event) {
    this.store.dispatch(
      LoanActions.selectedEarlyPaymentChanged({
        values: [group.instalments?.at(-1)?.instalmentId],
      }),
    );
  }

  onDispatchInstalment(group: MonthlyInstalmentManager, event: Event) {
    this.store.dispatch(
      LoanActions.selectedInstalmentPaymentChanged({
        values: [group.instalments?.at(-1)?.instalmentId + 1],
      }),
    );
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
