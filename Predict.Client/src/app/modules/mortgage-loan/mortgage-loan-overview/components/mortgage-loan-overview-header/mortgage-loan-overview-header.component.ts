import { Component, Input } from '@angular/core';
import { OverviewLoanRate } from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'app-mortgage-loan-overview-header',
  imports: [],
  templateUrl: './mortgage-loan-overview-header.component.html',
  styleUrl: './mortgage-loan-overview-header.component.scss',
})
export class MortgageLoanOverviewHeaderComponent {
  @Input({ required: true }) overviewLoanRates: OverviewLoanRate[];

  get instalment() {
    return this.overviewLoanRates.find((r) => r.nextInterest) || null;
  }

  get advancePayment() {
    return this.overviewLoanRates.filter((r) => !r.nextInterest && r.selected);
  }

  get lastAdvancePayment() {
    return this.advancePayment.at(-1);
  }

  get totalAdvancePayment() {
    return (this.advancePayment ?? [])
      .map((a) => a.principalAmount)
      .reduce((sum, val) => sum + val, 0);
  }

  get totalSavedInterest() {
    return (this.advancePayment ?? []).reduce(
      (sum, val) => sum + (val.totalInstalment - val.principalAmount),
      0
    );
  }

  get total() {
    return (this.instalment?.totalInstalment ?? 0) + this.totalAdvancePayment;
  }
}
