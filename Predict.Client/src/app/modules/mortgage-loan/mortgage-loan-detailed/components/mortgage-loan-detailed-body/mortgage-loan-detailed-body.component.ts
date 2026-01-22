import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';

@Component({
  selector: 'app-mortgage-loan-detailed-body',
  imports: [CommonModule, HighchartWrapperComponent, NumberFormatPipe],
  templateUrl: './mortgage-loan-detailed-body.component.html',
  styleUrl: './mortgage-loan-detailed-body.component.scss',
})
export class MortgageLoanDetailedBodyComponent {
  mortgageLoanProgressChart$ = this.store.select(
    fromMortgageLoan.getMortgageLoanProgressChart,
  );
  mortgageInterestProgressChart$ = this.store.select(
    fromMortgageLoan.getMortgageInterestProgressChart,
  );
  mortgageLoanAmountChart$ = this.store.select(
    fromMortgageLoan.getMortgageLoanAmountChart,
  );
  mortgageLoanPaymentsChart$ = this.store.select(
    fromMortgageLoan.getMortgageLoanPaymentsChart,
  );
  updatedBaseRepaymentScheduleBasedOnLatestStates$ = this.store.select(
    fromMortgageLoan.getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  colors = Colors;
}
