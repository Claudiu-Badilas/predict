import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Inject,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import { LoanStore } from 'src/app/modules/loan/stores/loan.store';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { FooToggleComponent } from 'src/app/shared/components/foo-toggle/foo-toggle.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { AppState } from 'src/app/store/app-state.reducer';
import { LoanDetailedBodyComponent } from './components/loan-detailed-body/loan-detailed-body.component';
import { LoanDetailedHeaderComponent } from './components/loan-detailed-header/loan-detailed-header.component';

@Component({
  selector: 'p-loan-detailed',
  imports: [
    CommonModule,
    LoanDetailedHeaderComponent,
    LoanDetailedBodyComponent,
    DropdownSelectComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
    FooToggleComponent,
  ],
  templateUrl: './loan-detailed.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loan-detailed.component.scss',
})
export class LoanDetailedComponent {
  selectedRepaymentScheduleName = this.loanStore.detailedSelectedName;
  dropDownSelectOptions = computed(() =>
    this.loanStore.repaymentSchedules().map((schedule) => schedule.name),
  );
  calculateRepaymentSchedules = this.loanStore.calculateRepaymentSchedules;
  constructor(
    private store: Store<AppState>,
    @Inject(LoanStore)
    private readonly loanStore: InstanceType<typeof LoanStore>,
  ) {}

  onDropdownSelected(value: string) {
    this.loanStore.selectDetailedLoan(value);
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/loan/${module.toLowerCase()}`,
      }),
    );
  }

  onCalculateRepaymentSchedulesChanged(state: boolean) {
    this.loanStore.setCalculateRepaymentSchedules(state);

    this.store.dispatch(LoanActions.loadRepaymentSchedules());
  }
}
