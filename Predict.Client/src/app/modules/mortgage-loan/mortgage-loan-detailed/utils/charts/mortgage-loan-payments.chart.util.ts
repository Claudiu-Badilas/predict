import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { BaseLoanInstalment } from '../../models/base-loan-rate.model';

export namespace MortgageLoanPaymentsChartUtils {
  export function getChart(
    instalments: BaseLoanInstalment[],
  ): Highcharts.Options {
    if (!instalments.length) return null;

    const scheduledPayments = instalments.filter((r) => r.isNormalPayment);
    const earlyPayments = instalments.filter((r) => r.isExtraPayment);
    const unpaid = instalments.filter(
      (r) => !r.isExtraPayment && !r.isNormalPayment,
    );

    const groupInstalmentsByDate = (instalments: BaseLoanInstalment[]) =>
      ObjectUtil.groupBy(instalments, (t) =>
        t.paymentDate.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
      );
    const groupedscheduledPaymentsByMonth =
      groupInstalmentsByDate(scheduledPayments);
    const groupedEarlyPaymentsByMonth = groupInstalmentsByDate(earlyPayments);
    const groupedUnpaidByMonth = groupInstalmentsByDate(unpaid);

    const categories = getAvailableMonths(
      instalments.map((r) => r.paymentDate),
    );

    const scheduledPaymentsIntrestsData = categories.map((cat) =>
      Calculator.sum(
        groupedscheduledPaymentsByMonth[cat]?.map((i) => i.interestAmount),
      ),
    );
    const scheduledPaymentsPrincipalData = categories.map((cat) =>
      Calculator.sum(
        groupedscheduledPaymentsByMonth[cat]?.map((i) => i.principalAmount),
      ),
    );
    const earlyPaymentsData = categories.map((cat) =>
      Calculator.sum(
        groupedEarlyPaymentsByMonth[cat]?.map((i) => i.principalAmount),
      ),
    );
    const unpaidPrincipalData = categories.map((cat) =>
      Calculator.sum(groupedUnpaidByMonth[cat]?.map((i) => i.principalAmount)),
    );
    const unpaidInterestData = categories.map((cat) =>
      Calculator.sum(groupedUnpaidByMonth[cat]?.map((i) => i.interestAmount)),
    );

    return {
      chart: { zooming: { type: 'xy' } },
      title: { text: 'Monthly Payments', align: 'left' },
      xAxis: { categories },
      yAxis: { title: { text: 'Amount (RON)' } },
      plotOptions: {
        column: {
          stacking: 'normal',
          borderWidth: 0,
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          let total = 0;
          let category;
          const lines = this.points!.map((p) => {
            total += p.y as number;
            category = p.category;
            return `
                <span style="color:${p.color}">●</span>
                ${p.series.name}: <b>${NumberFormatPipe.numberFormat(p.y as number)}</b> RON
              `;
          });

          return `
              <b>${category}</b><br/>
              ${lines.join('<br/>')}
              <hr style="margin:4px 0"/>
              <b>Total: ${NumberFormatPipe.numberFormat(total)} RON</b>
            `;
        },
      },
      series: [
        {
          type: 'column',
          name: 'Dobanda principal',
          color: Colors.GREEN_300,
          data: scheduledPaymentsPrincipalData,
        },
        {
          type: 'column',
          name: 'Anticipat',
          color: Colors.GREEN_300,
          data: earlyPaymentsData,
        },
        {
          type: 'column',
          name: 'Dobanda rata',
          color: Colors.BLUE_300,
          data: scheduledPaymentsIntrestsData,
        },
        {
          type: 'column',
          name: 'Principal Neplatit',
          color: Colors.BS_TEAL,
          data: unpaidPrincipalData,
        },
        {
          type: 'column',
          name: 'Dobanda Neplatita',
          color: Colors.BS_ORANGE,
          data: unpaidInterestData,
        },
      ],
    };
  }

  function getAvailableMonths(dates: Date[]): string[] {
    if (!dates.length) return [];

    const sortedDates = [...new Set(dates)].sort(
      (d1, d2) => d1.getTime() - d2.getTime(),
    );

    const firstDate = sortedDates[0];
    const lastDate = sortedDates.at(-1);
    const result: string[] = [];

    let current = new Date(Math.min(firstDate.getTime(), lastDate.getTime()));
    const last = new Date(Math.max(firstDate.getTime(), lastDate.getTime()));

    current.setDate(1);
    last.setDate(1);

    while (current <= last) {
      result.push(
        current.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      );
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return result;
  }
}
