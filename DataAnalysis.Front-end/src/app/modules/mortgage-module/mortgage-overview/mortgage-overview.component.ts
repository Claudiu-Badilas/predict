import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageActions from 'src/app/modules/mortgage-module/state-management/mortgage.actions';
import * as fromMortgage from 'src/app/modules/mortgage-module/state-management/mortgage.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';
import { Rata } from '../models/mortgage.model';
import { OverviewMortgageLoanHeaderComponent } from './components/overview-mortgage-loan-header/overview-mortgage-loan-header.component';

@Component({
  selector: 'app-mortgage-overview',
  imports: [
    CommonModule,
    SideBarModule,
    DatePickerComponent,
    ToggleButtonComponent,
    DropdownSelectComponent,
    OverviewMortgageLoanHeaderComponent,
    CheckboxComponent,
  ],
  templateUrl: './mortgage-overview.component.html',
  styleUrls: ['./mortgage-overview.component.scss'],
})
export class MortgageOverviewComponent {
  selectedRepaymentSchedule$ = this.store.select(
    fromMortgage.getSelectedRepaymentScheduleOverview
  );
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgage.getSelectedRepaymentScheduleName
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgage.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));
  overviewStartDate$ = this.store
    .select(fromMortgage.getOverviewStartDate)
    .pipe(map((date) => DateUtils.fromJsDateToString(date)));
  overviewLoanRates$ = this.selectedRepaymentSchedule$.pipe(
    map((srs) => srs?.overviewLoanRates?.filter((r) => r.selected) ?? [])
  );
  constructor(private readonly store: Store<fromMortgage.MortgageState>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage/${module.toLocaleLowerCase()}`,
      })
    );
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageActions.selectedMortgageLoanChanged({ selected: value })
    );
  }

  onSelectedDateChange(date: string) {
    this.store.dispatch(
      MortgageActions.startDateChanged({
        date: DateUtils.fromStringToJsDate(date),
      })
    );
  }

  onSelectAllLoanRates(value: boolean) {
    this.store.dispatch(
      MortgageActions.selectAllOverviewLoanRateChanged({ selectAll: value })
    );
  }

  onSelect(rata: Rata) {
    this.store.dispatch(
      MortgageActions.selectAllOverviewLoanRateChanged({ selectAll: undefined })
    );
    this.store.dispatch(
      MortgageActions.selectedOverviewLoanRateChanged({
        selected: [rata.nrCtr],
      })
    );
  }
}
