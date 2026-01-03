import Highcharts from 'highcharts';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { Rata } from '../../models/mortgage.model';

export namespace RatesTrendChartUtils {
  export function getChart(rates: Rata[]): Highcharts.Options {
    const series: any[] = [
      {
        type: 'spline',
        name: 'Loan',
        color: 'green',
        data: rates.map((r) => ({
          x: r.dataPlatii.getTime(),
          y: Number(r.rataCredit!.toFixed(2)),
          date: DateUtils.fromJsDateToString(r.dataPlatii),
        })),
      },
      {
        type: 'line',
        name: 'Interests',
        color: 'red',
        data: rates.map((r) => ({
          x: r.dataPlatii.getTime(),
          y: Number(r.rataDobanda!.toFixed(2)),
          date: DateUtils.fromJsDateToString(r.dataPlatii),
        })),
      },
    ];

    return {
      title: { text: 'Loan Rates Trend', align: 'left' },
      chart: { type: 'spline', zooming: { type: 'x' } },
      xAxis: { type: 'datetime', title: { text: 'Date' } },
      yAxis: { title: { text: 'Amount' } },
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
