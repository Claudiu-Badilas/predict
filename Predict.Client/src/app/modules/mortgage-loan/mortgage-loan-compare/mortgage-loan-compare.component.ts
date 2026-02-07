import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import * as MortgageLoanCompareActions from 'src/app/modules/mortgage-loan/mortgage-loan-compare/actions/mortgage-loan-compare.actions';
import * as fromMortgageLoanCompare from 'src/app/modules/mortgage-loan/mortgage-loan-compare/selectors/mortgage-loan-compare.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';

import { MortgageLoanCompareBodyComponent } from './components/mortgage-loan-compare-body/mortgage-loan-compare-body.component';
import { MortgageLoanCompareHeaderComponent } from './components/mortgage-loan-compare-header/mortgage-loan-compare-header.component';
import { CompareRatesTrendChartUtils } from './utils/compare-loan-rates-trend.chart.util';

@Component({
  selector: 'app-mortgage-loan-compare',
  imports: [
    CommonModule,
    SideBarComponent,
    ToggleButtonComponent,
    DropdownSelectComponent,
    HighchartWrapperComponent,
    CheckboxComponent,
    MortgageLoanCompareHeaderComponent,
    MortgageLoanCompareBodyComponent,
  ],
  templateUrl: './mortgage-loan-compare.component.html',
  styleUrls: ['./mortgage-loan-compare.component.scss'],
})
export class MortgageLoanCompareComponent {
  repaymentSchedules = toSignal(
    this.store.select(fromMortgageLoan.getRepaymentSchedules),
    { initialValue: [] },
  );

  baseRepaymentSchedule = toSignal(
    this.store.select(fromMortgageLoan.getBaseRepaymentSchedule),
  );

  includeBase = signal<boolean>(true);
  selectedLeftValue = toSignal(
    this.store.select(
      fromMortgageLoanCompare.getLeftSelectedRepaymentScheduleName,
    ),
  );

  selectedRightValue = toSignal(
    this.store.select(
      fromMortgageLoanCompare.getRightSelectedRepaymentScheduleName,
    ),
  );

  repaymentSchedulesOptions = computed(() => [
    'No Selection',
    ...this.repaymentSchedules().map((r) => r.name),
  ]);

  leftRepaymentSchedule = computed(() =>
    this.repaymentSchedules().find((r) => r.name === this.selectedLeftValue()),
  );

  rightRepaymentSchedule = computed(() =>
    this.repaymentSchedules().find((r) => r.name === this.selectedRightValue()),
  );

  includeBaseRepaymentSchedule = computed(() =>
    this.includeBase() ? this.baseRepaymentSchedule() : null,
  );

  compareRatesTrendChart = computed(() =>
    CompareRatesTrendChartUtils.getChart(
      this.includeBaseRepaymentSchedule(),
      this.leftRepaymentSchedule(),
      this.rightRepaymentSchedule(),
    ),
  );

  constructor(private store: Store<fromAppStore.AppState>) {
    effect(() => {
      const rs = this.repaymentSchedules();
      if (rs.length > 0 && !this.selectedLeftValue()) {
        const firstNonBase = rs.find((r) => !r.isBasePayment);
        if (firstNonBase) {
          this.store.dispatch(
            MortgageLoanCompareActions.selectedLeftMortgageLoanChanged({
              selected: firstNonBase.name,
            }),
          );
        }
      }
    });
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      }),
    );
  }

  onIncludeBase(checked: boolean) {
    this.includeBase.set(checked);
  }

  onLeftDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanCompareActions.selectedLeftMortgageLoanChanged({
        selected: value,
      }),
    );
  }

  onRightDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanCompareActions.selectedRightMortgageLoanChanged({
        selected: value,
      }),
    );
  }
}
