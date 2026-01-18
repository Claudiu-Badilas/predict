import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { OverviewLoanRate } from '../../models/overview-mortgage-loan.model';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.actions';

@Component({
  selector: 'app-mortgage-loan-overview-body-table',
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './mortgage-loan-overview-body-table.component.html',
  styleUrl: './mortgage-loan-overview-body-table.component.scss',
})
export class MortgageLoanOverviewBodyTableComponent {
  selectedRepaymentSchedule$ = this.store.select(
    fromMortgageLoan.getSelectedRepaymentScheduleOverview,
  );

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
  ) {}

  onSelect(rata: OverviewLoanRate) {
    this.store.dispatch(
      MortgageLoanActions.selectedOverviewLoanRateChanged({
        selected: [rata.instalmentId],
      }),
    );
  }
}
