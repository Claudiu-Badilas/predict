import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, filter, map, take } from 'rxjs';
import * as fromMortgageLoan from 'src/app/modules/mortgage-module/state-management/mortgage-loan.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { LoanRatesSimulationTrendChartUtils } from './utils/loan-rates-simulation-trend.chart.util';

@Component({
  selector: 'app-mortgage-loan-simulator',
  imports: [
    CommonModule,
    SideBarModule,
    ToggleButtonComponent,
    HighchartWrapperComponent,
    DropdownSelectComponent,
  ],
  templateUrl: './mortgage-loan-simulator.component.html',
  styleUrl: './mortgage-loan-simulator.component.scss',
})
export class MortgageLoanSimulatorComponent {
  repaymentSchedules$ = this.store.select(
    fromMortgageLoan.getRepaymentSchedules
  );
  repaymentSchedulesOptions$ = this.repaymentSchedules$.pipe(
    map((rs) => rs.map((r) => r.name))
  );

  selectedValue$ = new BehaviorSubject<string>(null);
  mortgageLoanAmountChart$ = combineLatest([
    this.repaymentSchedules$,
    this.selectedValue$,
  ]).pipe(
    map(([rs, v]) =>
      LoanRatesSimulationTrendChartUtils.getChart(
        rs.find((r) => r.name === v)?.rate ?? []
      )
    )
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {
    this.repaymentSchedules$
      .pipe(
        filter((rs) => rs?.length > 0),
        take(1)
      )
      .subscribe((rs) => {
        this.selectedValue$.next(rs.at(0).name);
      });
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      })
    );
  }

  onDropdownSelected(event: string) {
    this.selectedValue$.next(event);
  }
}
