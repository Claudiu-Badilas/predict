import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-module/state-management/mortgage-loan.reducer';

@Component({
  selector: 'app-mortgage-loan-detailed',
  imports: [
    CommonModule,
    SideBarModule,
    ToggleButtonComponent,
    HighchartWrapperComponent,
  ],
  templateUrl: './mortgage-loan-detailed.component.html',
  styleUrl: './mortgage-loan-detailed.component.scss',
})
export class MortgageLoanDetailedComponent {
  mortgageLoanProgressChart$ = this.store.select(
    fromMortgageLoan.getMortgageLoanProgressChart
  );
  mortgageLoanAmountChartUtils$ = this.store.select(
    fromMortgageLoan.getMortgageLoanAmountChartUtils
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      })
    );
  }
}
