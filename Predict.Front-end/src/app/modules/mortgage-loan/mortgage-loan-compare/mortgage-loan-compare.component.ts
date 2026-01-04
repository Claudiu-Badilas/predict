import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, filter, map, take } from 'rxjs';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { MortgageLoanCompareBodyComponent } from './components/mortgage-loan-compare-body/mortgage-loan-compare-body.component';
import { CompareInterestTrendChartUtils } from './utils/compare-interest-rates-trend.chart.util';
import { CompareRatesTrendChartUtils } from './utils/compare-loan-rates-trend.chart.util';

@Component({
  selector: 'app-mortgage-loan-compare',
  imports: [
    CommonModule,
    SideBarModule,
    ToggleButtonComponent,
    MortgageLoanCompareBodyComponent,
    DropdownSelectComponent,
    HighchartWrapperComponent,
  ],
  templateUrl: './mortgage-loan-compare.component.html',
  styleUrls: ['./mortgage-loan-compare.component.scss'],
})
export class MortgageLoanCompareComponent {
  repaymentSchedules$ = this.store.select(
    fromMortgageLoan.getRepaymentSchedules
  );
  baseRepaymentSchedule$ = this.store.select(
    fromMortgageLoan.getBaseRepaymentSchedule
  );

  repaymentSchedulesOptions$ = this.repaymentSchedules$.pipe(
    map((rs) => rs.map((r) => r.name))
  );

  selectedLeftValue$ = new BehaviorSubject<string>(null);
  selectedRightValue$ = new BehaviorSubject<string>(null);

  leftRepaymentSchedules$ = combineLatest([
    this.repaymentSchedules$,
    this.selectedLeftValue$,
  ]).pipe(map(([rs, selected]) => rs.find((r) => r.name === selected)));

  rightRepaymentSchedules$ = combineLatest([
    this.repaymentSchedules$,
    this.selectedRightValue$,
  ]).pipe(map(([rs, selected]) => rs.find((r) => r.name === selected)));

  compareRatesTrendChart$ = combineLatest([
    this.baseRepaymentSchedule$,
    this.leftRepaymentSchedules$,
    this.rightRepaymentSchedules$,
  ]).pipe(
    map(([base, left, right]) =>
      CompareRatesTrendChartUtils.getChart(base, left, right)
    )
  );

  compareInterestTrendChart$ = combineLatest([
    this.baseRepaymentSchedule$,
    this.leftRepaymentSchedules$,
    this.rightRepaymentSchedules$,
  ]).pipe(
    map(([base, left, right]) =>
      CompareInterestTrendChartUtils.getChart(base, left, right)
    )
  );

  constructor(private store: Store<fromAppStore.AppState>) {
    this.repaymentSchedules$
      .pipe(
        filter((rs) => rs?.length > 0),
        take(1)
      )
      .subscribe((rs) => {
        this.selectedLeftValue$.next(rs.find((r) => r.isBasePayment).name);
        this.selectedRightValue$.next(
          rs.filter((r) => !r.isBasePayment).at(0).name
        );
      });
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      })
    );
  }

  onLeftDropdownSelected(event: string) {
    this.selectedLeftValue$.next(event);
  }

  onRightDropdownSelected(event: string) {
    this.selectedRightValue$.next(event);
  }
}
