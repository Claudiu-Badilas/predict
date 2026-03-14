import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromMortgageLoanDetailed from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/selectors/mortgage-loan-detailed.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { Colors } from 'src/app/shared/styles/colors';
import { HistoricalInstalmentsTableComponent } from '../historical-instalments-table/historical-instalments-table.component';

@Component({
  selector: 'p-mortgage-loan-detailed-body',
  imports: [
    CommonModule,
    HighchartWrapperComponent,
    HistoricalInstalmentsTableComponent,
  ],
  templateUrl: './mortgage-loan-detailed-body.component.html',
  styleUrl: './mortgage-loan-detailed-body.component.scss',
})
export class MortgageLoanDetailedBodyComponent {
  mortgageInterestProgressChart$ = this.store.select(
    fromMortgageLoanDetailed.getMortgageInterestProgressChart,
  );
  mortgageLoanAmountChart$ = this.store.select(
    fromMortgageLoanDetailed.getMortgageLoanAmountChart,
  );
  mortgageLoanPaymentsChart$ = this.store.select(
    fromMortgageLoanDetailed.getMortgageLoanPaymentsChart,
  );
  updatedBaseRepaymentScheduleBasedOnLatestStates$ = this.store.select(
    fromMortgageLoanDetailed.getHistoricalInstalmentPayments,
  );
  historicalInstalmentPaymentBatches = toSignal(
    this.store.select(
      fromMortgageLoanDetailed.getHistoricalInstalmentPaymentBatches,
    ),
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  colors = Colors;
}
