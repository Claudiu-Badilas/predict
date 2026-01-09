import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { BaseLoanRate } from '../models/base-loan-rate.model';
import { Colors } from 'src/app/shared/styles/colors';

export namespace MortgageLoanAmountChartUtils {
  export function getChart(rates: BaseLoanRate[]): Highcharts.Options {
    if (!rates.length) return null;

    const paidRates = rates.filter(
      (r) => r.isNormalPayment || r.isExtraPayment
    );
    const paidLoan = CalculatorUtil.sum(
      paidRates.map((r) => r.principalAmount)
    );

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
    const unpaidLoan = CalculatorUtil.sum(
      unpaidRates.map((r) => r.principalAmount)
    );

    return {
      chart: { type: 'bar' },
      title: { text: 'Amounts', align: 'left' },
      xAxis: {
        categories: [
          'Paid Loan',
          'Paid Interest',
          'Saved Interest',
          'Unpaid Interest',
          'Unpaid Loan',
        ],
        gridLineWidth: 1,
        lineWidth: 0,
      },
      yAxis: { min: 0, gridLineWidth: 0 },
      tooltip: { valueSuffix: ' RON' },
      plotOptions: {
        bar: {
          borderRadius: '15%',
          dataLabels: { enabled: true },
          groupPadding: 0.1,
        },
      },
      series: [
        {
          colorByPoint: true,
          name: 'Loan Status',
          showInLegend: false,
          data: [
            { y: MathUtil.round(paidLoan), color: Colors.TEAL_400 },
            { y: MathUtil.round(paidInterest), color: Colors.BLUE_400 },
            { y: MathUtil.round(savedInterest), color: Colors.GREEN_400 },
            { y: MathUtil.round(unpaidInterest), color: Colors.BS_ORANGE },
            { y: MathUtil.round(unpaidLoan), color: Colors.BS_DANGER },
          ],
        },
      ] as any[],
    };
  }
}
