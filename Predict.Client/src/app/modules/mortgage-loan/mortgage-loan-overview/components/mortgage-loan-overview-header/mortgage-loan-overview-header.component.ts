import { Component, computed, input, Signal } from '@angular/core';
import { HeaderCardComponent } from 'src/app/shared/components/header-card/header-card.component';
import {
  CardSection,
  HeaderCardInput,
} from 'src/app/shared/components/header-card/models/header-card-input.model';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { OverviewLoanInstalment } from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'app-mortgage-loan-overview-header',
  imports: [HeaderCardComponent],
  templateUrl: './mortgage-loan-overview-header.component.html',
  styleUrl: './mortgage-loan-overview-header.component.scss',
})
export class MortgageLoanOverviewHeaderComponent {
  overviewLoanInstalments = input.required<OverviewLoanInstalment[]>();

  instalmentPayments = computed(() =>
    this.overviewLoanInstalments().filter((r) => r.instalmentPayment),
  );

  totalInstalmentPayments = computed(() =>
    Calculator.sum(this.instalmentPayments().map((a) => a.totalInstalment)),
  );

  earlyPayments = computed(() =>
    this.overviewLoanInstalments().filter((r) => r.earlyPayment),
  );

  lastEarlyPayment = computed(() => this.earlyPayments().at(-1));

  totalEarlyPayment = computed(() =>
    Calculator.sum(this.earlyPayments().map((a) => a.principalAmount)),
  );

  totalSavedInterest = computed(() =>
    Calculator.sum(
      this.earlyPayments().map((a) => a.totalInstalment - a.principalAmount),
    ),
  );

  totalPayment = computed(() =>
    Calculator.sum([this.totalInstalmentPayments(), this.totalEarlyPayment()]),
  );

  initialRemainingBalance = computed(() => {
    const firstInstalment = this.overviewLoanInstalments()[0];
    return Calculator.sum([
      firstInstalment?.remainingBalance,
      firstInstalment?.principalAmount,
    ]);
  });

  headerCardInputs: Signal<HeaderCardInput[]> = computed(() => {
    return [
      {
        sections: [
          {
            label: 'Total Rata',
            value: this.totalInstalmentPayments(),
            default: '0.00',
            color: null,
          } as CardSection,
          {
            label: 'Total Plata Anticipata',
            value: this.totalEarlyPayment(),
            default: '0.00',
            color: null,
          } as CardSection,
        ],
      } as HeaderCardInput,
      {
        sections: [
          {
            label: 'Dobândă Salvată',
            value: this.totalSavedInterest(),
            default: '0.00',
            color: 'green',
          } as CardSection,
          {
            label: 'Total de Plata',
            value: [
              NumberFormatPipe.numberFormat(this.totalPayment()) || '0.00',
              NumberFormatPipe.numberFormat(this.totalPayment() / 2) || '0.00',
            ].join(' ➤ '),
            default: '0.00',
            color: 'red',
          } as CardSection,
        ],
      } as HeaderCardInput,
      {
        sections: [
          {
            label: 'Sold Inainte Plata',
            value: this.initialRemainingBalance(),
            default: '0.00',
            color: 'red',
          } as CardSection,
          {
            label: 'Sold dupa Plata',
            value: this.lastEarlyPayment()?.remainingBalance,
            default: '0.00',
            color: 'green',
          } as CardSection,
        ],
      } as HeaderCardInput,
    ];
  });
}
