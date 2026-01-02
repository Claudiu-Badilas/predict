import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import { MathUtil } from 'src/app/shared/utils/math.utils';

export namespace MortgageLoanAmountChartUtils {
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

    const rataDobanda = CalculatorUtil.sum(
      latest.rate.map((r) => r.rataDobanda)
    );

    const paidAmount = baseRemainingUnpaidAmount - latestRemainingUnpaidAmount;

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
            { y: MathUtil.round(paidAmount) },
            { y: MathUtil.round(paidAmount) },
            { y: MathUtil.round(paidAmount) },
            { y: MathUtil.round(rataDobanda) },
            { y: MathUtil.round(latestRemainingUnpaidAmount) },
          ],
        },
      ] as any[],
    };
  }
}
