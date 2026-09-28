import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoanStore } from 'src/app/modules/loan/stores/loan.store';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { ScrollableDirective } from 'src/app/shared/directives/scrollable.directive';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { ThemeService } from 'src/app/core/services/theme.service';
import {
  LoanSimulatorInstalment,
  MonthlyInstalmentManager,
} from '../../models/loan-simulator.model';

@Component({
  selector: 'p-loan-simulator-body-table',
  imports: [CommonModule, FormsModule, NumberFormatPipe, ScrollableDirective],
  templateUrl: './loan-simulator-body-table.component.html',
  styleUrl: './loan-simulator-body-table.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LoanSimulatorBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  completedMonthlyInstalmentGroupsCount = computed(
    () =>
      this.monthlyInstalmentGroups().filter((group) => group.completed).length,
  );

  store = inject(LoanStore);
  private readonly themeService = inject(ThemeService);

  getThemeIconPath(icon: string): string {
    return `assets/icons/${this.themeService.theme()}/${icon}.svg`;
  }

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: LoanSimulatorInstalment) {
    row.instalmentPayment = !row.instalmentPayment;
  }

  getSubtotal(group: MonthlyInstalmentManager) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      instalment: installment?.totalInstalment ?? 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount ?? 0,
      insurance: installment?.insuranceCost ?? 0,
      total: Calculator.sum(
        early
          .map((e) => e.principalAmount)
          .concat(installment?.totalInstalment ?? 0),
      ),
      earlyPayment: Calculator.sum(early.map((e) => e.principalAmount)),
      remaining: instalments?.at(-1)?.remainingBalance,
      count: instalments.length,
    };
  }

  onAddEarlyPayment(group: MonthlyInstalmentManager, event: Event) {
    this.store.toggleEarlyPayments([
      group.instalments?.at(-1)?.instalmentId + 1,
    ]);
  }

  onRemoveEarlyPayment(group: MonthlyInstalmentManager, event: Event) {
    const selectedEarlyPayments = this.store.selectedEarlyPayments();
    const instalmentId = [...group.instalments]
      .reverse()
      .find((instalment) =>
        selectedEarlyPayments.includes(instalment.instalmentId),
      )?.instalmentId;

    if (instalmentId !== undefined && instalmentId !== null) {
      return this.store.toggleEarlyPayments([instalmentId]);
    }

    const selectedNormalPayments = this.store.selectedInstalmentPayments();
    const normalInstalmentId = [...group.instalments]
      .reverse()
      .find((instalment) =>
        selectedNormalPayments.includes(instalment.instalmentId),
      )?.instalmentId;

    if (normalInstalmentId !== undefined && normalInstalmentId !== null) {
      return this.store.toggleInstalmentPayments([normalInstalmentId]);
    }
  }

  onDispatchInstalment(group: MonthlyInstalmentManager, event: Event) {
    this.store.toggleInstalmentPayments([
      group.instalments?.at(-1)?.instalmentId + 1,
    ]);
  }

  onSelectInstalmentPayment(instalment: LoanSimulatorInstalment) {
    this.store.toggleInstalmentPayments([instalment.instalmentId]);
  }

  onSelectEarlyPayment(instalment: LoanSimulatorInstalment) {
    this.store.toggleEarlyPayments([instalment.instalmentId]);
  }

  onExpandAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = true));
  }

  onCollapseAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = false));
  }

  expandState = true;

  onExpandOrCollapse() {
    this.expandState = !this.expandState;
    this.monthlyInstalmentGroups().forEach(
      (group) => (group.expanded = this.expandState),
    );
  }
}
