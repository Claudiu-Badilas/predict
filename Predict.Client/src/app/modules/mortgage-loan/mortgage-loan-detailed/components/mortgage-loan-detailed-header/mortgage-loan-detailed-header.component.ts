import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromMortgageLoanDetailed from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/selectors/mortgage-loan-detailed.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { HeaderCardComponent } from 'src/app/shared/components/header-card/header-card.component';
import {
  CardSection,
  HeaderCardInput,
} from 'src/app/shared/components/header-card/models/header-card-input.model';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';

@Component({
  selector: 'app-mortgage-loan-detailed-header',
  imports: [HeaderCardComponent],
  templateUrl: './mortgage-loan-detailed-header.component.html',
  styleUrl: './mortgage-loan-detailed-header.component.scss',
})
export class MortgageLoanDetailedHeaderComponent {
  private readonly store = inject(Store<fromMortgageLoan.MortgageLoanState>);

  readonly updatedBaseRepaymentScheduleBasedOnLatestStates = toSignal(
    this.store.select(
      fromMortgageLoanDetailed.getUpdatedBaseRepaymentScheduleBasedOnLatestStates,
    ),
    { initialValue: null },
  );

  readonly baseRepaymentSchedule = toSignal(
    this.store.select(fromMortgageLoan.getBaseRepaymentSchedule),
    { initialValue: null },
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

  headerCardInputs: Signal<HeaderCardInput[]> = computed(() => {
    return [
      {
        sections: [
          {
            label: 'Prima plata',
            value: this.firstInstalmentPaymentDate(),
            pattern: 'MMM-yyyy',
            default: '-',
            color: 'green',
          } as CardSection,
          {
            label: 'Ultima plata',
            value: this.lastInstalmentPaymentDate(),
            pattern: 'MMM-yyyy',
            default: '-',
            color: 'red',
          } as CardSection,
          {
            label: 'Perioad Ramasa',
            value: this.dateDiffYMD(),
            default: '-',
            color: 'red',
          } as CardSection,
          {
            label: 'Perioad Ramasa',
            value: this.savedDateDiffYMD(),
            default: '-',
            color: 'green',
          } as CardSection,
        ],
      } as HeaderCardInput,
    ];
  });
}
