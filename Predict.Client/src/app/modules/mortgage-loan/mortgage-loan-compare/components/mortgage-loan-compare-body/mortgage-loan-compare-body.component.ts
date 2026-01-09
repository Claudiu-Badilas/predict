import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { RepaymentSchedule } from '../../../models/mortgage.model';
import { CompareRow } from './models/compare-row.model';

@Component({
  selector: 'mortgage-loan-compare-body',
  imports: [CommonModule],
  templateUrl: './mortgage-loan-compare-body.component.html',
  styleUrl: './mortgage-loan-compare-body.component.scss',
})
export class MortgageLoanCompareBodyComponent {
  private leftSchedule = signal<RepaymentSchedule | null>(null);
  private rightSchedule = signal<RepaymentSchedule | null>(null);

  @Input()
  set left(value: RepaymentSchedule | null) {
    this.leftSchedule.set(value);
  }

  @Input()
  set right(value: RepaymentSchedule | null) {
    this.rightSchedule.set(value);
  }

  leftName = computed(() => this.leftSchedule()?.name ?? 'Schedule A');
  rightName = computed(() => this.rightSchedule()?.name ?? 'Schedule B');

  compareRows = computed<CompareRow[]>(() => {
    const leftRates = this.leftSchedule()?.monthlyInstalments ?? [];
    const rightRates = this.rightSchedule()?.monthlyInstalments ?? [];

    return Array.from({ length: 360 }, (_, i) => i + 1).map((id) => ({
      id,
      left: leftRates.find((r) => id === r.instalmentId),
      right: rightRates.find((r) => id === r.instalmentId),
    }));
  });
}
