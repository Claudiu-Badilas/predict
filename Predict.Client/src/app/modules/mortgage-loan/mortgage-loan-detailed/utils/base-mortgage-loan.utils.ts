import { Instalment, RepaymentSchedule } from '../../models/mortgage.model';
import { BaseLoanInstalment } from '../models/base-loan-rate.model';

export namespace BaseMortgageLoan {
  export function getUpdatedBaseRepaymentScheduleBasedOnLatestStates(
    base: RepaymentSchedule,
    repaymentSchedules: RepaymentSchedule[],
  ): BaseLoanInstalment[] {
    if (!base?.monthlyInstalments?.length) return [];

    const baseInstalments = [...base.monthlyInstalments];

    const schedules = repaymentSchedules
      .slice()
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const toBaseLoanInstalment = (
      additionalId: number,
      paymentDate: Date,
      instalment: Instalment,
      isNormalPayment: boolean,
      isExtraPayment: boolean,
    ): BaseLoanInstalment =>
      ({
        index: instalment.instalmentId + additionalId,
        paymentDate: paymentDate || instalment.paymentDate,
        principalAmount: instalment.principalAmount,
        interestAmount: instalment.interestAmount,
        remainingBalance: instalment.remainingBalance,
        isNormalPayment,
        isExtraPayment,
      }) satisfies BaseLoanInstalment;

    const calculatedBaseLoanInstalments = schedules.flatMap((schedule) => {
      const index = baseInstalments.length - schedule.monthlyInstalments.length;
      const instalments = baseInstalments.splice(0, index);

      return instalments.map((instalment) =>
        toBaseLoanInstalment(
          0,
          schedule.date,
          instalment,
          schedule.isNormalPayment,
          schedule.isExtraPayment,
        ),
      );
    });

    const unpaidInstalments = schedules
      .at(-1)
      .monthlyInstalments.map((instalment) =>
        toBaseLoanInstalment(
          calculatedBaseLoanInstalments.length,
          null,
          instalment,
          false,
          false,
        ),
      );

    return calculatedBaseLoanInstalments.concat(unpaidInstalments);
  }
}
