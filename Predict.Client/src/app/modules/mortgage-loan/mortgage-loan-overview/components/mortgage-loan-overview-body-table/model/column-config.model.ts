export interface ColumnConfig {
  key:
    | 'administrationFee'
    | 'insuranceCost'
    | 'managementFee'
    | 'recalculatedInterest'
    | 'halfTotal'
    | 'earlyPayment'
    | 'remainingBalance';
  label: string;
  visible: boolean;
}

export const DEFAULT_COLUMN_CONFIGS: ColumnConfig[] = [
  {
    key: 'administrationFee',
    label: 'Administrare',
    visible: false,
  },
  { key: 'insuranceCost', label: 'PAD', visible: false },
  { key: 'managementFee', label: 'Management', visible: false },
  {
    key: 'recalculatedInterest',
    label: 'Dobândă Recalculată',
    visible: false,
  },
  { key: 'halfTotal', label: '1/2', visible: false },
  { key: 'earlyPayment', label: 'Anticipat', visible: false },
  { key: 'remainingBalance', label: 'Sold Ramas', visible: true },
];
