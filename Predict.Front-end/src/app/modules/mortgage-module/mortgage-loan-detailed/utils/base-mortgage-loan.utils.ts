import { DateUtils } from 'src/app/shared/utils/date.utils';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import { BaseLoanRate } from '../models/base-loan-rate.model';

export namespace BaseMortgageLoan {
  export function getUpdatedBaseRepaymentScheduleBasedOnLatestStates(
    base: RepaymentSchedule,
    repaymentSchedules: RepaymentSchedule[]
  ): BaseLoanRate[] {
    if (!base?.rate?.length || !repaymentSchedules?.length) return [];

    const toDate = (d: string | Date) =>
      d instanceof Date ? d : DateUtils.fromStringToJsDate(d.split('T')[0]);

    const sameDate = (a: string | Date, b: string | Date) =>
      JsDateUtils.isSame(toDate(a), toDate(b));

    const findRateByDate = (date: string | Date) =>
      base.rate.find((r) => sameDate(r.dataPlatii, date));

    const sortedSchedules = repaymentSchedules
      .filter((rs) => !rs.isBasePayment)
      .slice()
      .sort((a, b) => toDate(a.date).valueOf() - toDate(b.date).valueOf());

    const calculatedRates: BaseLoanRate[] = [];

    sortedSchedules.forEach((schedule, index, array) => {
      if (schedule.isNormalPayment) {
        const rate = findRateByDate(schedule.date);
        if (!rate) return;

        calculatedRates.push({
          index: rate.nrCtr,
          dataPlatii: toDate(rate.dataPlatii),
          rataCredit: rate.rataCredit,
          rataDobanda: rate.rataDobanda,
          soldRestPlata: rate.soldRestPlata,
          isNormalPayment: true,
          isExtraPayment: false,
        });
      }

      if (schedule.isExtraPayment) {
        const previousSchedule = array[index - 1];
        if (!previousSchedule?.rate?.length) return;

        const firstPrevRateDate = previousSchedule.rate[0].dataPlatii;
        const startRate = findRateByDate(firstPrevRateDate);
        if (!startRate) return;

        const sliceStart = startRate.nrCtr - 1;
        const sliceEnd =
          previousSchedule.rate.length - schedule.rate.length + 1;

        base.rate
          .slice(sliceStart, sliceEnd)
          .forEach((rate) =>
            calculatedRates.push({
              index: rate.nrCtr,
              dataPlatii: toDate(rate.dataPlatii),
              rataCredit: rate.rataCredit,
              rataDobanda: rate.rataDobanda,
              soldRestPlata: rate.soldRestPlata,
              isNormalPayment: false,
              isExtraPayment: true,
            })
          );
      }
    });

    if (!calculatedRates.length) return [];

    const lastCalculatedDate =
      calculatedRates[calculatedRates.length - 1].dataPlatii;

    const lastPaidRate = base.rate.find((r) =>
      sameDate(r.dataPlatii, lastCalculatedDate)
    );

    if (!lastPaidRate) return calculatedRates;

    const unpaidRates: BaseLoanRate[] = base.rate
      .slice(lastPaidRate.nrCtr)
      .map((rate) => ({
        index: rate.nrCtr,
        dataPlatii: toDate(rate.dataPlatii),
        rataCredit: rate.rataCredit,
        rataDobanda: rate.rataDobanda,
        soldRestPlata: rate.soldRestPlata,
        isNormalPayment: false,
        isExtraPayment: false,
      }));

    return [...calculatedRates, ...unpaidRates];
  }
}
