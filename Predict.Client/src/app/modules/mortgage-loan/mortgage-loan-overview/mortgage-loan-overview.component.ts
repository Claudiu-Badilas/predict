import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MortgageLoanOverviewBodyTableComponent } from './components/mortgage-loan-overview-body-table/mortgage-loan-overview-body-table.component';
import { MortgageLoanOverviewHeaderComponent } from './components/mortgage-loan-overview-header/mortgage-loan-overview-header.component';
import { NumericInputComponent } from 'src/app/shared/components/numeric-input/numeric-input.component';
import { mapInstalementSimulation } from './utils/instalment-simulation.utils';

@Component({
  selector: 'app-mortgage-loan-overview',
  imports: [
    CommonModule,
    SideBarComponent,
    DatePickerComponent,
    ToggleButtonComponent,
    DropdownSelectComponent,
    MortgageLoanOverviewHeaderComponent,
    MortgageLoanOverviewBodyTableComponent,
    CheckboxComponent,
    NumericInputComponent,
  ],
  templateUrl: './mortgage-loan-overview.component.html',
  styleUrls: ['./mortgage-loan-overview.component.scss'],
})
export class MortgageLoanOverviewComponent {
  selectedRepaymentSchedule$ = this.store.select(
    fromMortgageLoan.getSelectedRepaymentScheduleOverview,
  );
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgageLoan.getSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgageLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));
  overviewStartDate$ = this.store.select(fromMortgageLoan.getOverviewStartDate);

  showTotalRow = signal(true);
  showOnlyTotalRow = signal(false);

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
  ) {}

  minDate = new Date('2025-01-01');
  maxDate = new Date('2055-12-01');

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      }),
    );
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanActions.selectedMortgageLoanChanged({ selected: value }),
    );
  }

  onSelectedDateChange(date: Date) {
    this.store.dispatch(MortgageLoanActions.startDateChanged({ date }));
  }

  onShowTotalRow(checked: boolean) {
    this.showTotalRow.set(checked);
  }

  onOnlyShowTotalRow(checked: boolean) {
    this.showOnlyTotalRow.set(checked);
  }

  onTargetAmountChange(value: number) {
    this.store
      .select(fromMortgageLoan.getSelectedRepaymentSchedule)
      .pipe(first())
      .subscribe((schedule) => {
        const [instalmentPayments, earlyPayments] = mapInstalementSimulation(
          schedule,
          value,
        );
        this.store.dispatch(
          MortgageLoanActions.simulateInstalmentPaymentsChanged({
            selectedInstalmentPayments: instalmentPayments,
            selectedEarlyPayments: earlyPayments,
          }),
        );
      });
  }
}
