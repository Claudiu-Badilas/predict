import { RepaymentSchedule } from '../../models/mortgage.model';
import {
  MonthlyInstalmentManager as MonthlyInstalmentBatch,
  OverviewLoanInstalment,
} from '../models/overview-mortgage-loan.model';
import { createOverviewBaseLoanInstalments } from './overview-mortgage-loan.utils';

export function generateMonthlyInstalmentBatches(
  base: RepaymentSchedule | null,
  startDate: Date,
  selectedInstalmentPayments: number[],
  selectedEarlyPayments: number[],
): MonthlyInstalmentBatch[] {
  if (!base) return [];

  const overviewBaseLoanInstalments = createOverviewBaseLoanInstalments(
    base,
    startDate,
    selectedInstalmentPayments,
    selectedEarlyPayments,
  );

  const monthlyInstalmentBatches = createMonthlyInstalmentBatches(
    overviewBaseLoanInstalments,
  );

  return monthlyInstalmentBatches;
}

function createMonthlyInstalmentBatches(
  overviewBaseLoanInstalments: OverviewLoanInstalment[],
): MonthlyInstalmentBatch[] {
  const batches: MonthlyInstalmentBatch[] = [];
  let tempBatch: OverviewLoanInstalment[] = [];

  overviewBaseLoanInstalments.forEach((current, index, array) => {
    const next = array[index + 1];

    tempBatch.push(current);

    if (current.instalmentPayment || current.earlyPayment) {
      if (next && !next.earlyPayment) {
        const batch = new MonthlyInstalmentBatch(tempBatch, {
          compleated: true,
        });
        batches.push(batch);
        tempBatch = [];
      }
    }
    if ((!current.instalmentPayment && !current.earlyPayment) || !next) {
      const batch = new MonthlyInstalmentBatch(tempBatch, {
        compleated: false,
      });
      batches.push(batch);
      tempBatch = [];
    }
  });

  return batches;
}
