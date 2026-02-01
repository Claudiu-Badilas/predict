import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistocialInstalmentPayment } from '../../models/base-loan-rate.model';

export namespace MortgageLoanProgressChartUtils {
  export function getChart(
    rates: HistocialInstalmentPayment[],
  ): Highcharts.Options {
    if (!rates.length) return null;

    const baseRemainingUnpaidAmount = Calculator.sum([
      rates.at(0).principalAmount,
      rates.at(0).remainingBalance,
    ]);
    const paidInstalments = rates.filter(
      (r) => r.isNormalPayment || r.isExtraPayment,
    );
    const paidPrincipalAmount = Calculator.sum(
      paidInstalments.map((r) => r.principalAmount),
    );

    const unpaidInstalments = rates.filter(
      (r) => !r.isNormalPayment && !r.isExtraPayment,
    );

    const unpaidPrincipalAmountAmount = Calculator.sum(
      unpaidInstalments.map((r) => r.principalAmount),
    );

    const paidPrincipalAmountPercent = MathUtil.percent(
      paidPrincipalAmount,
      baseRemainingUnpaidAmount,
    );

    const unpaidPrincipalAmountPercent = MathUtil.percent(
      unpaidPrincipalAmountAmount,
      baseRemainingUnpaidAmount,
    );

    return {
      chart: {
        type: 'pie',
        zooming: { type: 'xy' },
        panning: { enabled: true, type: 'xy' },
        panKey: 'shift',
      },
      title: { text: 'Progres Plata Principal', align: 'left' },
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
              name: 'Principal Platiti',
              y: MathUtil.round(paidPrincipalAmountPercent),
              amount: MathUtil.round(paidPrincipalAmount),
              color: Colors.TEAL_400,
            },
            {
              name: 'Principal Neplatit',
              y: MathUtil.round(unpaidPrincipalAmountPercent),
              amount: MathUtil.round(unpaidPrincipalAmountAmount),
              color: Colors.BS_DANGER,
            },
          ],
        },
      ] as any[],
    };
  }
}
