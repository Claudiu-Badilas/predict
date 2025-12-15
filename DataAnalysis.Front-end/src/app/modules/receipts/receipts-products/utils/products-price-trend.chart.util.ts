import Highcharts from 'highcharts';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { ReceiptsProductDomain } from '../models/receipts-products.model';

export namespace ProductPriceTrendChartUtils {
  export function getChart(
    startDate: Date,
    endDate: Date,
    receiptProducts: ReceiptsProductDomain[]
  ): Highcharts.Options {
    const groupedByName = ObjectUtil.groupBy(receiptProducts, (p) => p.name);

    const series: Highcharts.SeriesLineOptions[] = Object.keys(
      groupedByName
    ).map((productName) => ({
      type: 'line',
      name: productName,
      data: groupedByName[productName]
        .filter((p) => p.price !== null)
        .sort((a, b) => a.purchasedDate.getTime() - b.purchasedDate.getTime())
        .map((p) => ({
          x: p.purchasedDate.getTime(),
          y: Number(p.price!.toFixed(2)),
          date: DateUtils.fromJsDateToString(p.purchasedDate),
        })),
    }));

    return {
      title: {
        text: 'Product Price Trend',
        align: 'left',
      },
      chart: {
        type: 'line',
        zooming: { type: 'x' },
      },
      xAxis: {
        type: 'datetime',
        min: startDate.getTime(),
        max: endDate.getTime(),
        title: { text: 'Date' },
      },
      yAxis: {
        title: { text: 'Price' },
      },
      tooltip: {
        formatter: function () {
          const point = (this as any).point;
          return `
            Product: <b>${this.series.name}</b><br/>
            Date: <b>${point.date}</b><br/>
            Price: <b>${this.y}</b>
          `;
        },
        useHTML: true,
      },
      series,
    };
  }
}
