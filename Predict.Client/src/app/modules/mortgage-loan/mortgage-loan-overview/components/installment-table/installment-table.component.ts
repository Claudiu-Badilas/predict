import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  input,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  MonthlyInstalmentManager,
  OverviewLoanInstalment,
} from '../../models/overview-mortgage-loan.model';
import {
  ColumnConfig,
  DEFAULT_COLUMN_CONFIGS,
} from './models/column-config.model';

@Component({
  selector: 'app-installment-table',
  imports: [CommonModule, FormsModule, NumberFormatPipe, CheckboxComponent],
  templateUrl: './installment-table.component.html',
  styleUrls: ['./installment-table.component.scss'],
})
export class InstallmentTableComponent {
  showOnlyTotalRow = input.required<boolean>();
  groups = input<MonthlyInstalmentManager[]>([]);
  @ViewChild('menuContainer') menuContainer!: ElementRef;

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
  ) {}

  isMenuOpen = false;
  columns: ColumnConfig[] = DEFAULT_COLUMN_CONFIGS;

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: OverviewLoanInstalment) {
    row.instalmentPayment = !row.instalmentPayment;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.isMenuOpen &&
      this.menuContainer &&
      !this.menuContainer.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }

  isColumnVisible(key: ColumnConfig['key']): boolean {
    const column = this.columns.find((col) => col.key === key);
    return column ? column.visible : true;
  }

  getSelectedRows(group: MonthlyInstalmentManager): OverviewLoanInstalment[] {
    return group.instalments.filter((r) => r.instalmentPayment);
  }

  getSubtotal(group: MonthlyInstalmentManager) {
    const selected = this.getSelectedRows(group);

    const sum = (v: number | null) => v ?? 0;

    return {
      principal: selected.reduce((s, r) => s + sum(r.principalAmount), 0),
      interest: selected.reduce((s, r) => s + sum(r.interestAmount), 0),
      administrationFee: selected.reduce(
        (s, r) => s + sum(r.administrationFee),
        0,
      ),
      insurance: selected.reduce((s, r) => s + sum(r.insuranceCost), 0),
      managementFee: selected.reduce((s, r) => s + sum(r.managementFee), 0),
      recalculatedInterest: selected.reduce(
        (s, r) => s + sum(r.recalculatedInterest),
        0,
      ),
      total: selected.reduce((s, r) => s + sum(r.totalInstalment), 0),
      restant: selected.reduce((s, r) => s + sum(r.remainingBalance), 0),
      count: selected.length,
    };
  }

  onSelectInstalmentPayment(rata: OverviewLoanInstalment) {
    this.store.dispatch(
      MortgageLoanActions.selectedInstalmentPaymentChanged({
        values: [rata.instalmentId],
      }),
    );
  }

  onSelectEarlyPayment(rata: OverviewLoanInstalment) {
    this.store.dispatch(
      MortgageLoanActions.selectedEarlyPaymentChanged({
        values: [rata.instalmentId],
      }),
    );
  }
}
