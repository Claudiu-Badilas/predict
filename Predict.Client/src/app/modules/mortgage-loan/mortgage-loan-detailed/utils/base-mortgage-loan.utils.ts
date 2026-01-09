import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import { BaseLoanInstalment } from '../models/base-loan-rate.model';

export namespace BaseMortgageLoan {
  export function getUpdatedBaseRepaymentScheduleBasedOnLatestStates(
    base: RepaymentSchedule,
    repaymentSchedules: RepaymentSchedule[]
  ): BaseLoanInstalment[] {
    if (!base?.monthlyInstalments?.length || !repaymentSchedules?.length)
      return [];

    const findInstalmentByDate = (date: Date) =>
      base.monthlyInstalments.find((r) =>
        JsDateUtils.isSame(r.paymentDate, date)
      );

    const sortedSchedules = repaymentSchedules
      .filter((rs) => !rs.isBasePayment)
      .slice()
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const calculatedBaseLoanInstalments: BaseLoanInstalment[] = [];

    sortedSchedules.forEach((schedule, index, array) => {
      if (schedule.isNormalPayment) {
        const rate = findInstalmentByDate(schedule.date);
        if (!rate) return;

        calculatedBaseLoanInstalments.push({
          index: rate.instalmentId,
          paymentDate: rate.paymentDate,
          principalAmount: rate.principalAmount,
          interestAmount: rate.interestAmount,
          remainingBalance: rate.remainingBalance,
          isNormalPayment: true,
          isExtraPayment: false,
        } satisfies BaseLoanInstalment);
      }

      if (schedule.isExtraPayment) {
        const previousSchedule = array[index - 1];
        if (!previousSchedule?.monthlyInstalments?.length) return;

        const firstPrevInstalmentDate =
          previousSchedule.monthlyInstalments[0].paymentDate;
        const startRate = findInstalmentByDate(firstPrevInstalmentDate);
        if (!startRate) return;

        const sliceStart = startRate.instalmentId - 1;
        const sliceEnd =
          previousSchedule.monthlyInstalments.length -
          schedule.monthlyInstalments.length +
          1;

        base.monthlyInstalments.slice(sliceStart, sliceEnd).forEach((rate) =>
          calculatedBaseLoanInstalments.push({
            index: rate.instalmentId,
            paymentDate: rate.paymentDate,
            principalAmount: rate.principalAmount,
            interestAmount: rate.interestAmount,
            remainingBalance: rate.remainingBalance,
            isNormalPayment: false,
            isExtraPayment: true,
          } satisfies BaseLoanInstalment)
        );
      }
    });

    if (!calculatedBaseLoanInstalments.length) return [];

    const lastCalculatedDate =
      calculatedBaseLoanInstalments[calculatedBaseLoanInstalments.length - 1]
        .paymentDate;

    const lastPaidRate = base.monthlyInstalments.find((r) =>
      JsDateUtils.isSame(r.paymentDate, lastCalculatedDate)
    );

    if (!lastPaidRate) return calculatedBaseLoanInstalments;

    const unpaidBaseLoanInstalments: BaseLoanInstalment[] =
      base.monthlyInstalments.slice(lastPaidRate.instalmentId).map(
        (rate) =>
          ({
            index: rate.instalmentId,
            paymentDate: rate.paymentDate,
            principalAmount: rate.principalAmount,
            interestAmount: rate.interestAmount,
            remainingBalance: rate.remainingBalance,
            isNormalPayment: false,
            isExtraPayment: false,
          } satisfies BaseLoanInstalment)
      );

    return [...calculatedBaseLoanInstalments, ...unpaidBaseLoanInstalments];
  }
}
