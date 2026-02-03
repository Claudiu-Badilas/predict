import {
  HistocialInstalmentPayment,
  HistocialInstalmentPaymentBatch,
} from '../models/base-loan-rate.model';

export namespace HistoricalInstalmentPaymentBatchesUtils {
  export function getHistocialInstalmentPaymentBatches(
    overviewBaseLoanInstalments: HistocialInstalmentPayment[],
  ): HistocialInstalmentPaymentBatch[] {
    if (!overviewBaseLoanInstalments?.length) return [];

    const batches: HistocialInstalmentPaymentBatch[] = [];
    let tempBatch: HistocialInstalmentPayment[] = [];

    overviewBaseLoanInstalments.forEach((current, index, array) => {
      const next = array[index + 1];

      tempBatch.push(current);

      if (current.instalmentPayment || current.earlyPayment) {
        if (next && !next.earlyPayment) {
          batches.push(new HistocialInstalmentPaymentBatch(tempBatch));
          tempBatch = [];
        }
      }
      if ((!current.instalmentPayment && !current.earlyPayment) || !next) {
        batches.push(new HistocialInstalmentPaymentBatch(tempBatch));
        tempBatch = [];
      }
    });

    return batches;
  }
}
