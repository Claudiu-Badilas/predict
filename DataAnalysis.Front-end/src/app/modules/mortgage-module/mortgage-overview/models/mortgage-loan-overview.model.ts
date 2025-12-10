import { DateUtils } from 'src/app/shared/utils/date.utils';
import { RepaymentSchedule } from '../../models/mortgage.model';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { Colors } from 'src/app/shared/styles/colors';

export type OverviewLoanRate = {
  nrCtr: number | null;
  dataPlatii: string | null;
  rataDobanda: number | null;
  rataCredit: number | null;
  comisionAdministrare: number | null;
  costuruAsigurare: number | null;
  comisionGestiune: number | null;
  dobadaRecalculata: number | null;
  totalRata: number | null;
  soldRestPlata: number | null;
  nextRate: boolean;
  selected: boolean;
  disabled: boolean;
  color: string;
};

export type OverviewRepaymentSchedule = {
  name: string;
  overviewLoanRates: OverviewLoanRate[];
};

export function mapBaseRepaymentScheduleToOverview(
  base: RepaymentSchedule,
  startDate: Date,
  selectedLoanRates: number[]
): OverviewRepaymentSchedule | null {
  if (!base) return null;

  let availableNextRate = false;

  const overviewLoanRates: OverviewLoanRate[] = base.rate.map((r) => {
    const disabled = JsDateUtils.isBefore(
      DateUtils.fromStringToJsDate(r.dataPlatii.split('T')[0]),
      startDate
    );
    const nextRate = !availableNextRate && !disabled;
    if (nextRate) availableNextRate = true;

    const selected = selectedLoanRates.some((s) => s === r.nrCtr);
    return {
      nrCtr: r.nrCtr,
      dataPlatii: r.dataPlatii,
      rataDobanda: r.rataDobanda,
      rataCredit: r.rataCredit,
      comisionAdministrare: r.comisionAdministrare,
      costuruAsigurare: r.costuruAsigurare,
      comisionGestiune: r.comisionGestiune,
      dobadaRecalculata: r.dobadaRecalculata,
      totalRata: r.totalRata,
      soldRestPlata: r.soldRestPlata,
      nextRate,
      selected: (!disabled && selected) || nextRate,
      disabled: disabled || nextRate,
      color: getColor(disabled, nextRate, selected),
    } as OverviewLoanRate;
  });

  return {
    name: base.name,
    overviewLoanRates,
  } as OverviewRepaymentSchedule;
}
function getColor(
  disabled: boolean,
  nextRate: boolean,
  selected: boolean
): string {
  if (disabled) return Colors.GRAY_200;
  if (nextRate) return Colors.BLUE_100;
  if (selected) return Colors.GREEN_100;
  return 'white';
}
