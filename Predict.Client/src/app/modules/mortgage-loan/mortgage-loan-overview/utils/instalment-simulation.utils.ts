import { RepaymentSchedule } from '../../models/mortgage.model';

export function mapInstalementSimulation(
  base: RepaymentSchedule | null,
  { monthlyAmount = 4_000, payments = -1 } = {},
): [number[], number[]] | null {
  if (!base || monthlyAmount === null || monthlyAmount <= 0) return [[], []];

  const selectedInstalmentPayments: number[] = [];
  const selectedEarlyPayments: number[] = [];

  let accAmount = 0;
  let accPayments = 1;

  base.monthlyInstalments.forEach((instalment, i) => {
    const tempAccAmount = accAmount + instalment.principalAmount;

    const maxAmountTrashhold = monthlyAmount + monthlyAmount * 0.05;

    if (i === 0) {
      selectedInstalmentPayments.push(instalment.instalmentId);
      accAmount = instalment.totalInstalment;
    } else if (
      tempAccAmount > maxAmountTrashhold ||
      accAmount > monthlyAmount
    ) {
      if (accPayments === payments) return;

      selectedInstalmentPayments.push(instalment.instalmentId);
      accAmount = instalment.totalInstalment;
      accPayments++;
    } else if (accAmount <= monthlyAmount) {
      selectedEarlyPayments.push(instalment.instalmentId);
      accAmount += instalment.principalAmount;
    }
  });

  return [selectedInstalmentPayments, selectedEarlyPayments];
}
