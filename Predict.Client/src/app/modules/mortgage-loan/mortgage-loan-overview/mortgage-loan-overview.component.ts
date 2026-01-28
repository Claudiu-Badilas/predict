import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import * as fromMortgageLoanOverview from 'src/app/modules/mortgage-loan/mortgage-loan-overview/selectors/mortgage-loan-overview.selectors';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { NumericInputComponent } from 'src/app/shared/components/numeric-input/numeric-input.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MortgageLoanOverviewBodyTableComponent } from './components/mortgage-loan-overview-body-table/mortgage-loan-overview-body-table.component';
import { MortgageLoanOverviewHeaderComponent } from './components/mortgage-loan-overview-header/mortgage-loan-overview-header.component';
import { mapInstalementSimulation } from './utils/instalment-simulation.utils';
import { InstallmentTableComponent } from './components/installment-table/installment-table.component';
import { HeaderComponent } from './components/header/header.component';

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
    HighchartWrapperComponent,
    InstallmentTableComponent,
    HeaderComponent,
  ],
  templateUrl: './mortgage-loan-overview.component.html',
  styleUrls: ['./mortgage-loan-overview.component.scss'],
})
export class MortgageLoanOverviewComponent {
  selectedRepaymentSchedule$ = this.store.select(
    fromMortgageLoanOverview.getSelectedRepaymentScheduleOverview,
  );
  monthlyInstalmentBatches = toSignal(
    this.store.select(fromMortgageLoanOverview.getMonthlyInstalmentBatches),
  );
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgageLoanOverview.getSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgageLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));
  overviewStartDate$ = this.store.select(
    fromMortgageLoanOverview.getOverviewStartDate,
  );
  instalmentSimulationTrendChart$ = this.store.select(
    fromMortgageLoanOverview.getInstalmentSimulationTrendChart,
  );

  selectedRepaymentScheduleBase = toSignal(
    this.store.select(fromMortgageLoanOverview.getSelectedRepaymentSchedule),
  );

  showTotalRow = signal(true);
  showOnlyTotalRow = signal(false);
  oldVersion = signal(true);
  monthlyAmount = signal<number>(3750);
  payments = signal<number>(1);

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
  ) {
    effect(() => {
      const [instalmentPayments, earlyPayments] = mapInstalementSimulation(
        this.selectedRepaymentScheduleBase(),
        { monthlyAmount: this.monthlyAmount(), payments: this.payments() },
      );
      this.store.dispatch(
        MortgageLoanActions.simulateInstalmentPaymentsChanged({
          selectedInstalmentPayments: instalmentPayments,
          selectedEarlyPayments: earlyPayments,
        }),
      );
    });
  }

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

  onMonthlyAmountChange(monthlyAmount: number) {
    this.monthlyAmount.set(monthlyAmount);
  }

  onPaymentsChange(payments: number) {
    this.payments.set(payments);
  }

  onOldVersion(checked: boolean) {
    this.oldVersion.set(checked);
  }
}
