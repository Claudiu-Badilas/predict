import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { fromEvent, Subscription } from 'rxjs';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { OverviewLoanInstalment } from '../../models/overview-mortgage-loan.model';
import { TableColumn } from './model/table-body.model';

@Component({
  selector: 'app-mortgage-loan-overview-body-table',
  imports: [CommonModule, FormsModule, CheckboxComponent, NumberFormatPipe],
  templateUrl: './mortgage-loan-overview-body-table.component.html',
  styleUrl: './mortgage-loan-overview-body-table.component.scss',
})
export class MortgageLoanOverviewBodyTableComponent
  implements OnInit, OnDestroy
{
  showTotalRow = input.required<boolean>();

  selectedRepaymentSchedule$ = this.store.select(
    fromMortgageLoan.getSelectedRepaymentScheduleOverview,
  );

  @ViewChild('menuContainer', { static: false }) menuContainer!: ElementRef;
  @ViewChild('menuDropdown', { static: false }) menuDropdown!: ElementRef;

  isMenuOpen = false;

  columns: TableColumn[] = [
    {
      key: 'administrationFee',
      label: 'Comision Administrare',
      visible: false,
    },
    { key: 'insuranceCost', label: 'Costuri Asigurare', visible: false },
    { key: 'managementFee', label: 'Comision Gestiune', visible: false },
    {
      key: 'recalculatedInterest',
      label: 'Dobândă Recalculată',
      visible: false,
    },
    { key: 'remainingBalance', label: 'Sold Rest Plată', visible: false },
  ];

  private clickSubscription!: Subscription;

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
    private elRef: ElementRef,
  ) {}

  ngOnInit() {
    this.setupClickOutsideListener();
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }
  }

  setupClickOutsideListener() {
    this.clickSubscription = fromEvent(document, 'click').subscribe(
      (event: Event) => {
        const target = event.target as HTMLElement;

        if (this.isMenuOpen) {
          const menuContainer = this.menuContainer?.nativeElement;
          const menuDropdown = this.menuDropdown?.nativeElement;

          const isClickInsideMenu = menuContainer?.contains(target);
          const isClickInsideDropdown = menuDropdown?.contains(target);

          if (!isClickInsideMenu && !isClickInsideDropdown) {
            this.closeMenu();
          }
        }
      },
    );
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen && this.menuDropdown) {
      setTimeout(() => {
        this.positionMenuDropdown();
      }, 0);
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  positionMenuDropdown() {
    if (!this.menuDropdown) return;

    const dropdown = this.menuDropdown.nativeElement;
    const viewportHeight = window.innerHeight;
    const dropdownRect = dropdown.getBoundingClientRect();

    if (dropdownRect.bottom > viewportHeight) {
      dropdown.style.top = 'auto';
      dropdown.style.bottom = '100%';
    } else {
      dropdown.style.top = '100%';
      dropdown.style.bottom = 'auto';
    }
  }

  isVisible(key: string): boolean {
    return this.columns.find((c) => c.key === key)?.visible ?? false;
  }

  getColumnLabel(key: string): string {
    return this.columns.find((c) => c.key === key)?.label ?? key;
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
