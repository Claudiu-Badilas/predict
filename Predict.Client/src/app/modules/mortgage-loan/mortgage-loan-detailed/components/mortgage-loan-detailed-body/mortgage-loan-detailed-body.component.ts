import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromMortgageLoanDetailed from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/selectors/mortgage-loan-detailed.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-mortgage-loan-detailed-body',
  imports: [
    CommonModule,
    HighchartWrapperComponent,
    NumberFormatPipe,
    TableComponent,
  ],
  templateUrl: './mortgage-loan-detailed-body.component.html',
  styleUrl: './mortgage-loan-detailed-body.component.scss',
})
export class MortgageLoanDetailedBodyComponent {
  mortgageLoanProgressChart$ = this.store.select(
    fromMortgageLoanDetailed.getMortgageLoanProgressChart,
  );
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
    fromMortgageLoanDetailed.getHistocialInstalmentPayments,
  );
  histocialInstalmentPaymentBatches = toSignal(
    this.store.select(
      fromMortgageLoanDetailed.getHistocialInstalmentPaymentBatches,
    ),
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  colors = Colors;
}
