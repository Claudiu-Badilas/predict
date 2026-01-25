import { RepaymentSchedule } from '../../models/mortgage.model';

export function mapInstalementSimulation(
  base: RepaymentSchedule | null,
  maxAmount: number = 4_000,
): [number[], number[]] | null {
  if (!base || maxAmount === null || maxAmount <= 0) return [[], []];

  const selectedInstalmentPayments: number[] = [];
  const selectedEarlyPayments: number[] = [];

  let accAmount = 0;

  base.monthlyInstalments.forEach((instalment, i) => {
    const tempAccAmount = accAmount + instalment.principalAmount;

    const maxAmountTrashhold = maxAmount + maxAmount * 0.05;

    if (
      i === 0 ||
      tempAccAmount > maxAmountTrashhold ||
      accAmount > maxAmount
    ) {
      selectedInstalmentPayments.push(instalment.instalmentId);
      accAmount = instalment.totalInstalment;
    } else if (accAmount <= maxAmount) {
      selectedEarlyPayments.push(instalment.instalmentId);
      accAmount += instalment.principalAmount;
    }
  });

  return [selectedInstalmentPayments, selectedEarlyPayments];
}
