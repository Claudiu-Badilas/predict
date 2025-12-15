import Highcharts from 'highcharts';
import { Colors } from 'src/app/shared/styles/colors';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ReceiptsProductDomain } from '../models/receipts-products.model';

export namespace DailyPurchasedProductChartUtils {
  export function getChart(
    startDate: Date,
    endDate: Date,
    receiptProducts: ReceiptsProductDomain[]
  ): Highcharts.Options {
    const getData = (products: ReceiptsProductDomain[]) => {
      return products.map((p) => ({
        x: p.purchasedDate.valueOf(),
        y: Number(p.price.toFixed(2)),
        date: DateUtils.fromJsDateToString(p.purchasedDate),
        name: p.name,
      }));
    };

    return {
      title: { text: 'Daily Purchased Product ', align: 'left' },
      chart: { zooming: { type: 'xy' } },
      xAxis: {
        type: 'datetime',
        min: startDate.getTime(),
        max: endDate.getTime(),
      },
      tooltip: {
        formatter: function () {
          return `
            <b>${(this as any).name}</b><br/>
            Date: <b>${(this as any).point.date}</b><br/>
            Amount: <b>${(this as any).point.y}</b>
          `;
        },
        useHTML: true,
      },
      series: [
        {
          type: 'scatter',
          data: getData(receiptProducts),
          name: 'Products',
          color: Colors.BLUE_500,
        },
      ],
    };
  }
}
