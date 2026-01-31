import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MonthlyInstalmentManager } from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  monthlyInstalmentGroups = input.required<MonthlyInstalmentManager[]>();

  overviewLoanInstalments = computed(() =>
    this.monthlyInstalmentGroups()
      .flatMap((r) => r.instalments)
      .filter((r) => r.instalmentPayment || r.earlyPayment),
  );

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

  completedMontlyInstalments = computed(
    () => this.monthlyInstalmentGroups().filter((r) => r.completed)?.length,
  );

  incompletedMontlyInstalments = computed(
    () => this.monthlyInstalmentGroups().filter((r) => !r.completed)?.length,
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
}
