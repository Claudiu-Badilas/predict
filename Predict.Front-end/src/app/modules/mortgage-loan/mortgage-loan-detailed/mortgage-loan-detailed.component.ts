import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/state-management/mortgage-loan.reducer';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MortgageLoanDetailedBodyComponent } from './components/mortgage-loan-detailed-body/mortgage-loan-detailed-body.component';
import { MortgageLoanDetailedHeaderComponent } from './components/mortgage-loan-detailed-header/mortgage-loan-detailed-header.component';

@Component({
  selector: 'app-mortgage-loan-detailed',
  imports: [
    CommonModule,
    SideBarModule,
    ToggleButtonComponent,
    MortgageLoanDetailedHeaderComponent,
    MortgageLoanDetailedBodyComponent,
  ],
  templateUrl: './mortgage-loan-detailed.component.html',
  styleUrl: './mortgage-loan-detailed.component.scss',
})
export class MortgageLoanDetailedComponent {
  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      })
    );
  }
}
