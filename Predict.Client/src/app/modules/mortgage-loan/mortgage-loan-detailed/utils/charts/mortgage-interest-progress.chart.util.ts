import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistoricalInstalmentPayment } from '../../models/base-loan-rate.model';
import { Colors } from 'src/app/shared/styles/colors';

export namespace MortgageInterestProgressChartUtils {
  export function getChart(
    rates: HistoricalInstalmentPayment[],
  ): Highcharts.Options {
    if (!rates.length) return null;

    const paidRates = rates.filter(
      (r) => r.instalmentPayment || r.earlyPayment,
    );
    const unpaidRates = rates.filter(
      (r) => !r.instalmentPayment && !r.earlyPayment,
    );

    const paidPrincipal = Calculator.sum(
      paidRates.map((r) => r.principalAmount),
    );
    const unpaidPrincipal = Calculator.sum(
      unpaidRates.map((r) => r.principalAmount),
    );

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

    const unpaidInterest = Calculator.sum(
      unpaidRates.map((r) => r.interestAmount),
    );

    const total = Calculator.sum([
      paidPrincipal,
      unpaidPrincipal,
      paidInterest,
      paidInsurance,
      savedInterest,
      unpaidInterest,
    ]);

    const percent = (value: number) =>
      MathUtil.round(MathUtil.percent(value, total));

    return {
      chart: {
        type: 'pie',
      },

      title: {
        text: 'Mortgage Overview',
        align: 'left',
      },

      tooltip: {
        headerFormat: '',
        pointFormat:
          '<span style="color:{point.color}">●</span> <b>{point.name}</b><br/>' +
          '<b>{point.y}%</b><br/>' +
          'Amount: <b>{point.amount} RON</b>',
      },

      plotOptions: {
        pie: {
          innerSize: '55%',
          borderRadius: 5,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y}%',
          },
        },
      },

      series: [
        {
          name: 'Mortgage',
          data: [
            {
              name: 'Principal Platit',
              y: percent(paidPrincipal),
              amount: MathUtil.round(paidPrincipal),
              color: Colors.TEAL_400,
            },
            {
              name: 'Principal Neplatit',
              y: percent(unpaidPrincipal),
              amount: MathUtil.round(unpaidPrincipal),
              color: Colors.BS_DANGER,
            },
            {
              name: 'Dobanda Platita',
              y: percent(paidInterest),
              amount: MathUtil.round(paidInterest),
              color: Colors.BLUE_400,
            },
            {
              name: 'PAD Platita',
              y: percent(paidInsurance),
              amount: MathUtil.round(paidInsurance),
              color: Colors.YELLOW_400,
            },
            {
              name: 'Dobanda Salvata',
              y: percent(savedInterest),
              amount: MathUtil.round(savedInterest),
              color: Colors.GREEN_400,
            },
            {
              name: 'Dobanda Neplatita',
              y: percent(unpaidInterest),
              amount: MathUtil.round(unpaidInterest),
              color: Colors.BS_ORANGE,
            },
          ],
        },
      ] as any[],
    };
  }
}
