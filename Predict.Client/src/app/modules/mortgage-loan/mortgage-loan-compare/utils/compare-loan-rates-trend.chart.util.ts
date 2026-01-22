import Highcharts from 'highcharts';
import { Colors } from 'src/app/shared/styles/colors';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';

export namespace CompareRatesTrendChartUtils {
  export function getChart(
    base: RepaymentSchedule,
    left: RepaymentSchedule,
    right: RepaymentSchedule,
  ): Highcharts.Options {
    const sources: Array<[RepaymentSchedule, string, string]> = [
      base ? [base, 'Base', Colors.BS_SECONDARY] : null,
      left ? [left, left.name, Colors.BS_TEAL] : null,
      right ? [right, right.name, Colors.BS_DANGER] : null,
    ];

    const series: Highcharts.SeriesOptionsType[] = sources
      .filter(Boolean)
      .flatMap(([repaymentSchedule, name, color]) => [
        {
          type: 'spline',
          name: `${name} – Principal`,
          color,
          data: repaymentSchedule.monthlyInstalments.map((r) => ({
            x: r.paymentDate.getTime(),
            y: Number(r.principalAmount.toFixed(2)),
            date: DateUtils.fromJsDateToString(r.paymentDate),
          })),
        },
        {
          type: 'line',
          name: `${name} – Dobanda`,
          color,
          dashStyle: 'ShortDash',
          data: repaymentSchedule.monthlyInstalments.map((r) => ({
            x: r.paymentDate.getTime(),
            y: Number(r.interestAmount.toFixed(2)),
            date: DateUtils.fromJsDateToString(r.paymentDate),
          })),
        },
      ]);

    return {
      title: {
        text: 'Trendul de rambursare - Principal vs Dobandă',
        align: 'left',
      },
      chart: { zooming: { type: 'x' } },
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
                   ${p.series.name}: <b>${p.y}</b><br/>`,
              )
              .join('')}
          `;
        },
      },
      series,
    };
  }
}
