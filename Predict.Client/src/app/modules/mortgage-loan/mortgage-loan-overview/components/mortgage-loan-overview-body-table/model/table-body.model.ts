import { OverviewLoanRate } from '../../../models/overview-mortgage-loan.model';

export type TableColumn = {
  key: keyof OverviewLoanRate | 'rata' | 'anticipat';
  label: string;
  visible: boolean;
};
