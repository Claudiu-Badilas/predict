import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import {
  OverviewLoanInstalment,
  OverviewRepaymentSchedule,
} from '../models/overview-mortgage-loan.model';

export function mapBaseRepaymentScheduleToOverview(
  base: RepaymentSchedule,
  startDate: Date,
  selectedInstalmentPayments: number[],
  selectedEarlyPayments: number[],
): OverviewRepaymentSchedule | null {
  if (!base) return null;

  const overviewBaseLoanInstalments = mapOverviewBaseLoanInstalments(
    base,
    startDate,
    selectedInstalmentPayments,
    selectedEarlyPayments,
  );

  const overviewLoanInstalments = mapOverviewLoanInstalments(
    overviewBaseLoanInstalments,
  );

  return {
    name: base.name,
    overviewLoanInstalments: overviewLoanInstalments,
  } as OverviewRepaymentSchedule;
}

function mapOverviewLoanInstalments(
  overviewBaseLoanInstalments: OverviewLoanInstalment[],
): OverviewLoanInstalment[] {
  const result: OverviewLoanInstalment[] = [];
  let earlyPaymentBatch: OverviewLoanInstalment[] = [];

  overviewBaseLoanInstalments.forEach((current, index) => {
    const next = overviewBaseLoanInstalments[index + 1];
    result.push(current);

    if (current.instalmentPayment) {
      earlyPaymentBatch = [current];
    } else if (current.earlyPayment) {
      earlyPaymentBatch.push(current);

      const shouldCreateSummary = next && !next.earlyPayment;
      if (shouldCreateSummary) {
        const summaryInstalment = createSummaryRow(earlyPaymentBatch);
        result.push(summaryInstalment);
      }
    }
  });

  return result;
}

function createSummaryRow(
  batch: OverviewLoanInstalment[],
): OverviewLoanInstalment {
  const firstInBatch = batch[0];
  const lastInBatch = batch.at(-1)!;

  return {
    instalmentId: batch.filter((x) => x.earlyPayment).length,
    paymentDate: firstInBatch.newPaymentDate,
    newPaymentDate: lastInBatch.newPaymentDate,
    interestAmount: firstInBatch.instalmentPayment
      ? firstInBatch.interestAmount
      : 0,
    principalAmount: Calculator.sum(batch.map((m) => m.principalAmount)),
    administrationFee: Calculator.sum(batch.map((m) => m.administrationFee)),
    insuranceCost: Calculator.sum(batch.map((m) => m.insuranceCost)),
    managementFee: Calculator.sum(batch.map((m) => m.managementFee)),
    recalculatedInterest: Calculator.sum(
      batch.map((m) => m.recalculatedInterest),
    ),
    totalInstalment: Calculator.sum(
      batch.map((m) =>
        m.instalmentPayment
          ? m.totalInstalment
          : m.earlyPayment
            ? m.principalAmount
            : 0,
      ),
    ),
    remainingBalance: lastInBatch.remainingBalance,
    instalmentPayment: false,
    earlyPayment: false,
    disabled: true,
    totalRow: true,
    color: Colors.PINK_100,
  };
}

function mapOverviewBaseLoanInstalments(
  base: RepaymentSchedule,
  startDate: Date,
  selectedInstalmentPayments: number[],
  selectedEarlyPayments: number[],
) {
  let newPaymentDate: Date = null;
  let updateInstalmentDate = false;
  let updateEarlyPayDate = false;

  return base.monthlyInstalments.map((r, i, arr) => {
    const disabled = JsDateUtils.isSameOrBefore(r.paymentDate, startDate);

    const instalmentPayment = selectedInstalmentPayments.some(
      (s) => s === r.instalmentId,
    );
    const earlyPayment = selectedEarlyPayments.some(
      (s) => s === r.instalmentId,
    );

    if (instalmentPayment) {
      updateInstalmentDate = true;
    }

    const prevInstalmentPayment = selectedInstalmentPayments.some(
      (s) => s === arr[i - 1]?.instalmentId,
    );
    if (prevInstalmentPayment && earlyPayment) {
      updateEarlyPayDate = true;
    }

    if (!JsDateUtils.isValidDate(newPaymentDate) && updateInstalmentDate) {
      newPaymentDate = r.paymentDate;
      updateInstalmentDate = false;
    } else if (updateEarlyPayDate && newPaymentDate && earlyPayment) {
      newPaymentDate = JsDateUtils.addDays(newPaymentDate, 1);
      updateEarlyPayDate = false;
    } else if (
      JsDateUtils.isValidDate(newPaymentDate) &&
      updateInstalmentDate
    ) {
      newPaymentDate = JsDateUtils.addMonths(
        JsDateUtils.addDays(newPaymentDate, -1),
        1,
      );
      updateInstalmentDate = false;
    }
    return {
      instalmentId: r.instalmentId,
      paymentDate: r.paymentDate,
      newPaymentDate,
      interestAmount: r.interestAmount,
      principalAmount: r.principalAmount,
      administrationFee: r.administrationFee,
      insuranceCost: r.insuranceCost,
      managementFee: r.managementFee,
      recalculatedInterest: r.recalculatedInterest,
      totalInstalment: r.totalInstalment,
      remainingBalance: r.remainingBalance,
      instalmentPayment: !disabled && instalmentPayment,
      earlyPayment: !disabled && earlyPayment,
      disabled: disabled,
      color: getColor(disabled, instalmentPayment, earlyPayment),
      totalRow: false,
    } as OverviewLoanInstalment;
  });
}

function getColor(
  disabled: boolean,
  instalmentPayment: boolean,
  earlyPayment: boolean,
): string {
  if (disabled) return Colors.GRAY_200;
  if (instalmentPayment) return Colors.BLUE_200;
  if (earlyPayment) return Colors.GREEN_200;

  return 'white';
}
