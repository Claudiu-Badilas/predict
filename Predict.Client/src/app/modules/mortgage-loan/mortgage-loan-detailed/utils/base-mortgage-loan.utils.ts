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
      .filter((rs) => !rs.isBasePayment)
      .slice()
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const toBaseLoanInstalment = (
      instalment: Instalment,
      isNormalPayment: boolean,
      isExtraPayment: boolean,
    ): BaseLoanInstalment =>
      ({
        index: instalment.instalmentId,
        paymentDate: instalment.paymentDate,
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
          instalment,
          schedule.isNormalPayment,
          schedule.isExtraPayment,
        ),
      );
    });

    const unpaidInstalments = baseInstalments.map((instalment) =>
      toBaseLoanInstalment(instalment, false, false),
    );

    return calculatedBaseLoanInstalments.concat(unpaidInstalments);
  }
}
