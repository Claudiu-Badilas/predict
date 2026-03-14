import { SeriesOptionsType } from 'highcharts';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistoricalInstalmentPayment } from '../../models/base-loan-rate.model';

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
        spacing: [20, 20, 20, 20],
      },
      title: {
        text: `Overview (${NumberFormatPipe.numberFormat(total)})`,
        align: 'left',
        style: { fontFamily: 'Inter, system-ui, sans-serif' },
      },
      tooltip: {
        headerFormat: '',
        pointFormat:
          '<span style="color:{point.color}">●</span> <b>{point.name}</b><br/>' +
          '<b>{point.y}%</b><br/>' +
          'Amount: <b>{point.amountCompact} RON</b>',
      },
      plotOptions: {
        pie: {
          innerSize: '65%',
          borderRadius: 5,
          dataLabels: {
            enabled: true,
            format:
              '<b>{point.nameShort}</b>: {point.amountCompact} ({point.y}%)',
            style: {
              fontSize: '11px',
              textOutline: 'none',
              fontWeight: 'normal',
            },
            connectorWidth: 1,
            connectorPadding: 5,
            distance: 20,
          },
        },
      },

      series: [
        {
          name: 'Mortgage',
          data: [
            {
              name: 'Principal Platit',
              nameShort: 'Pr. Platit', // Shortened name
              y: percent(paidPrincipal),
              amount: MathUtil.round(paidPrincipal),
              amountCompact: NumberFormatPipe.numberFormat(paidPrincipal),
              color: Colors.TEAL_400,
            },
            {
              name: 'Principal Neplatit',
              nameShort: 'Pr. Neplatit',
              y: percent(unpaidPrincipal),
              amount: MathUtil.round(unpaidPrincipal),
              amountCompact: NumberFormatPipe.numberFormat(unpaidPrincipal),
              color: Colors.BS_DANGER,
            },
            {
              name: 'Dobanda Platita',
              nameShort: 'Dob. Platita',
              y: percent(paidInterest),
              amount: MathUtil.round(paidInterest),
              amountCompact: NumberFormatPipe.numberFormat(paidInterest),
              color: Colors.BLUE_400,
            },
            {
              name: 'PAD Platita',
              nameShort: 'PAD',
              y: percent(paidInsurance),
              amount: MathUtil.round(paidInsurance),
              amountCompact: NumberFormatPipe.numberFormat(paidInsurance),
              color: Colors.YELLOW_400,
            },
            {
              name: 'Dobanda Salvata',
              nameShort: 'Dob. Salvata',
              y: percent(savedInterest),
              amount: MathUtil.round(savedInterest),
              amountCompact: NumberFormatPipe.numberFormat(savedInterest),
              color: Colors.GREEN_400,
            },
            {
              name: 'Dobanda Neplatita',
              nameShort: 'Dob. Neplatită',
              y: percent(unpaidInterest),
              amount: MathUtil.round(unpaidInterest),
              amountCompact: NumberFormatPipe.numberFormat(unpaidInterest),
              color: Colors.BS_ORANGE,
            },
          ],
        },
      ] as SeriesOptionsType[],
    };
  }
}
