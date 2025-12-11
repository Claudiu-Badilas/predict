import { Colors } from 'src/app/shared/styles/colors';
import { DateUtils } from 'src/app/shared/utils/date.utils';

export interface TransactionResponse {
  id: number | null;
  registrationDate: string | null;
  completionDate: string | null;
  amount: number | null;
  fee: number | null;
  currency: string | null;
  description: string | null;
  transactionType: string | null;
  provider: string | null;
  referenceId: number | null;
}

export class TransactionDomain {
  id: number | null;
  registrationDate: Date | null;
  completionDate: Date | null;
  amount: number | null;
  fee: number | null;
  currency: string | null;
  description: string | null;
  transactionType: string | null;
  provider: string | null;
  referenceId: number | null;

  serviceProvider: string;
  color: string;

  constructor(res: TransactionResponse) {
    Object.assign(this, res);

    this.registrationDate = DateUtils.fromStringToJsDate(
      res.registrationDate.split('T')[0]
    );
    this.completionDate = DateUtils.fromStringToJsDate(
      res.completionDate.split('T')[0]
    );

    this.serviceProvider = res.description?.split('|')[0] ?? null;
    this.color = this.amount > 0 ? Colors.GREEN_100 : 'white';
  }
}
