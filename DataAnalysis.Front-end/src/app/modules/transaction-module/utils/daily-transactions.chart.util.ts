import Highcharts from 'highcharts';
import { Colors } from 'src/app/shared/styles/colors';
import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { TransactionDomain } from '../models/transactions.model';

export namespace DailyTransactionChartUtils {
  export function getChart(
    startDate: Date,
    endDate: Date,
    transactions: TransactionDomain[]
  ): Highcharts.Options {
    const validTransactions = transactions.filter((t) => !t.ignored);
    const incomes = validTransactions.filter((t) => t.amount > 0);
    const expenses = validTransactions.filter((t) => t.amount < 0);

    const groupTransactionByDay = (trans: TransactionDomain[]) =>
      ObjectUtil.groupBy(trans, (t) =>
        DateUtils.fromJsDateToString(t.registrationDate)
      );

    const getData = (transactions: TransactionDomain[], multiplier: number) => {
      const group = ObjectUtil.groupBy(transactions, (t) =>
        DateUtils.fromJsDateToString(t.registrationDate)
      );
      return Object.entries(group).map(([dateKey, transactions]) => {
        const total =
          CalculatorUtil.sum(transactions.map((t) => t.amount)) * multiplier;

        const date = DateUtils.fromStringToJsDate(dateKey);
        return {
          x: date.valueOf(),
          y: Number(total.toFixed(2)),
          date: dateKey,
        };
      });
    };

    return {
      title: { text: 'Daily Transactions', align: 'left' },
      chart: { zooming: { type: 'xy' } },
      xAxis: { type: 'datetime' },
      tooltip: {
        formatter: function () {
          return `
            <b>${this.series.name}</b><br/>
            Date: <b>${(this as any).point.date}</b><br/>
            Amount: <b>${(this as any).point.y}</b>
          `;
        },
        useHTML: true,
      },
      series: [
        {
          type: 'scatter',
          data: getData(incomes, 1),
          name: 'Income',
          color: Colors.GREEN_500,
        },
        {
          type: 'scatter',
          data: getData(expenses, -1),
          name: 'Expenses',
          color: Colors.PINK_500,
        },
      ],
    };
  }
}
