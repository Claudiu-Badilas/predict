export type OverviewLoanInstalment = {
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
  instalmentPayment: boolean;
  earlyPayment: boolean;
  disabled: boolean;
  color: string;
  totalRow: boolean;
};

export type OverviewRepaymentSchedule = {
  name: string;
  overviewLoanInstalments: OverviewLoanInstalment[];
};
