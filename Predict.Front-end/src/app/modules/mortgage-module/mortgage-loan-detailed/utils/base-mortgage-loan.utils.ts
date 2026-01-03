import { DateUtils } from 'src/app/shared/utils/date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';

export namespace BaseMortgageLoan {
  export function getUpdatedBaseRepaymentScheduleBasedOnLatestStates(
    base: RepaymentSchedule,
    repaymentSchedules: RepaymentSchedule[]
  ): any[] {
    const date = (d: string) => DateUtils.fromStringToJsDate(d.split('T')[0]);

    const rates = repaymentSchedules
      .filter((rs) => !rs.isBasePayment)
      .slice()
      .sort((a, b) => date(a.date).valueOf() - date(b.date).valueOf())
      .flatMap((rs, i, arr) => {
        if (rs.isNormalPayment) {
          const rate = base.rate.find((r) =>
            JsDateUtils.isSame(date(rs.date), date(r.dataPlatii))
          );
          return [
            {
              dataPlatii: date(rate.dataPlatii),
              rataCredit: rate.rataCredit,
              rataDobanda: rate.rataDobanda,
              isNormalPayment: true,
              isExtraPayment: false,
              soldRestPlata: rate.soldRestPlata,
            },
          ];
        }

        if (rs.isExtraPayment) {
          const prev = arr.at(i - 1);

          const rate = base.rate.find((r) =>
            JsDateUtils.isSame(
              date(prev.rate.at(0).dataPlatii),
              date(r.dataPlatii)
            )
          );

          return base.rate
            .slice(rate.nrCtr - 1, prev.rate.length - rs.rate.length + 1)
            .map((rate) => ({
              dataPlatii: date(rate.dataPlatii),
              rataCredit: rate.rataCredit,
              rataDobanda: rate.rataDobanda,
              isNormalPayment: false,
              isExtraPayment: true,
              soldRestPlata: rate.soldRestPlata,
            }));
        }

        return [];
      });

    if (!rates.length) return [];

    const rate = base.rate.find((r) => {
      return JsDateUtils.isSame(rates.at(-1).dataPlatii, date(r.dataPlatii));
    });

    const unpaidRates = base.rate
      .slice(rate.nrCtr, base.rate.length)
      .map((rate) => ({
        dataPlatii: date(rate.dataPlatii),
        rataCredit: rate.rataCredit,
        rataDobanda: rate.rataDobanda,
        isNormalPayment: false,
        isExtraPayment: false,
        soldRestPlata: rate.soldRestPlata,
      }));

    return [...rates, ...unpaidRates];
  }
}
