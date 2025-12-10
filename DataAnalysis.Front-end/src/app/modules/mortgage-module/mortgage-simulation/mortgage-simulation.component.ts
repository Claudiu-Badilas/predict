import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';
import { RepaymentSchedule } from '../models/mortgage.model';

@Component({
  selector: 'app-mortgage-simulation',
  imports: [CommonModule, SideBarModule, ToggleButtonComponent],
  templateUrl: './mortgage-simulation.component.html',
  styleUrls: ['./mortgage-simulation.component.scss'],
})
export class MortgageSimulationComponent {
  transactions: RepaymentSchedule[] = [];

  constructor(private store: Store<fromAppStore.AppState>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage/${module.toLocaleLowerCase()}`,
      })
    );
  }
}
