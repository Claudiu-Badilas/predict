import { Colors } from 'src/app/shared/styles/colors';
import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { TransactionDomain } from '../models/transactions.model';

export namespace MonthlyTransactionChartUtils {
  export function getChart(
    startDate: Date,
    endDate: Date,
    transactions: TransactionDomain[]
  ): Highcharts.Options {
    const categories = getAvailableMonths(startDate, endDate);

    const incomes = transactions.filter((t) => !t.ignored && t.amount > 0);
    const expenses = transactions.filter((t) => !t.ignored && t.amount < 0);

    const groupedIncomesByMonth = ObjectUtil.groupBy(incomes, (t) =>
      t.registrationDate.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    );
    const groupedExpensesByMonth = ObjectUtil.groupBy(expenses, (t) =>
      t.registrationDate.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    );

    const incomesData: number[] = categories.map((cat) => {
      const trans = groupedIncomesByMonth[cat] ?? [];
      return CalculatorUtil.sum(trans.map((t) => t.amount));
    });

    const expensesData: number[] = categories.map((cat) => {
      const trans = groupedExpensesByMonth[cat] ?? [];
      return CalculatorUtil.sum(trans.map((t) => Math.abs(t.amount)));
    });

    return {
      chart: { type: 'column' },
      title: { text: 'Monthly Transactions' },
      xAxis: { categories },
      yAxis: { title: { text: 'Amount (RON)' } },
      series: [
        {
          type: 'column',
          name: 'Income',
          color: Colors.GREEN_500,
          data: incomesData,
        },
        {
          type: 'column',
          name: 'Expenses',
          color: Colors.PINK_500,
          data: expensesData,
        },
      ],
    };
  }

  function getAvailableMonths(startDate: Date, endDate: Date): string[] {
    const result: string[] = [];

    let current = new Date(Math.min(startDate.getTime(), endDate.getTime()));
    const last = new Date(Math.max(startDate.getTime(), endDate.getTime()));

    current.setDate(1);
    last.setDate(1);

    while (current <= last) {
      result.push(
        current.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      );
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return result;
  }
}
