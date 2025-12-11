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
    const validTransactions = transactions.filter((t) => !t.ignored);
    const incomes = validTransactions.filter((t) => t.amount > 0);
    const expenses = validTransactions.filter((t) => t.amount < 0);

    const groupTransactionByDate = (trans: TransactionDomain[]) =>
      ObjectUtil.groupBy(trans, (t) =>
        t.registrationDate.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      );
    const groupedIncomesByMonth = groupTransactionByDate(incomes);
    const groupedExpensesByMonth = groupTransactionByDate(expenses);

    const categories = getAvailableMonths(startDate, endDate);
    const getData = (
      group: Record<string, TransactionDomain[]>
    ): [string, number][] =>
      categories.map((cat) => [
        cat,
        CalculatorUtil.sum((group[cat] ?? []).map((t) => t.amount)),
      ]);

    const incomesData = getData(groupedIncomesByMonth);
    const expensesData = getData(groupedExpensesByMonth);

    const savesData = categories.map((cat) => {
      const incomesTotal = incomesData.find(([c, _]) => c === cat)[1];
      const expensesTotal = expensesData.find(([c, _]) => c === cat)[1];
      const total = incomesTotal - Math.abs(expensesTotal);
      return total > 0 ? total : 0;
    });

    const losesData = categories.map((cat) => {
      const incomesTotal = incomesData.find(([c, _]) => c === cat)[1];
      const expensesTotal = expensesData.find(([c, _]) => c === cat)[1];
      const total = incomesTotal - Math.abs(expensesTotal);
      return total < 0 ? total : 0;
    });

    return {
      chart: { zooming: { type: 'xy' } },
      title: { text: 'Monthly Transactions', align: 'left' },
      xAxis: { categories },
      yAxis: { title: { text: 'Amount (RON)' } },
      series: [
        {
          type: 'column',
          name: 'Income',
          color: Colors.GREEN_500,
          data: incomesData.map(([_, v]) => v),
        },
        {
          type: 'column',
          name: 'Expenses',
          color: Colors.PINK_500,
          data: expensesData.map(([_, v]) => Math.abs(v)),
        },
        {
          type: 'column',
          name: 'Saves',
          color: Colors.BLUE_500,
          data: savesData,
        },
        {
          type: 'column',
          name: 'Loses',
          color: Colors.BS_BLACK,
          data: losesData,
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
