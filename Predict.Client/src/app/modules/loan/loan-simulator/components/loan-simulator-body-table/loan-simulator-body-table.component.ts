import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
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

  store = inject(Store<fromLoan.LoanState>);
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
    this.store.dispatch(
      LoanActions.selectedEarlyPaymentChanged({
        values: [group.instalments?.at(-1)?.instalmentId + 1],
      }),
    );
  }

  onRemoveEarlyPayment(group: MonthlyInstalmentManager, event: Event) {
    this.store.dispatch(
      LoanActions.selectedEarlyPaymentChanged({
        values: [group.instalments?.at(-1)?.instalmentId],
      }),
    );
  }

  onDispatchInstalment(group: MonthlyInstalmentManager, event: Event) {
    this.store.dispatch(
      LoanActions.selectedInstalmentPaymentChanged({
        values: [group.instalments?.at(-1)?.instalmentId + 1],
      }),
    );
  }

  onSelectInstalmentPayment(instalment: LoanSimulatorInstalment) {
    this.store.dispatch(
      LoanActions.selectedInstalmentPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onSelectEarlyPayment(instalment: LoanSimulatorInstalment) {
    this.store.dispatch(
      LoanActions.selectedEarlyPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
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
