import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';
import { GraficRambursare } from '../models/mortgage.model';

@Component({
  selector: 'app-mortgage-detailed',
  imports: [CommonModule, NgbModule, SideBarModule, ToggleButtonComponent],
  templateUrl: './mortgage-detailed.component.html',
  styleUrls: ['./mortgage-detailed.component.scss'],
})
export class MortgageDetailedComponent {
  transactions: GraficRambursare[] = [];

  constructor(private store: Store<fromAppStore.AppState>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage/${module.toLocaleLowerCase()}`,
      })
    );
  }
}
