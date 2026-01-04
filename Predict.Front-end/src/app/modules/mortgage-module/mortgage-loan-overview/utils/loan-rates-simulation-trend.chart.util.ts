import Highcharts from 'highcharts';
import { Colors } from 'src/app/shared/styles/colors';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';

export namespace LoanRatesSimulationTrendChartUtils {
  export function getChart(
    repaymentSchedule: RepaymentSchedule
  ): Highcharts.Options {
    if (!repaymentSchedule) return null;

    const series: any[] = [
      {
        type: 'spline',
        name: 'Loan',
        color: Colors.TEAL_400,
        data: repaymentSchedule.rate.map((r) => ({
          x: r.dataPlatii.getTime(),
          y: Number(r.rataCredit!.toFixed(2)),
          date: DateUtils.fromJsDateToString(r.dataPlatii),
        })),
      },
      {
        type: 'line',
        name: 'Interests',
        color: Colors.BS_DANGER,
        data: repaymentSchedule.rate.map((r) => ({
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
