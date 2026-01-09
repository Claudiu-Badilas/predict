export type BaseLoanInstalment = {
  index: number;
  paymentDate: Date;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
  isNormalPayment: boolean;
  isExtraPayment: boolean;
};
