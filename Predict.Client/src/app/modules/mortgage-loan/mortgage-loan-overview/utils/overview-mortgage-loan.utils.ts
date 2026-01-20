import { Colors } from 'src/app/shared/styles/colors';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import {
  OverviewLoanInstalment,
  OverviewRepaymentSchedule,
} from '../models/overview-mortgage-loan.model';
import { CalculatorUtil } from 'src/app/shared/utils/calculator.utils';

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
) {
  const arr: OverviewLoanInstalment[] = [];
  let temp: OverviewLoanInstalment[] = [];

  overviewBaseLoanInstalments.forEach((r, i) => {
    const next = overviewBaseLoanInstalments[i + 1];
    arr.push(r);
    if (r.instalmentPayment) {
      temp = [];
      temp.push(r);
    } else if (r.earlyPayment) {
      temp.push(r);

      if (next && !next.earlyPayment) {
        arr.push({
          instalmentId: null,
          paymentDate: null,
          interestAmount: temp[0].instalmentPayment
            ? temp[0].interestAmount
            : 0,
          principalAmount: CalculatorUtil.sum(
            temp.map((m) => m.principalAmount),
          ),
          administrationFee: CalculatorUtil.sum(
            temp.map((m) => m.administrationFee),
          ),
          insuranceCost: CalculatorUtil.sum(temp.map((m) => m.insuranceCost)),
          managementFee: CalculatorUtil.sum(temp.map((m) => m.managementFee)),
          recalculatedInterest: CalculatorUtil.sum(
            temp.map((m) => m.recalculatedInterest),
          ),
          totalInstalment: CalculatorUtil.sum(
            temp.map((m) =>
              m.instalmentPayment
                ? m.totalInstalment
                : m.earlyPayment
                  ? m.principalAmount
                  : 0,
            ),
          ),
          remainingBalance: temp.at(-1).remainingBalance,
          instalmentPayment: false,
          earlyPayment: false,
          disabled: true,
          totalRow: true,
          color: Colors.PINK_400,
        } as OverviewLoanInstalment);
      }
    }
  });

  return arr;
}

function mapOverviewBaseLoanInstalments(
  base: RepaymentSchedule,
  startDate: Date,
  selectedInstalmentPayments: number[],
  selectedEarlyPayments: number[],
) {
  return base.monthlyInstalments.map((r) => {
    const disabled = JsDateUtils.isBefore(r.paymentDate, startDate);

    const instalmentPayment = selectedInstalmentPayments.some(
      (s) => s === r.instalmentId,
    );
    const earlyPayment = selectedEarlyPayments.some(
      (s) => s === r.instalmentId,
    );
    return {
      instalmentId: r.instalmentId,
      paymentDate: r.paymentDate,
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
