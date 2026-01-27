import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';

type RowType = 'primary' | 'additional' | 'subtotal';

interface InstallmentRow {
  id: number;
  rataAnticipat: boolean;
  selected: boolean;
  number: number;
  paymentDate: string;
  creditRate: number;
  interestRate: number;
  adminFee: number;
  insuranceCost: number;
  managementFee: number;
  recalculatedInterest: number;
  totalRate: number;
  restantAmount: number;
  type: RowType;
}

interface Group {
  id: number;
  title: string;
  expanded: boolean;
  rows: InstallmentRow[];
}

interface ColumnConfig {
  key: keyof InstallmentRow | 'actions';
  label: string;
  visible: boolean;
}

@Component({
  selector: 'app-installment-table',
  imports: [CommonModule, FormsModule, NumberFormatPipe],
  templateUrl: './installment-table.component.html',
  styleUrls: ['./installment-table.component.scss'],
})
export class InstallmentTableComponent {
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('menuDropdown') menuDropdown!: ElementRef;

  isMenuOpen = false;

  columns: ColumnConfig[] = [
    { key: 'adminFee', label: 'Comision Administrare', visible: false },
    { key: 'insuranceCost', label: 'Costuri Asigurare', visible: false },
    { key: 'managementFee', label: 'Comision Management', visible: false },
    {
      key: 'recalculatedInterest',
      label: 'Rată Dobândă Recalculată',
      visible: false,
    },
    { key: 'restantAmount', label: 'Solt restant', visible: true },
  ];

  groups: Group[] = [
    {
      id: 1,
      title: 'Feb 2026',
      expanded: true,
      rows: [
        {
          id: 1,
          rataAnticipat: true,
          selected: true,
          number: 1,
          paymentDate: '2026-02-17',
          creditRate: 334.04,
          interestRate: 1376.4,
          adminFee: 50.0,
          insuranceCost: 76.73,
          managementFee: 25.0,
          recalculatedInterest: 1350.0,
          totalRate: 1787.17,
          restantAmount: 15000,
          type: 'primary',
        },
        {
          id: 2,
          rataAnticipat: false,
          selected: true,
          number: 2,
          paymentDate: '2026-02-18',
          creditRate: 335.65,
          interestRate: 1422.26,
          adminFee: 50.0,
          insuranceCost: 76.64,
          managementFee: 25.0,
          recalculatedInterest: 1400.0,
          totalRate: 1834.55,
          restantAmount: 14500,
          type: 'additional',
        },
        {
          id: 3,
          rataAnticipat: false,
          selected: true,
          number: 3,
          paymentDate: '2026-02-18',
          creditRate: 337.27,
          interestRate: 1420.64,
          adminFee: 50.0,
          insuranceCost: 76.55,
          managementFee: 25.0,
          recalculatedInterest: 1395.0,
          totalRate: 1844.47,
          restantAmount: 14000,
          type: 'additional',
        },
        {
          id: 4,
          rataAnticipat: false,
          selected: true,
          number: 4,
          paymentDate: '2026-03-17',
          creditRate: 338.9,
          interestRate: 1419.01,
          adminFee: 50.0,
          insuranceCost: 76.46,
          managementFee: 25.0,
          recalculatedInterest: 1390.0,
          totalRate: 1806.9,
          restantAmount: 13500,
          type: 'additional',
        },
      ],
    },
    {
      id: 2,
      title: 'April 2026',
      expanded: true,
      rows: [
        {
          id: 5,
          rataAnticipat: true,
          selected: true,
          number: 10,
          paymentDate: '2026-04-17',
          creditRate: 348.83,
          interestRate: 1409.08,
          adminFee: 50.0,
          insuranceCost: 75.93,
          managementFee: 25.0,
          recalculatedInterest: 1385.0,
          totalRate: 1833.84,
          restantAmount: 13000,
          type: 'primary',
        },
        {
          id: 6,
          rataAnticipat: false,
          selected: true,
          number: 11,
          paymentDate: '2026-04-18',
          creditRate: 350.51,
          interestRate: 1407.4,
          adminFee: 50.0,
          insuranceCost: 75.84,
          managementFee: 25.0,
          recalculatedInterest: 1380.0,
          totalRate: 1833.75,
          restantAmount: 12500,
          type: 'additional',
        },
        {
          id: 7,
          rataAnticipat: false,
          selected: true,
          number: 12,
          paymentDate: '2026-04-18',
          creditRate: 352.21,
          interestRate: 1405.7,
          adminFee: 50.0,
          insuranceCost: 75.75,
          managementFee: 25.0,
          recalculatedInterest: 1375.0,
          totalRate: 1833.66,
          restantAmount: 12000,
          type: 'additional',
        },
        {
          id: 8,
          rataAnticipat: false,
          selected: true,
          number: 13,
          paymentDate: '2026-04-18',
          creditRate: 353.91,
          interestRate: 1404,
          adminFee: 50.0,
          insuranceCost: 75.66,
          managementFee: 25.0,
          recalculatedInterest: 1370.0,
          totalRate: 1833.57,
          restantAmount: 11500,
          type: 'additional',
        },
        {
          id: 9,
          rataAnticipat: false,
          selected: false,
          number: 14,
          paymentDate: '2026-05-17',
          creditRate: 355.61,
          interestRate: 1402.3,
          adminFee: 50.0,
          insuranceCost: 75.56,
          managementFee: 25.0,
          recalculatedInterest: 1365.0,
          totalRate: 1833.47,
          restantAmount: 11000,
          type: 'additional',
        },
      ],
    },
    {
      id: 3,
      title: 'May 2026',
      expanded: false,
      rows: [
        {
          id: 10,
          rataAnticipat: true,
          selected: true,
          number: 15,
          paymentDate: '2026-05-17',
          creditRate: 348.83,
          interestRate: 1409.08,
          adminFee: 50.0,
          insuranceCost: 75.93,
          managementFee: 25.0,
          recalculatedInterest: 1385.0,
          totalRate: 1833.84,
          restantAmount: 10500,
          type: 'primary',
        },
        {
          id: 11,
          rataAnticipat: false,
          selected: true,
          number: 16,
          paymentDate: '2026-05-18',
          creditRate: 350.51,
          interestRate: 1407.4,
          adminFee: 50.0,
          insuranceCost: 75.84,
          managementFee: 25.0,
          recalculatedInterest: 1380.0,
          totalRate: 1833.75,
          restantAmount: 10000,
          type: 'additional',
        },
      ],
    },
  ];

  toggleGroup(group: Group) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: InstallmentRow) {
    row.selected = !row.selected;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.isMenuOpen &&
      this.menuContainer &&
      !this.menuContainer.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }

  isColumnVisible(key: string): boolean {
    const column = this.columns.find((col) => col.key === key);
    return column ? column.visible : true;
  }

  getSelectedRows(group: Group): InstallmentRow[] {
    return group.rows.filter((r) => r.selected);
  }

  getSubtotal(group: Group) {
    const selected = this.getSelectedRows(group);
    return {
      credit: selected.reduce((s, r) => s + r.creditRate, 0),
      interest: selected.reduce((s, r) => s + r.interestRate, 0),
      adminFee: selected.reduce((s, r) => s + r.adminFee, 0),
      insurance: selected.reduce((s, r) => s + r.insuranceCost, 0),
      managementFee: selected.reduce((s, r) => s + r.managementFee, 0),
      recalculatedInterest: selected.reduce(
        (s, r) => s + r.recalculatedInterest,
        0,
      ),
      total: selected.reduce((s, r) => s + r.totalRate, 0),
      restant: selected.reduce((s, r) => s + r.restantAmount, 0),
      count: selected.length,
    };
  }
}
