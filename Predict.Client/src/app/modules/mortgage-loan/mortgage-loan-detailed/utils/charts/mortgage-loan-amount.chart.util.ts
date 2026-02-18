import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistoricalInstalmentPayment } from '../../models/base-loan-rate.model';
import { Colors } from 'src/app/shared/styles/colors';

export namespace MortgageLoanAmountChartUtils {
  export function getChart(
    rates: HistoricalInstalmentPayment[],
  ): Highcharts.Options {
    if (!rates.length) return null;

    const paidRates = rates.filter(
      (r) => r.instalmentPayment || r.earlyPayment,
    );
    const paidLoan = Calculator.sum(paidRates.map((r) => r.principalAmount));

    const paidInterestRates = rates.filter((r) => r.instalmentPayment);
    const paidInterest = Calculator.sum(
      paidInterestRates.map((r) => r.interestAmount),
    );
    const paidInsurance = Calculator.sum(
      paidInterestRates.map((r) => r.insuranceCost),
    );

    const savedInterestRates = rates.filter((r) => r.earlyPayment);
    const savedInterest = Calculator.sum(
      savedInterestRates.map((r) => r.interestAmount),
    );

    const unpaidRates = rates.filter(
      (r) => !r.instalmentPayment && !r.earlyPayment,
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
          'Principal Platit',
          'Principal Neplatit',
          'Dobanda Platita',
          'PAD Platita',
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
            { y: MathUtil.round(paidInsurance), color: Colors.YELLOW_400 },
            { y: MathUtil.round(savedInterest), color: Colors.GREEN_400 },
            { y: MathUtil.round(unpaidInterest), color: Colors.BS_ORANGE },
          ],
        },
      ] as any[],
    };
  }
}
