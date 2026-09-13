import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Component,
  effect,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoanSimulator from 'src/app/modules/loan/loan-simulator/selectors/loan-simulator.selectors';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { NumericInputComponent } from 'src/app/shared/components/numeric-input/numeric-input.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { LoanSimulatorBodyTableComponent } from './components/loan-simulator-body-table/loan-simulator-body-table.component';
import { LoanSimulatorHeaderComponent } from './components/loan-simulator-header/loan-simulator-header.component';
import { mapInstalmentSimulation } from './utils/instalment-simulation.utils';
import { FooToggleComponent } from 'src/app/shared/components/foo-toggle/foo-toggle.component';

export interface SimulationRow {
  id: string;
  monthlyAmount: number | null;
  payments: number | null;
}

type SimulationRowForm = FormGroup<{
  id: FormControl<string>;
  monthlyAmount: FormControl<number | null>;
  payments: FormControl<number | null>;
}>;

@Component({
  selector: 'p-loan-simulator',
  imports: [
    CommonModule,
    DropdownSelectComponent,
    LoanSimulatorHeaderComponent,
    LoanSimulatorBodyTableComponent,
    NumericInputComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
    FooToggleComponent,
  ],
  templateUrl: './loan-simulator.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./loan-simulator.component.scss'],
})
export class LoanSimulatorComponent {
  monthlyInstalmentBatches = toSignal(
    this.store.select(fromLoanSimulator.getMonthlyInstalmentBatches),
  );
  selectedRepaymentScheduleName$ = this.store.select(
    fromLoanSimulator.getSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));

  selectedRepaymentScheduleBase = toSignal(
    this.store.select(fromLoanSimulator.getSelectedRepaymentSchedule),
  );
  calculateRepaymentSchedules = toSignal(
    this.store.select(fromLoan.getCalculateRepaymentSchedules),
  );

  /** LocalStorage key */
  private readonly simulationRowsKey = 'LoanSimulator_SimulationRows';

  /** Multiple simulation combinations — defaults to a single row */
  simulationRows = signal<SimulationRow[]>(this.loadRows());
  readonly simulationForm = new FormGroup({
    rows: new FormArray<SimulationRowForm>([]),
  });
  readonly simulationRowsFormArray = this.simulationForm.controls.rows;

  constructor(
    private readonly store: Store<fromLoan.LoanState>,
    private readonly _localStorageService: LocalStorageService,
  ) {
    this.simulationRows().forEach((row) =>
      this.simulationRowsFormArray.push(this.createRowForm(row)),
    );
    this.updatePaymentValidators();
    this.simulationForm.updateValueAndValidity();
    this.simulationForm.markAllAsTouched();
    this.simulationRowsFormArray.valueChanges.subscribe(() =>
      this.syncRowsFromForm(),
    );

    // Recompute + dispatch simulation for every row whenever inputs change
    effect(() => {
      const rows = this.simulationRows();
      const schedule = this.selectedRepaymentScheduleBase();
      this.updatePaymentValidators(schedule?.monthlyInstalments.length);
      const instalmentPayments: number[] = [];
      const earlyPayments: number[] = [];

      rows.forEach((row) => {
        const startOf = instalmentPayments.length + earlyPayments.length;
        const [instalment, early] = mapInstalmentSimulation(schedule, startOf, {
          monthlyAmount: row.monthlyAmount,
          payments: row.payments,
        });
        instalmentPayments.push(...(instalment ?? []));
        earlyPayments.push(...(early ?? []));
      });

      this.store.dispatch(
        LoanActions.simulateInstalmentPaymentsChanged({
          selectedInstalmentPayments: instalmentPayments,
          selectedEarlyPayments: earlyPayments,
        }),
      );
    });

    // Persist rows on any change
    effect(() => {
      this._localStorageService.setItem(
        this.simulationRowsKey,
        this.simulationRows(),
      );
    });
  }

  // --- Row mutations ---

  addRow(): void {
    if (this.simulationForm.invalid) {
      this.simulationForm.markAllAsTouched();
      return;
    }

    this.simulationRowsFormArray.push(
      this.createRowForm(this.createEmptyRow(this.simulationRows())),
    );
    this.updatePaymentValidators();
    this.syncRowsFromForm();
  }

  removeRow(id: string): void {
    // Guard: always keep at least one combination
    if (this.simulationRows().length === 1) {
      return;
    }
    const rowIndex = this.simulationRowsFormArray.controls.findIndex(
      (row) => row.controls.id.value === id,
    );
    if (rowIndex >= 0) {
      this.simulationRowsFormArray.removeAt(rowIndex);
      this.updatePaymentValidators();
      this.syncRowsFromForm();
    }
  }

  // --- Load / persist helpers ---

  private loadRows(): SimulationRow[] {
    const stored = this._localStorageService.getItem(this.simulationRowsKey);
    if (Array.isArray(stored) && stored.length > 0) {
      return stored as SimulationRow[];
    }

    return [{ id: this.newId(), monthlyAmount: 3750, payments: 1 }];
  }

  private createEmptyRow(existing: SimulationRow[]): SimulationRow {
    // Pre-fill from the last row for convenience
    const last = existing[existing.length - 1];
    return {
      id: this.newId(),
      monthlyAmount: last?.monthlyAmount ?? 3750,
      payments: last?.payments ?? 1,
    };
  }

  private createRowForm(row: SimulationRow): SimulationRowForm {
    return new FormGroup({
      id: new FormControl(row.id, { nonNullable: true }),
      monthlyAmount: new FormControl(row.monthlyAmount, {
        validators: [Validators.required, Validators.min(0)],
      }),
      payments: new FormControl(row.payments, {
        validators: [Validators.min(0)],
      }),
    });
  }

  private updatePaymentValidators(maxPayments?: number): void {
    this.simulationRowsFormArray.controls.forEach((row, index, rows) => {
      const validators = [Validators.min(1)];
      if (maxPayments !== undefined) {
        validators.push(Validators.max(maxPayments));
      }
      if (index < rows.length - 1) {
        validators.unshift(Validators.required);
      }
      row.controls.payments.setValidators(validators);
      row.controls.payments.updateValueAndValidity({ emitEvent: false });
    });
  }

  private syncRowsFromForm(): void {
    this.simulationRows.set(this.simulationRowsFormArray.getRawValue());
  }

  private newId(): string {
    return `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // --- Existing handlers ---

  onDropdownSelected(value: string) {
    this.store.dispatch(LoanActions.selectedLoanChanged({ selected: value }));
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/loan/${module.toLowerCase()}`,
      }),
    );
  }

  onCalculateRepaymentSchedulesChanged(state: boolean) {
    this.store.dispatch(
      LoanActions.calculateRepaymentSchedulesChanged({
        calculateRepaymentSchedules: state,
      }),
    );

    this.store.dispatch(LoanActions.loadRepaymentSchedules());
  }
}
