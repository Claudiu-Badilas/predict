import Highcharts from 'highcharts';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import { Colors } from 'src/app/shared/styles/colors';

export namespace CompareInterestTrendChartUtils {
  export function getChart(
    base: RepaymentSchedule,
    left: RepaymentSchedule,
    right: RepaymentSchedule
  ): Highcharts.Options {
    if (!base || !left || !right) return null;

    const sources: Array<[RepaymentSchedule, string, string]> = [
      [base, 'Base', Colors.BS_SECONDARY],
      [left, left.name, Colors.TEAL_400],
      [right, right.name, Colors.BS_DANGER],
    ];

    const series: any[] = sources.flatMap(
      ([repaymentSchedule, name, color]) => [
        {
          type: 'line',
          name,
          color,
          data: repaymentSchedule.rate.map((r) => ({
            x: r.dataPlatii.getTime(),
            y: Number(r.rataDobanda.toFixed(2)),
            date: DateUtils.fromJsDateToString(r.dataPlatii),
          })),
        },
      ]
    );

    return {
      title: { text: 'Loan Rates Trend', align: 'left' },
      chart: { type: 'spline', zooming: { type: 'x' } },
      xAxis: { type: 'datetime', title: { text: 'Date' } },
      yAxis: { title: { text: 'Amount' } },
      plotOptions: { series: { marker: { enabled: false } } },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          const points = (this as any).points;
          const date = points?.[0]?.point?.date;

          return `
            <b>Date: ${date}</b><br/>
            ${points
              .map(
                (p: any) =>
                  `<span style="color:${p.series.color}">●</span>
                  ${p.series.name}: <b>${p.y}</b><br/>`
              )
              .join('')}
            `;
        },
      },

      series,
    };
  }
}
