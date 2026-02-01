import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistocialInstalmentPayment } from '../../models/base-loan-rate.model';
import { Colors } from 'src/app/shared/styles/colors';

export namespace MortgageLoanAmountChartUtils {
  export function getChart(
    rates: HistocialInstalmentPayment[],
  ): Highcharts.Options {
    if (!rates.length) return null;

    const paidRates = rates.filter(
      (r) => r.isNormalPayment || r.isExtraPayment,
    );
    const paidLoan = Calculator.sum(paidRates.map((r) => r.principalAmount));

    const paidInterestRates = rates.filter((r) => r.isNormalPayment);
    const paidInterest = Calculator.sum(
      paidInterestRates.map((r) => r.interestAmount),
    );

    const savedInterestRates = rates.filter((r) => r.isExtraPayment);
    const savedInterest = Calculator.sum(
      savedInterestRates.map((r) => r.interestAmount),
    );

    const unpaidRates = rates.filter(
      (r) => !r.isNormalPayment && !r.isExtraPayment,
    );
    const unpaidInterest = Calculator.sum(
      unpaidRates.map((r) => r.interestAmount),
    );
    const unpaidLoan = Calculator.sum(
      unpaidRates.map((r) => r.principalAmount),
    );

    return {
      chart: { type: 'bar' },
      title: { text: 'Total Plata', align: 'left' },
      xAxis: {
        categories: [
          'Principal Platiti',
          'Principal Neplatit',
          'Dobanda Platita',
          'Dobanda Salvata',
          'Dobanda Neplatita',
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
          showInLegend: false,
          data: [
            { y: MathUtil.round(paidLoan), color: Colors.TEAL_400 },
            { y: MathUtil.round(unpaidLoan), color: Colors.BS_DANGER },
            { y: MathUtil.round(paidInterest), color: Colors.BLUE_400 },
            { y: MathUtil.round(savedInterest), color: Colors.GREEN_400 },
            { y: MathUtil.round(unpaidInterest), color: Colors.BS_ORANGE },
          ],
        },
      ] as any[],
    };
  }
}
