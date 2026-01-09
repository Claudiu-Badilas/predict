import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MortgageLoanOverviewHeaderComponent } from './components/mortgage-loan-overview-header/mortgage-loan-overview-header.component';
import { OverviewLoanRate } from './models/overview-mortgage-loan.model';

@Component({
  selector: 'app-mortgage-loan-overview',
  imports: [
    CommonModule,
    SideBarComponent,
    DatePickerComponent,
    ToggleButtonComponent,
    DropdownSelectComponent,
    MortgageLoanOverviewHeaderComponent,
    CheckboxComponent,
    HighchartWrapperComponent,
  ],
  templateUrl: './mortgage-loan-overview.component.html',
  styleUrls: ['./mortgage-loan-overview.component.scss'],
})
export class MortgageLoanOverviewComponent {
  selectedRepaymentSchedule$ = this.store.select(
    fromMortgageLoan.getSelectedRepaymentScheduleOverview
  );
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgageLoan.getSelectedRepaymentScheduleName
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgageLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));
  overviewStartDate$ = this.store.select(fromMortgageLoan.getOverviewStartDate);
  overviewLoanRates$ = this.selectedRepaymentSchedule$.pipe(
    map((srs) => srs?.overviewLoanRates?.filter((r) => r.selected) ?? [])
  );
  loanRatesSimulationTrendChart$ = this.store.select(
    fromMortgageLoan.getLoanRatesSimulationTrendChart
  );

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>
  ) {}

  minDate = new Date('2025-01-01');
  maxDate = new Date('2055-12-01');

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      })
    );
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanActions.selectedMortgageLoanChanged({ selected: value })
    );
  }

  onSelectedDateChange(date: Date) {
    this.store.dispatch(MortgageLoanActions.startDateChanged({ date }));
  }

  onSelect(rata: OverviewLoanRate) {
    this.store.dispatch(
      MortgageLoanActions.selectedOverviewLoanRateChanged({
        selected: [rata.instalmentId],
      })
    );
  }
}
