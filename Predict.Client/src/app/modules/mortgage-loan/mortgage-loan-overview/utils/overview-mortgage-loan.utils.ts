import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import {
  OverviewLoanInstalment,
  OverviewRepaymentSchedule,
} from '../models/overview-mortgage-loan.model';

const PAYMENT_TYPES = {
  DISABLED: 'disabled',
  INSTALMENT: 'instalment',
  EARLY: 'early',
  NONE: 'none',
} as const;

export function mapBaseRepaymentScheduleToOverview(
  base: RepaymentSchedule | null,
  startDate: Date,
  selectedInstalmentPayments: number[],
  selectedEarlyPayments: number[],
): OverviewRepaymentSchedule | null {
  if (!base) return null;

  const overviewBaseLoanInstalments = createOverviewBaseLoanInstalments(
    base,
    startDate,
    selectedInstalmentPayments,
    selectedEarlyPayments,
  );

  const overviewLoanInstalments = createOverviewLoanInstalments(
    overviewBaseLoanInstalments,
  );

  return {
    name: base.name,
    overviewLoanInstalments,
  };
}

function createOverviewLoanInstalments(
  overviewBaseLoanInstalments: OverviewLoanInstalment[],
): OverviewLoanInstalment[] {
  const result: OverviewLoanInstalment[] = [];
  let earlyPaymentBatch: OverviewLoanInstalment[] = [];

  overviewBaseLoanInstalments.forEach((current, index, array) => {
    const next = array[index + 1];

    result.push(current);

    if (current.instalmentPayment) {
      earlyPaymentBatch = [current];
    } else if (current.earlyPayment) {
      earlyPaymentBatch.push(current);

      const isBatchComplete = next && !next.earlyPayment;
      if (isBatchComplete) {
        const summaryInstalment = createBatchSummary(earlyPaymentBatch);
        result.push(summaryInstalment);
      }
    }
  });

  return result;
}

function createBatchSummary(
  batch: OverviewLoanInstalment[],
): OverviewLoanInstalment {
  const firstInBatch = batch[0];
  const lastInBatch = batch[batch.length - 1];
  const hasInstalmentPayment = firstInBatch.instalmentPayment;

  const summaryData = {
    interestAmount: hasInstalmentPayment ? firstInBatch.interestAmount : 0,
    principalAmount: calculateBatchTotal(batch, 'principalAmount'),
    administrationFee: calculateBatchTotal(batch, 'administrationFee'),
    insuranceCost: calculateBatchTotal(batch, 'insuranceCost'),
    managementFee: calculateBatchTotal(batch, 'managementFee'),
    recalculatedInterest: calculateBatchTotal(batch, 'recalculatedInterest'),
    totalInstalment: calculateTotalInstalment(batch),
  };

  return {
    instalmentId: countEarlyPayments(batch),
    paymentDate: firstInBatch.newPaymentDate,
    newPaymentDate: lastInBatch.newPaymentDate,
    ...summaryData,
    remainingBalance: lastInBatch.remainingBalance,
    instalmentPayment: false,
    earlyPayment: false,
    disabled: true,
    totalRow: true,
    color: Colors.PINK_100,
  };
}

function calculateBatchTotal<T extends keyof OverviewLoanInstalment>(
  batch: OverviewLoanInstalment[],
  property: T,
): number {
  return Calculator.sum(batch.map((item) => item[property] as number));
}

function calculateTotalInstalment(batch: OverviewLoanInstalment[]): number {
  return Calculator.sum(
    batch.map((item) => {
      if (item.instalmentPayment) return item.totalInstalment;
      if (item.earlyPayment) item.principalAmount;
      return 0;
    }),
  );
}

function countEarlyPayments(batch: OverviewLoanInstalment[]): number {
  return batch.filter((item) => item.earlyPayment).length;
}

class DateStateManager {
  private newPaymentDate: Date | null = null;
  private isInstalmentDateUpdate = false;
  private isEarlyPayDateUpdate = false;
  private isFirstBaseIdentical = true;

  updateForInstalment(hasInstalmentPayment: boolean): void {
    if (hasInstalmentPayment) {
      this.isInstalmentDateUpdate = true;
    }
  }

  updateForEarlyPayment(
    previousHadInstalment: boolean,
    hasEarlyPayment: boolean,
  ): void {
    if (previousHadInstalment && hasEarlyPayment) {
      this.isEarlyPayDateUpdate = true;
    }
  }

  calculateNewPaymentDate(
    paymentDate: Date,
    instalmentPayment: boolean,
    earlyPayment: boolean,
  ): Date | null {
    if (!this.newPaymentDate && this.isInstalmentDateUpdate) {
      this.newPaymentDate = paymentDate;
      this.isInstalmentDateUpdate = false;
      return this.newPaymentDate;
    }

    if (this.isEarlyPayDateUpdate && this.newPaymentDate && earlyPayment) {
      this.newPaymentDate = JsDateUtils.addDays(this.newPaymentDate, 1);
      this.isEarlyPayDateUpdate = false;
      return this.newPaymentDate;
    }

    if (this.newPaymentDate && this.isInstalmentDateUpdate) {
      this.newPaymentDate = this.adjustDateForInstalment();
      this.isInstalmentDateUpdate = false;
      return this.newPaymentDate;
    }

    if (this.newPaymentDate && !instalmentPayment && !earlyPayment) {
      return this.handleRegularPayment();
    }

    return this.newPaymentDate;
  }

  private adjustDateForInstalment(): Date {
    return JsDateUtils.addMonths(
      JsDateUtils.addDays(this.newPaymentDate!, -1),
      1,
    );
  }

  private handleRegularPayment(): Date {
    if (this.isFirstBaseIdentical) {
      this.newPaymentDate = JsDateUtils.addDays(this.newPaymentDate!, -1);
      this.isFirstBaseIdentical = false;
    }

    this.newPaymentDate = JsDateUtils.addMonths(this.newPaymentDate!, 1);
    return this.newPaymentDate;
  }

  reset(): void {
    this.newPaymentDate = null;
    this.isInstalmentDateUpdate = false;
    this.isEarlyPayDateUpdate = false;
    this.isFirstBaseIdentical = true;
  }
}

function createOverviewBaseLoanInstalments(
  base: RepaymentSchedule,
  startDate: Date,
  selectedInstalmentPayments: number[],
  selectedEarlyPayments: number[],
): OverviewLoanInstalment[] {
  const dateManager = new DateStateManager();
  const selectedInstalmentSet = new Set(selectedInstalmentPayments);
  const selectedEarlyPaymentSet = new Set(selectedEarlyPayments);

  return base.monthlyInstalments.map((instalment, index, arr) => {
    const previousInstalment = arr[index - 1];

    const isDisabled = JsDateUtils.isSameOrBefore(
      instalment.paymentDate,
      startDate,
    );
    const hasInstalmentPayment = selectedInstalmentSet.has(
      instalment.instalmentId,
    );
    const hasEarlyPayment = selectedEarlyPaymentSet.has(
      instalment.instalmentId,
    );
    const previousHadInstalment = previousInstalment
      ? selectedInstalmentSet.has(previousInstalment?.instalmentId)
      : false;

    dateManager.updateForInstalment(hasInstalmentPayment);
    dateManager.updateForEarlyPayment(previousHadInstalment, hasEarlyPayment);

    const newPaymentDate = dateManager.calculateNewPaymentDate(
      instalment.paymentDate,
      hasInstalmentPayment,
      hasEarlyPayment,
    );

    const paymentType = determinePaymentType(
      isDisabled,
      hasInstalmentPayment,
      hasEarlyPayment,
    );

    return {
      instalmentId: instalment.instalmentId,
      paymentDate: instalment.paymentDate,
      newPaymentDate,
      interestAmount: instalment.interestAmount,
      principalAmount: instalment.principalAmount,
      administrationFee: instalment.administrationFee,
      insuranceCost: instalment.insuranceCost,
      managementFee: instalment.managementFee,
      recalculatedInterest: instalment.recalculatedInterest,
      totalInstalment: instalment.totalInstalment,
      remainingBalance: instalment.remainingBalance,
      instalmentPayment: !isDisabled && hasInstalmentPayment,
      earlyPayment: !isDisabled && hasEarlyPayment,
      disabled: isDisabled,
      color: getRowColor(paymentType),
      totalRow: false,
    };
  });
}

function determinePaymentType(
  isDisabled: boolean,
  hasInstalmentPayment: boolean,
  hasEarlyPayment: boolean,
): keyof typeof PAYMENT_TYPES {
  if (isDisabled) return 'DISABLED';
  if (hasInstalmentPayment) return 'INSTALMENT';
  if (hasEarlyPayment) return 'EARLY';
  return 'NONE';
}

function getRowColor(paymentType: keyof typeof PAYMENT_TYPES): string {
  const colorMap: Record<keyof typeof PAYMENT_TYPES, string> = {
    DISABLED: Colors.GRAY_200,
    INSTALMENT: Colors.BLUE_200,
    EARLY: Colors.GREEN_200,
    NONE: 'white',
  };

  return colorMap[paymentType] || 'white';
}
