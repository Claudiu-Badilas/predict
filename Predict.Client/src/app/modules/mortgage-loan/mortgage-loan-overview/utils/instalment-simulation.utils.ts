import { RepaymentSchedule } from '../../models/mortgage.model';

export function mapInstalementSimulation(
  base: RepaymentSchedule | null,
  monthlyAmount: number = 4_000,
): [number[], number[]] | null {
  if (!base || monthlyAmount === null || monthlyAmount <= 0) return [[], []];

  const selectedInstalmentPayments: number[] = [];
  const selectedEarlyPayments: number[] = [];

  let accAmount = 0;

  base.monthlyInstalments.forEach((instalment, i) => {
    const tempAccAmount = accAmount + instalment.principalAmount;

    const maxAmountTrashhold = monthlyAmount + monthlyAmount * 0.05;

    if (
      i === 0 ||
      tempAccAmount > maxAmountTrashhold ||
      accAmount > monthlyAmount
    ) {
      selectedInstalmentPayments.push(instalment.instalmentId);
      accAmount = instalment.totalInstalment;
    } else if (accAmount <= monthlyAmount) {
      selectedEarlyPayments.push(instalment.instalmentId);
      accAmount += instalment.principalAmount;
    }
  });

  return [selectedInstalmentPayments, selectedEarlyPayments];
}
