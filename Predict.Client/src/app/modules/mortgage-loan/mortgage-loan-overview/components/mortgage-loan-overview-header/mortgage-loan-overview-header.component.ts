import { Component, computed, input } from '@angular/core';
import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { OverviewLoanInstalment } from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'app-mortgage-loan-overview-header',
  imports: [],
  templateUrl: './mortgage-loan-overview-header.component.html',
  styleUrl: './mortgage-loan-overview-header.component.scss',
})
export class MortgageLoanOverviewHeaderComponent {
  overviewLoanInstalments = input.required<OverviewLoanInstalment[]>();

  instalmentPayments = computed(() =>
    this.overviewLoanInstalments().filter((r) => r.instalmentPayment),
  );

  totalInstalmentPayments = computed(() =>
    CalculatorUtil.sum(this.instalmentPayments().map((a) => a.totalInstalment)),
  );

  earlyPayments = computed(() =>
    this.overviewLoanInstalments().filter((r) => r.earlyPayment),
  );

  lastEarlyPayment = computed(() => this.earlyPayments().at(-1));

  totalEarlyPayment = computed(() =>
    CalculatorUtil.sum(this.earlyPayments().map((a) => a.principalAmount)),
  );

  totalSavedInterest = computed(() =>
    CalculatorUtil.sum(
      this.earlyPayments().map((a) => a.totalInstalment - a.principalAmount),
    ),
  );

  totalPayment = computed(() =>
    CalculatorUtil.sum([
      this.totalInstalmentPayments(),
      this.totalEarlyPayment(),
    ]),
  );

  initialRemainingBalance = computed(() => {
    const firstInstalment = this.overviewLoanInstalments()[0];
    return CalculatorUtil.sum([
      firstInstalment?.remainingBalance,
      firstInstalment?.principalAmount,
    ]);
  });
}
