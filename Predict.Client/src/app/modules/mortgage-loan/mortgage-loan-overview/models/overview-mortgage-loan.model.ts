import { Colors } from 'src/app/shared/styles/colors';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';

export type OverviewLoanRate = {
  instalmentId: number | null;
  paymentDate: Date | null;
  interestAmount: number | null;
  principalAmount: number | null;
  administrationFee: number | null;
  insuranceCost: number | null;
  managementFee: number | null;
  recalculatedInterest: number | null;
  totalInstalment: number | null;
  remainingBalance: number | null;
  nextInterest: boolean;
  selected: boolean;
  disabled: boolean;
  color: string;
};

export type OverviewRepaymentSchedule = {
  name: string;
  overviewLoanRates: OverviewLoanRate[];
};

export function mapBaseRepaymentScheduleToOverview(
  base: RepaymentSchedule,
  startDate: Date,
  selectedLoanRates: number[]
): OverviewRepaymentSchedule | null {
  if (!base) return null;

  let availableNextInterest = false;

  const overviewLoanRates: OverviewLoanRate[] = base.monthlyInstalments.map(
    (r) => {
      const disabled = JsDateUtils.isBefore(r.paymentDate, startDate);
      const nextInterest = !availableNextInterest && !disabled;
      if (nextInterest) availableNextInterest = true;

      const selected = selectedLoanRates.some((s) => s === r.instalmentId);
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
        nextInterest,
        selected: (!disabled && selected) || nextInterest,
        disabled: disabled || nextInterest,
        color: getColor(disabled, nextInterest, selected),
      } as OverviewLoanRate;
    }
  );

  return {
    name: base.name,
    overviewLoanRates,
  } as OverviewRepaymentSchedule;
}
function getColor(
  disabled: boolean,
  nextInterest: boolean,
  selected: boolean
): string {
  if (disabled) return Colors.GRAY_200;
  if (nextInterest) return Colors.BLUE_200;
  if (selected) return Colors.GREEN_200;
  return 'white';
}
