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

  get rata() {
    return this.overviewLoanRates.find((r) => r.nextRate) || null;
  }

  get anticipate() {
    return this.overviewLoanRates.filter((r) => !r.nextRate && r.selected);
  }

  get lastAnticipat() {
    return this.anticipate.at(-1);
  }

  get totalAnticipate() {
    return (this.anticipate ?? [])
      .map((a) => a.rataCredit)
      .reduce((sum, val) => sum + val, 0);
  }

  get totalDobandaSalvata() {
    return (this.anticipate ?? []).reduce(
      (sum, val) => sum + (val.totalRata - val.rataCredit),
      0
    );
  }

  get total() {
    return (this.rata?.totalRata ?? 0) + this.totalAnticipate;
  }
}
