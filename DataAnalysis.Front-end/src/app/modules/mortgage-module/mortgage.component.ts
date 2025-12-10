import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as MortgageActions from 'src/app/modules/mortgage-module/state-management/mortgage.actions';
import * as fromMortgage from 'src/app/modules/mortgage-module/state-management/mortgage.reducer';

@Component({
  selector: 'app-mortgage',
  templateUrl: './mortgage.component.html',
  styleUrls: ['./mortgage.component.scss'],
  standalone: false,
})
export class MortgageComponent {
  constructor(private readonly store: Store<fromMortgage.MortgageState>) {
    this.store.dispatch(MortgageActions.loadRepaymentSchedules());
  }
}
