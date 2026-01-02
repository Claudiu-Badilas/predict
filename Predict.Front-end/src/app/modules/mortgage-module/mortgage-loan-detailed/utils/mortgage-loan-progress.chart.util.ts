import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';

export namespace MortgageLoanProgressChartUtils {
  export function getChart(
    base: RepaymentSchedule,
    latest: RepaymentSchedule
  ): Highcharts.Options {
    if (!base || !latest) return null;

    const firstBaseRate = base.rate.at(0);
    const baseRemainingUnpaidAmount = CalculatorUtil.sum([
      firstBaseRate.soldRestPlata,
      firstBaseRate.rataCredit,
    ]);

    const firstLatestRate = latest.rate.at(0);
    const latestRemainingUnpaidAmount = CalculatorUtil.sum([
      firstLatestRate.soldRestPlata,
      firstLatestRate.rataCredit,
    ]);

    const unpaidPercent = MathUtil.percent(
      latestRemainingUnpaidAmount,
      baseRemainingUnpaidAmount
    );

    const paidAmount = baseRemainingUnpaidAmount - latestRemainingUnpaidAmount;
    const paidPercent = MathUtil.percent(paidAmount, baseRemainingUnpaidAmount);

    return {
      chart: {
        type: 'pie',
        zooming: { type: 'xy' },
        panning: { enabled: true, type: 'xy' },
        panKey: 'shift',
      },
      title: { text: 'Progress', align: 'left' },
      tooltip: {
        headerFormat: '',
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> <b> ' +
          '{point.name}</b><br/>' +
          '<b>{point.y}%</b><br/> ' +
          'Amount: <b>{point.amount} RON</b><br/>',
      },
      series: [
        {
          colorByPoint: true,
          minPointSize: 10,
          innerSize: '20%',
          zMin: 0,
          borderRadius: 5,
          data: [
            {
              name: 'Paid',
              y: MathUtil.round(paidPercent),
              amount: MathUtil.round(paidAmount),
              color: 'green',
            },
            {
              name: 'Unpaid',
              y: MathUtil.round(unpaidPercent),
              amount: MathUtil.round(latestRemainingUnpaidAmount),
              color: 'red',
            },
          ],
        },
      ] as any[],
    };
  }
}
