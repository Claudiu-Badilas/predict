export interface ColumnConfig {
  key:
    | 'administrationFee'
    | 'insuranceCost'
    | 'managementFee'
    | 'recalculatedInterest'
    | 'remainingBalance';
  label: string;
  visible: boolean;
}

export const DEFAULT_COLUMN_CONFIGS: ColumnConfig[] = [
  {
    key: 'administrationFee',
    label: 'Comision Administrare',
    visible: false,
  },
  { key: 'insuranceCost', label: 'Costuri Asigurare', visible: false },
  { key: 'managementFee', label: 'Comision Management', visible: false },
  {
    key: 'recalculatedInterest',
    label: 'Rată Dobândă Recalculată',
    visible: false,
  },
  { key: 'remainingBalance', label: 'Sold restant', visible: true },
];
