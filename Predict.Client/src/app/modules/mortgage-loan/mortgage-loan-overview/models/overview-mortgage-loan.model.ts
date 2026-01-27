export type OverviewLoanInstalment = {
  instalmentId: number | null;
  paymentDate: Date | null;
  newPaymentDate: Date | null;
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

export class MonthlyInstalmentManager {
  public compleated: boolean = false;
  public expanded: boolean = true;
  public id: number;
  public title: string;

  constructor(
    public instalments: OverviewLoanInstalment[],
    { compleated = false, expanded = true } = {},
  ) {
    this.compleated = compleated;
    this.expanded = expanded;
    this.id = instalments[0]?.instalmentId ?? 0;
    this.title = instalments[0]?.newPaymentDate
      ? instalments[0].newPaymentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        })
      : 'Unknown Date';
  }
}
