import { Colors } from 'src/app/shared/styles/colors';
import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { BaseLoanRate } from '../models/base-loan-rate.model';

export namespace MortgageLoanProgressChartUtils {
  export function getChart(rates: BaseLoanRate[]): Highcharts.Options {
    if (!rates.length) return null;

    const baseRemainingUnpaidAmount = CalculatorUtil.sum([
      rates.at(0).rataCredit,
      rates.at(0).soldRestPlata,
    ]);
    const paidRates = rates.filter(
      (r) => r.isNormalPayment || r.isExtraPayment
    );
    const paidLoan = CalculatorUtil.sum(paidRates.map((r) => r.rataCredit));

    const unpaidRates = rates.filter(
      (r) => !r.isNormalPayment && !r.isExtraPayment
    );

    const unpaidLoan = CalculatorUtil.sum(unpaidRates.map((r) => r.rataCredit));

    const unpaidLoanPercent = MathUtil.percent(
      unpaidLoan,
      baseRemainingUnpaidAmount
    );

    const paidLoanPercent = MathUtil.percent(
      paidLoan,
      baseRemainingUnpaidAmount
    );

    return {
      chart: {
        type: 'pie',
        zooming: { type: 'xy' },
        panning: { enabled: true, type: 'xy' },
        panKey: 'shift',
      },
      title: { text: 'Loan Progress', align: 'left' },
      tooltip: {
        headerFormat: '',
        pointFormat: `
          <span style="color:{point.color}">\u25CF</span> <b>
          {point.name}</b><br/>
          <b>{point.y}%</b><br/>
          Amount: <b>{point.amount} RON</b><br/>
        `,
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
              name: 'Paid Loan',
              y: MathUtil.round(paidLoanPercent),
              amount: MathUtil.round(paidLoan),
              color: Colors.TEAL_400,
            },
            {
              name: 'Unpaid Loan',
              y: MathUtil.round(unpaidLoanPercent),
              amount: MathUtil.round(unpaidLoan),
              color: Colors.BS_DANGER,
            },
          ],
        },
      ] as any[],
    };
  }
}
