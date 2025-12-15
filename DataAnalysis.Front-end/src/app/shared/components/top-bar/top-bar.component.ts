import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  standalone: false,
})
export class TopBarComponent {
  modules = [
    { name: 'Mortgage Loan', url: 'mortgage-loan/overview' },
    { name: 'Transactions', url: 'transactions' },
    { name: 'Receipts', url: 'receipts/summary' },
    { name: 'Health', url: 'health' },
    { name: 'Settings', url: 'settings' },
    { name: 'Log out', url: 'authentication/logout' },
  ];

  constructor(private store: Store<fromAppStore.AppState>) {}

  onNavigateTo(url: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: url,
      })
    );
  }
}
