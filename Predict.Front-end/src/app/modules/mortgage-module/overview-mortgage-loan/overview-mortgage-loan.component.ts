import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageLoanActions from 'src/app/modules/mortgage-module/state-management/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-module/state-management/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { Rata } from '../models/mortgage.model';
import { OverviewMortgageLoanHeaderComponent } from './components/overview-mortgage-loan-header/overview-mortgage-loan-header.component';

@Component({
  selector: 'app-overview-mortgage-loan',
  imports: [
    CommonModule,
    SideBarModule,
    DatePickerComponent,
    ToggleButtonComponent,
    DropdownSelectComponent,
    OverviewMortgageLoanHeaderComponent,
    CheckboxComponent,
  ],
  templateUrl: './overview-mortgage-loan.component.html',
  styleUrls: ['./overview-mortgage-loan.component.scss'],
})
export class OverviewMortgageLoanComponent {
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

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>
  ) {}

  minDate = new Date('2025-12-01');
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

  onSelectAllLoanRates(value: boolean) {
    this.store.dispatch(
      MortgageLoanActions.selectAllOverviewLoanRateChanged({ selectAll: value })
    );
  }

  onSelect(rata: Rata) {
    this.store.dispatch(
      MortgageLoanActions.selectAllOverviewLoanRateChanged({
        selectAll: undefined,
      })
    );
    this.store.dispatch(
      MortgageLoanActions.selectedOverviewLoanRateChanged({
        selected: [rata.nrCtr],
      })
    );
  }
}
