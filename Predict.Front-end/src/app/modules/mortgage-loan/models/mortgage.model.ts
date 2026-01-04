import { DateUtils } from 'src/app/shared/utils/date.utils';

export type RataDto = {
  nrCtr: number;
  dataPlatii: string;
  rataDobanda: number;
  rataCredit: number;
  comisionAdministrare: number;
  costuruAsigurare: number;
  comisionGestiune: number;
  dobadaRecalculata: number;
  totalRata: number;
  soldRestPlata: number;
};

export type RepaymentScheduleDto = {
  name: string;
  rate: RataDto[];
  date: string;
  isBasePayment: boolean;
  isNormalPayment: boolean;
  isExtraPayment: boolean;
};

export class Rata {
  nrCtr: number;
  dataPlatii: Date;
  rataDobanda: number;
  rataCredit: number;
  comisionAdministrare: number;
  costuruAsigurare: number;
  comisionGestiune: number;
  dobadaRecalculata: number;
  totalRata: number;
  soldRestPlata: number;

  constructor(res: RataDto) {
    Object.assign(this, res);

    this.dataPlatii = DateUtils.fromSplittedStringToJsDate(res.dataPlatii);
  }
}

export class RepaymentSchedule {
  name: string;
  rate: Rata[];
  date: Date;
  isBasePayment: boolean;
  isNormalPayment: boolean;
  isExtraPayment: boolean;

  constructor(res: RepaymentScheduleDto) {
    Object.assign(this, res);

    this.date = DateUtils.fromSplittedStringToJsDate(res.date);
    this.rate = res.rate.map((r) => new Rata(r));
  }
}
