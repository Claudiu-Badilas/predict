import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-module/state-management/mortgage-loan.reducer';
import { Colors } from 'src/app/shared/styles/colors';

@Component({
  selector: 'app-mortgage-loan-detailed-body',
  imports: [CommonModule],
  templateUrl: './mortgage-loan-detailed-body.component.html',
  styleUrl: './mortgage-loan-detailed-body.component.scss',
})
export class MortgageLoanDetailedBodyComponent {
  updatedBaseRepaymentScheduleBasedOnLatestStates$ = this.store.select(
    fromMortgageLoan.getUpdatedBaseRepaymentScheduleBasedOnLatestStates
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  colors = Colors;
}
