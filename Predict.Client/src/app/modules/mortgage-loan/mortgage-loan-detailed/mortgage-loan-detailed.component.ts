import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageLoanDetailedActions from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/actions/mortgage-loan-detailed.actions';
import * as fromMortgageLoanDetailed from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/selectors/mortgage-loan-detailed.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { MortgageLoanDetailedBodyComponent } from './components/mortgage-loan-detailed-body/mortgage-loan-detailed-body.component';
import { MortgageLoanDetailedHeaderComponent } from './components/mortgage-loan-detailed-header/mortgage-loan-detailed-header.component';

@Component({
  selector: 'p-mortgage-loan-detailed',
  imports: [
    CommonModule,
    MortgageLoanDetailedHeaderComponent,
    MortgageLoanDetailedBodyComponent,
    DropdownSelectComponent,
  ],
  templateUrl: './mortgage-loan-detailed.component.html',
  styleUrl: './mortgage-loan-detailed.component.scss',
})
export class MortgageLoanDetailedComponent {
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgageLoanDetailed.getDetailedSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgageLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  onDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanDetailedActions.selectedMortgageLoanChanged({
        selected: value,
      }),
    );
  }
}
