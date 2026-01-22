import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageLoanDetailedActions from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/actions/mortgage-loan-detailed.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MortgageLoanDetailedBodyComponent } from './components/mortgage-loan-detailed-body/mortgage-loan-detailed-body.component';
import { MortgageLoanDetailedHeaderComponent } from './components/mortgage-loan-detailed-header/mortgage-loan-detailed-header.component';

@Component({
  selector: 'app-mortgage-loan-detailed',
  imports: [
    CommonModule,
    SideBarComponent,
    ToggleButtonComponent,
    MortgageLoanDetailedHeaderComponent,
    MortgageLoanDetailedBodyComponent,
    DropdownSelectComponent,
  ],
  templateUrl: './mortgage-loan-detailed.component.html',
  styleUrl: './mortgage-loan-detailed.component.scss',
})
export class MortgageLoanDetailedComponent {
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgageLoan.getSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgageLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      }),
    );
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanDetailedActions.selectedMortgageLoanChanged({
        selected: value,
      }),
    );
  }
}
