import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { BaseLoanInstalment } from '../models/base-loan-rate.model';
import { Colors } from 'src/app/shared/styles/colors';

export namespace MortgageInterestProgressChartUtils {
  export function getChart(rates: BaseLoanInstalment[]): Highcharts.Options {
    if (!rates.length) return null;

    const paidInterestRates = rates.filter((r) => r.isNormalPayment);
    const paidInterest = CalculatorUtil.sum(
      paidInterestRates.map((r) => r.interestAmount)
    );

    const savedInterestRates = rates.filter((r) => r.isExtraPayment);
    const savedInterest = CalculatorUtil.sum(
      savedInterestRates.map((r) => r.interestAmount)
    );

    const unpaidRates = rates.filter(
      (r) => !r.isNormalPayment && !r.isExtraPayment
    );
    const unpaidInterest = CalculatorUtil.sum(
      unpaidRates.map((r) => r.interestAmount)
    );
    const totalUnpaidInterest = CalculatorUtil.sum(
      rates.map((r) => r.interestAmount)
    );

    const paidInterestPercent = MathUtil.percent(
      paidInterest,
      totalUnpaidInterest
    );
    const savedInterestPercent = MathUtil.percent(
      savedInterest,
      totalUnpaidInterest
    );
    const unpaidInterestPercent = MathUtil.percent(
      unpaidInterest,
      totalUnpaidInterest
    );

    return {
      chart: {
        type: 'pie',
        zooming: { type: 'xy' },
        panning: { enabled: true, type: 'xy' },
        panKey: 'shift',
      },
      title: { text: 'Interest Progress', align: 'left' },
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
              name: 'Paid Interest',
              y: MathUtil.round(paidInterestPercent),
              amount: MathUtil.round(paidInterest),
              color: Colors.BLUE_400,
            },
            {
              name: 'Saved Interest',
              y: MathUtil.round(savedInterestPercent),
              amount: MathUtil.round(savedInterest),
              color: Colors.GREEN_400,
            },
            {
              name: 'Unpaid Interest',
              y: MathUtil.round(unpaidInterestPercent),
              amount: MathUtil.round(unpaidInterest),
              color: Colors.BS_ORANGE,
            },
          ],
        },
      ] as any[],
    };
  }
}
