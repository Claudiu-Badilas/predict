import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { OverviewLoanRate } from '../../models/mortgage-loan-overview.model';

@Component({
  selector: 'app-overview-mortgage-loan-header',
  imports: [CommonModule],
  templateUrl: './overview-mortgage-loan-header.component.html',
  styleUrls: ['./overview-mortgage-loan-header.component.scss'],
})
export class OverviewMortgageLoanHeaderComponent {
  @Input({ required: true }) overviewLoanRates: OverviewLoanRate[];

  get anySelected(): boolean {
    return this.overviewLoanRates.length > 0;
  }

  get rata() {
    return this.overviewLoanRates[0] || null;
  }

  get anticipate() {
    return this.overviewLoanRates.slice(1);
  }

  get lastAnticipate() {
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
