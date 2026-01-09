import Highcharts from 'highcharts';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { LocationInvoice } from '../../models/invoice.model';

export namespace InvoiceIndexTrentChartUtils {
  export function getChart(
    locationInvoice: LocationInvoice
  ): Highcharts.Options {
    if (!locationInvoice) return null;

    const grouped = ObjectUtil.groupBy(
      locationInvoice.invoices,
      (p) => p.invoiceType
    );

    const series: Highcharts.SeriesLineOptions[] = Object.keys(grouped)
      .map((key) => {
        const hasData = grouped[key].some((p) => p.index > 0);

        if (!hasData) return null;

        return {
          type: 'line',
          name: key,
          data: grouped[key]
            .filter((p) => p.type === 'Index Update' || p.type === 'Payment')
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((p) => ({
              x: p.date.getTime(),
              y: Number(p.index),
              name: key,
              date: DateUtils.fromJsDateToString(p.date),
              action: p.action,
            })),
        } satisfies Highcharts.SeriesLineOptions;
      })
      .filter(Boolean);

    return {
      title: { text: 'Invoice Index Trend', align: 'left' },
      chart: { type: 'line', zooming: { type: 'x' } },
      xAxis: { type: 'datetime', title: { text: 'Date' } },
      yAxis: { title: { text: 'Index' } },
      plotOptions: { series: { marker: { enabled: false } } },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          const points = (this as any).points;
          const point = points?.[0].point;
          return ` 
            <b>${point?.name}</b><br/>
            <b>Date: ${point?.date}</b><br/>
            <b>Action: ${point?.action}</b><br/>
            ${points
              .map(
                (p: any) =>
                  `<span style="color:${p.series.color}">●</span>
                   Index: <b>${p.y}</b><br/>`
              )
              .join('')}
          `;
        },
      },
      series,
    };
  }
}
