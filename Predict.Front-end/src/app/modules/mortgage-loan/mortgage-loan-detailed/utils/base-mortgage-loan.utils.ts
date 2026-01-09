import { DateUtils } from 'src/app/shared/utils/date.utils';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import { BaseLoanRate } from '../models/base-loan-rate.model';

export namespace BaseMortgageLoan {
  export function getUpdatedBaseRepaymentScheduleBasedOnLatestStates(
    base: RepaymentSchedule,
    repaymentSchedules: RepaymentSchedule[]
  ): BaseLoanRate[] {
    if (!base?.monthlyInstalments?.length || !repaymentSchedules?.length)
      return [];

    const findRateByDate = (date: Date) =>
      base.monthlyInstalments.find((r) =>
        JsDateUtils.isSame(r.paymentDate, date)
      );

    const sortedSchedules = repaymentSchedules
      .filter((rs) => !rs.isBasePayment)
      .slice()
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const calculatedRates: BaseLoanRate[] = [];

    sortedSchedules.forEach((schedule, index, array) => {
      if (schedule.isNormalPayment) {
        const rate = findRateByDate(schedule.date);
        if (!rate) return;

        calculatedRates.push({
          index: rate.instalmentId,
          paymentDate: rate.paymentDate,
          principalAmount: rate.principalAmount,
          interestAmount: rate.interestAmount,
          remainingBalance: rate.remainingBalance,
          isNormalPayment: true,
          isExtraPayment: false,
        } satisfies BaseLoanRate);
      }

      if (schedule.isExtraPayment) {
        const previousSchedule = array[index - 1];
        if (!previousSchedule?.monthlyInstalments?.length) return;

        const firstPrevInstalmentDate =
          previousSchedule.monthlyInstalments[0].paymentDate;
        const startRate = findRateByDate(firstPrevInstalmentDate);
        if (!startRate) return;

        const sliceStart = startRate.instalmentId - 1;
        const sliceEnd =
          previousSchedule.monthlyInstalments.length -
          schedule.monthlyInstalments.length +
          1;

        base.monthlyInstalments.slice(sliceStart, sliceEnd).forEach((rate) =>
          calculatedRates.push({
            index: rate.instalmentId,
            paymentDate: rate.paymentDate,
            principalAmount: rate.principalAmount,
            interestAmount: rate.interestAmount,
            remainingBalance: rate.remainingBalance,
            isNormalPayment: false,
            isExtraPayment: true,
          } satisfies BaseLoanRate)
        );
      }
    });

    if (!calculatedRates.length) return [];

    const lastCalculatedDate =
      calculatedRates[calculatedRates.length - 1].paymentDate;

    const lastPaidRate = base.monthlyInstalments.find((r) =>
      JsDateUtils.isSame(r.paymentDate, lastCalculatedDate)
    );

    if (!lastPaidRate) return calculatedRates;

    const unpaidRates: BaseLoanRate[] = base.monthlyInstalments
      .slice(lastPaidRate.instalmentId)
      .map(
        (rate) =>
          ({
            index: rate.instalmentId,
            paymentDate: rate.paymentDate,
            principalAmount: rate.principalAmount,
            interestAmount: rate.interestAmount,
            remainingBalance: rate.remainingBalance,
            isNormalPayment: false,
            isExtraPayment: false,
          } satisfies BaseLoanRate)
      );

    return [...calculatedRates, ...unpaidRates];
  }
}
