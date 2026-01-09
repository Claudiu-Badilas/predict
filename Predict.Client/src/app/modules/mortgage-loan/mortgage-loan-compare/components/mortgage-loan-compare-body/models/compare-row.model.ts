import { Instalment } from 'src/app/modules/mortgage-loan/models/mortgage.model';

export type CompareRow = {
  id: number;
  left: Instalment;
  right: Instalment;
};
