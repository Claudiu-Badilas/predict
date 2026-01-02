import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

@Component({
  selector: 'app-mortgage-loan-detailed',
  imports: [CommonModule, SideBarModule, ToggleButtonComponent],
  templateUrl: './mortgage-loan-detailed.component.html',
  styleUrl: './mortgage-loan-detailed.component.scss',
})
export class MortgageLoanDetailedComponent {
  constructor(private store: Store<fromAppStore.AppState>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      })
    );
  }
}
