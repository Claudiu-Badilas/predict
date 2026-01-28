import { Component, computed, input, Signal } from '@angular/core';
import { HeaderCardComponent } from 'src/app/shared/components/header-card/header-card.component';
import {
  CardSection,
  HeaderCardInput,
} from 'src/app/shared/components/header-card/models/header-card-input.model';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { OverviewLoanInstalment } from '../../models/overview-mortgage-loan.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  imports: [HeaderCardComponent, CommonModule, NumberFormatPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  overviewLoanInstalments = input.required<OverviewLoanInstalment[]>();

  payments = computed(() =>
    this.overviewLoanInstalments().filter(
      (r) => r.instalmentPayment || r.earlyPayment,
    ),
  );

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
            label: 'Rata',
            value: this.totalInstalmentPayments(),
            default: '0.00',
            color: null,
          } as CardSection,
          {
            label: 'Plata Anticipata',
            value: this.totalEarlyPayment(),
            default: '0.00',
            color: null,
          } as CardSection,
          {
            label: 'Total Plata',
            value: [
              NumberFormatPipe.numberFormat(this.totalPayment()) || '0.00',
              NumberFormatPipe.numberFormat(this.totalPayment() / 2) || '0.00',
            ].join(' - '),
            default: '0.00',
            color: 'red',
          } as CardSection,
        ],
      } as HeaderCardInput,
      {
        sections: [
          {
            label: 'Sold Initial',
            value: this.initialRemainingBalance(),
            default: '0.00',
            color: 'red',
          } as CardSection,
          {
            label: 'Sold Restant',
            value: this.payments()?.at(-1)?.remainingBalance,
            default: '0.00',
            color: 'green',
          } as CardSection,
          {
            label: 'Costuri Economisite',
            value: this.totalSavedInterest(),
            default: '0.00',
            color: 'green',
          } as CardSection,
        ],
      } as HeaderCardInput,
    ];
  });
}
