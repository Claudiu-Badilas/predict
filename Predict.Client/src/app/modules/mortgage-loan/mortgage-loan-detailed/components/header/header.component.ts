import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromMortgageLoanDetailed from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/selectors/mortgage-loan-detailed.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';

@Component({
  selector: 'app-header',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly store = inject(Store<fromMortgageLoan.MortgageLoanState>);

  readonly updatedBaseRepaymentScheduleBasedOnLatestStates = toSignal(
    this.store.select(fromMortgageLoanDetailed.getHistocialInstalmentPayments),
    { initialValue: null },
  );
  readonly baseRepaymentSchedule = toSignal(
    this.store.select(fromMortgageLoan.getBaseRepaymentSchedule),
    { initialValue: null },
  );
  readonly histocialInstalmentPaymentBatches = toSignal(
    this.store.select(
      fromMortgageLoanDetailed.getHistocialInstalmentPaymentBatches,
    ),
    { initialValue: [] },
  );

  readonly paidPrincipal = computed(() =>
    Calculator.sum(
      this.updatedBaseRepaymentScheduleBasedOnLatestStates()
        .filter((s) => s.earlyPayment || s.instalmentPayment)
        .map((s) => s.principalAmount),
    ),
  );
  readonly paidPrincipalPercent = computed(() => {
    const total = Calculator.sum(
      this.updatedBaseRepaymentScheduleBasedOnLatestStates().map(
        (s) => s.principalAmount,
      ),
    );

    return MathUtil.percent(this.paidPrincipal(), total);
  });

  readonly paidIntrest = computed(() =>
    Calculator.sum(
      this.updatedBaseRepaymentScheduleBasedOnLatestStates()
        .filter((s) => s.instalmentPayment)
        .map((s) => s.interestAmount),
    ),
  );
  readonly paidIntrestPercent = computed(() => {
    const total = Calculator.sum(
      this.updatedBaseRepaymentScheduleBasedOnLatestStates().map(
        (s) => s.interestAmount,
      ),
    );

    return MathUtil.percent(this.paidIntrest(), total);
  });

  readonly paidInsurance = computed(() =>
    Calculator.sum(
      this.updatedBaseRepaymentScheduleBasedOnLatestStates()
        .filter((s) => s.instalmentPayment)
        .map((s) => s.insuranceCost),
    ),
  );

  readonly totalPaid = computed(() =>
    Calculator.sum([
      this.paidPrincipal(),
      this.paidIntrest(),
      this.paidInsurance(),
    ]),
  );

  readonly paidInstalments = computed(() =>
    Calculator.sum(
      this.histocialInstalmentPaymentBatches()
        .filter((s) => s.completed)
        .map((s) => s.instalments.length),
    ),
  );

  readonly unpaidInstalments = computed(() =>
    Calculator.sum(
      this.histocialInstalmentPaymentBatches().map((s) => s.instalments.length),
    ),
  );

  readonly firstInstalmentPaymentDate = computed(() => {
    const schedule = this.baseRepaymentSchedule();
    return schedule?.monthlyInstalments?.at(0)?.paymentDate ?? null;
  });

  readonly lastInstalmentPaymentDate = computed(() => {
    const schedule = this.updatedBaseRepaymentScheduleBasedOnLatestStates();
    return schedule?.at(-1)?.paymentDate ?? null;
  });

  readonly lastBaseInstalmentPaymentDate = computed(() => {
    const schedule = this.baseRepaymentSchedule();
    return schedule?.monthlyInstalments?.at(-1)?.paymentDate ?? null;
  });

  readonly dateDiffYMD = computed(() => {
    const d1 = this.firstInstalmentPaymentDate();
    const d2 = this.lastInstalmentPaymentDate();
    return JsDateUtils.dateDiffYMD(d1, d2);
  });

  readonly savedDateDiffYMD = computed(() => {
    const d1 = this.lastInstalmentPaymentDate();
    const d2 = this.lastBaseInstalmentPaymentDate();
    return JsDateUtils.dateDiffYMD(d1, d2);
  });
}
