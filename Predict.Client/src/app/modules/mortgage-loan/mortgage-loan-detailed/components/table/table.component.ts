import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { HistocialInstalmentPaymentBatch } from '../../models/base-loan-rate.model';

@Component({
  selector: 'app-table',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  showOnlyTotalRow = input.required<boolean>();
  monthlyInstalmentGroups = input<HistocialInstalmentPaymentBatch[]>([]);

  isMenuOpen = false;

  toggleGroup(group: HistocialInstalmentPaymentBatch) {
    group.expanded = !group.expanded;
  }

  getSubtotal(group: HistocialInstalmentPaymentBatch) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment.interestAmount,
      insuranceCost: installment.insuranceCost,
      total: Calculator.sum(
        instalments
          .map((e) => e.principalAmount)
          .concat([installment.interestAmount, installment.insuranceCost]),
      ),
      remainingBalance: early?.at(-1)?.remainingBalance,
      count: instalments.length,
    };
  }
}
