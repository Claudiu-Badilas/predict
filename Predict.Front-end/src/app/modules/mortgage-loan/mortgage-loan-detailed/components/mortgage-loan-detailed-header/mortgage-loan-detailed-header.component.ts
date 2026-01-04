import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';

@Component({
  selector: 'app-mortgage-loan-detailed-header',
  imports: [CommonModule, HighchartWrapperComponent],
  templateUrl: './mortgage-loan-detailed-header.component.html',
  styleUrl: './mortgage-loan-detailed-header.component.scss',
})
export class MortgageLoanDetailedHeaderComponent {
  mortgageLoanProgressChart$ = this.store.select(
    fromMortgageLoan.getMortgageLoanProgressChart
  );
  mortgageInterestProgressChart$ = this.store.select(
    fromMortgageLoan.getMortgageInterestProgressChart
  );
  mortgageLoanAmountChartUtils$ = this.store.select(
    fromMortgageLoan.getMortgageLoanAmountChartUtils
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}
}
