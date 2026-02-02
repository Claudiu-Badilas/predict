import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistocialInstalmentPayment } from '../../models/base-loan-rate.model';
import { Colors } from 'src/app/shared/styles/colors';

export namespace MortgageInterestProgressChartUtils {
  export function getChart(
    rates: HistocialInstalmentPayment[],
  ): Highcharts.Options {
    if (!rates.length) return null;

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
    const totalUnpaidInterest = Calculator.sum(
      rates.map((r) => r.interestAmount),
    );

    const paidInterestPercent = MathUtil.percent(
      paidInterest,
      totalUnpaidInterest,
    );
    const paidInsurancePercent = MathUtil.percent(
      paidInsurance,
      totalUnpaidInterest,
    );

    const savedInterestPercent = MathUtil.percent(
      savedInterest,
      totalUnpaidInterest,
    );
    const unpaidInterestPercent = MathUtil.percent(
      unpaidInterest,
      totalUnpaidInterest,
    );

    return {
      chart: {
        type: 'pie',
        zooming: { type: 'xy' },
        panning: { enabled: true, type: 'xy' },
        panKey: 'shift',
      },
      title: { text: 'Progres Dobanda', align: 'left' },
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
              name: 'Platita',
              y: MathUtil.round(paidInterestPercent),
              amount: MathUtil.round(paidInterest),
              color: Colors.BLUE_400,
            },
            {
              name: 'Asigurare',
              y: MathUtil.round(paidInsurancePercent),
              amount: MathUtil.round(paidInsurance),
              color: Colors.YELLOW_400,
            },
            {
              name: 'Salvata',
              y: MathUtil.round(savedInterestPercent),
              amount: MathUtil.round(savedInterest),
              color: Colors.GREEN_400,
            },
            {
              name: 'Neplatita',
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
